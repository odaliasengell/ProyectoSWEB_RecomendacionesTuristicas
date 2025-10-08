import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min, MaxLength } from 'class-validator';

export class UpdateTourDto {
  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  duracion?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  precio?: number;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'La capacidad máxima debe ser al menos 1' })
  capacidad_maxima?: number;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;

  @IsNumber()
  @IsOptional()
  id_guia?: number;
}