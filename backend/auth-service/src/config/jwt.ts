import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const KEY_DIR = path.join(__dirname, '../../keys');

// Generar o cargar claves RSA
export function getOrCreateRSAKeys() {
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true });
  }

  const privateKeyPath = path.join(KEY_DIR, 'private.pem');
  const publicKeyPath = path.join(KEY_DIR, 'public.pem');

  // Si las claves ya existen, usarlas
  if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    return {
      privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
      publicKey: fs.readFileSync(publicKeyPath, 'utf8'),
    };
  }

  // Generar nuevas claves
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Guardar claves
  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  console.log('🔑 Claves RSA generadas');

  return { privateKey, publicKey };
}

// JWT Config
export const jwtConfig = {
  secret:
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
  expiration: parseInt(process.env.JWT_EXPIRATION || '900'), // 15 minutos en segundos
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_token_key',
  refreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800'), // 7 días
};

// Bcrypt config
export const bcryptConfig = {
  saltRounds: 12,
};

// Validación de contraseñas
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Contraseña debe tener al menos 8 caracteres',
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      valid: false,
      error:
        'Contraseña debe contener mayúscula, minúscula, número y carácter especial',
    };
  }

  return { valid: true };
}

// Validación de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
