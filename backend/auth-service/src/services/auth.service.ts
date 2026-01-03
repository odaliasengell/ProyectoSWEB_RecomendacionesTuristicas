import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../main';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { TokenBlacklist } from '../entities/token-blacklist.entity';
import {
  jwtConfig,
  bcryptConfig,
  validatePassword,
  validateEmail,
} from '../config/jwt';
import { getRedisClient } from '../config/redis';
import crypto from 'crypto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  private blacklistRepository = AppDataSource.getRepository(TokenBlacklist);

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ userId: string; email: string }> {
    // Validar email
    if (!validateEmail(email)) {
      throw new Error('Email inválido');
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    // Verificar si email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, bcryptConfig.saltRounds);

    // Crear usuario
    const user = this.userRepository.create({
      email,
      passwordHash,
      name: name || email.split('@')[0],
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    console.log(`👤 Usuario registrado: ${savedUser.email}`);

    return {
      userId: savedUser.id,
      email: savedUser.email,
    };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    // Buscar usuario
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new Error('Usuario desactivado');
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Guardar refresh token
    const tokenHash = crypto
      .createHash('sha256')
      .update(tokens.refreshToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + jwtConfig.refreshExpiration * 1000);

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Almacenar en Redis para validación rápida
    const redis = await getRedisClient();
    if (redis) {
      await redis.setEx(
        `rt:${user.id}:${tokenHash}`,
        jwtConfig.refreshExpiration,
        'valid'
      );
    }

    console.log(`🔐 Usuario logueado: ${user.email}`);

    return tokens;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      // Decodificar sin verificar por ahora
      const decoded = jwt.decode(refreshToken) as TokenPayload;

      if (!decoded || !decoded.userId) {
        throw new Error('Token inválido');
      }

      // Verificar que el token no esté expirado
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Refresh token expirado');
      }

      // Buscar usuario
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });
      if (!user || !user.isActive) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Verificar que el refresh token existe en la BD
      const tokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
      const savedToken = await this.refreshTokenRepository.findOne({
        where: { userId: user.id, tokenHash, revoked: false },
      });

      if (!savedToken) {
        throw new Error('Refresh token revocado o no encontrado');
      }

      // Generar nuevos tokens
      const newTokens = this.generateTokens(user.id, user.email);

      // Guardar nuevo refresh token
      const newTokenHash = crypto
        .createHash('sha256')
        .update(newTokens.refreshToken)
        .digest('hex');
      const newExpiresAt = new Date(
        Date.now() + jwtConfig.refreshExpiration * 1000
      );

      const newRefreshToken = this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      });

      await this.refreshTokenRepository.save(newRefreshToken);

      // Revocar token anterior
      savedToken.revoked = true;
      await this.refreshTokenRepository.save(savedToken);

      // Actualizar Redis
      const redis = await getRedisClient();
      if (redis) {
        await redis.del(`rt:${user.id}:${tokenHash}`);
        await redis.setEx(
          `rt:${user.id}:${newTokenHash}`,
          jwtConfig.refreshExpiration,
          'valid'
        );
      }

      console.log(`🔄 Token refrescado para usuario: ${user.email}`);

      return newTokens;
    } catch (error) {
      throw new Error(`Error refrescando token: ${error.message}`);
    }
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    // Revocar todos los refresh tokens del usuario
    const refreshTokens = await this.refreshTokenRepository.find({
      where: { userId, revoked: false },
    });

    for (const token of refreshTokens) {
      token.revoked = true;
      await this.refreshTokenRepository.save(token);
    }

    // Agregar accessToken a blacklist
    try {
      const decoded = jwt.decode(accessToken) as TokenPayload;
      if (decoded && decoded.exp) {
        const tokenHash = crypto
          .createHash('sha256')
          .update(accessToken)
          .digest('hex');
        const expiresAt = new Date(decoded.exp * 1000);

        const blacklistedToken = this.blacklistRepository.create({
          tokenHash,
          expiresAt,
          reason: 'logout',
        });

        await this.blacklistRepository.save(blacklistedToken);

        // Agregar a Redis para validación rápida
        const redis = await getRedisClient();
        if (redis) {
          const ttl = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
          if (ttl > 0) {
            await redis.setEx(`bl:${tokenHash}`, ttl, 'blacklisted');
          }
        }
      }
    } catch (error) {
      console.error('Error agregando token a blacklist:', error);
    }

    // Limpiar Redis
    const redis = await getRedisClient();
    if (redis) {
      for (const token of refreshTokens) {
        await redis.del(`rt:${userId}:${token.tokenHash}`);
      }
    }

    console.log(`👋 Usuario deslogueado: ${userId}`);
  }

  async getUser(
    userId: string
  ): Promise<{ id: string; email: string; name: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      // Verificar en blacklist primero
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const blacklisted = await this.blacklistRepository.findOne({
        where: { tokenHash },
      });

      if (blacklisted) {
        throw new Error('Token revocado');
      }

      // Verificar JWT
      const decoded = jwt.verify(token, jwtConfig.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error(`Token inválido: ${error.message}`);
    }
  }

  private generateTokens(userId: string, email: string): AuthTokens {
    const accessToken = jwt.sign(
      {
        userId,
        email,
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiration,
      }
    );

    const refreshToken = jwt.sign(
      {
        userId,
        email,
      },
      jwtConfig.refreshSecret,
      {
        expiresIn: jwtConfig.refreshExpiration,
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.expiration,
    };
  }
}

export const authService = new AuthService();
