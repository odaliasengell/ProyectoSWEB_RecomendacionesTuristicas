import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class UpdateGuiaDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  idiomas?: string;

  @IsString()
  @IsOptional()
  experiencia?: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  calificacion?: number;
}