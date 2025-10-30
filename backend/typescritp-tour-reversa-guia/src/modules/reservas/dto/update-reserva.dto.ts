import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class UpdateReservaDto {
  @IsNumber()
  @IsOptional()
  id_tour?: number;

  // Soportar tanto string como number para compatibilidad con microservicios
  @IsOptional()
  id_usuario?: string | number;

  @IsDateString()
  @IsOptional()
  fecha_reserva?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  cantidad_personas?: number;

  @IsNumber()
  @IsOptional()
  precio_total?: number;

  @IsString()
  @IsOptional()
  comentarios?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}
