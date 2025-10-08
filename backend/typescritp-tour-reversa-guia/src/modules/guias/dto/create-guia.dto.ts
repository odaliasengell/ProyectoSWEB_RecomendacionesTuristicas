import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateGuiaDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del guía es obligatorio' })
  id_guia!: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'Los idiomas son obligatorios' })
  @MaxLength(50)
  idiomas!: string;

  @IsString()
  @IsNotEmpty({ message: 'La experiencia es obligatoria' })
  experiencia!: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(20)
  telefono!: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  calificacion?: number;
}