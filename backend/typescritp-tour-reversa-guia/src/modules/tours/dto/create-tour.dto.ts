import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, Min, MaxLength } from 'class-validator';

export class CreateTourDto {
  @IsNumber()
  @IsOptional()
  id_tour?: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion!: string;

  @IsString()
  @IsNotEmpty({ message: 'La duración es obligatoria' })
  @MaxLength(50)
  duracion!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  precio!: number;

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