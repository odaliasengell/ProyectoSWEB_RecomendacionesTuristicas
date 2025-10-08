import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class UpdateReservaDto {
  @IsNumber()
  @IsOptional()
  id_tour?: number;

  @IsNumber()
  @IsOptional()
  id_usuario?: number;

  @IsDateString()
  @IsOptional()
  fecha_reserva?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  cantidad_personas?: number;

  @IsString()
  @IsOptional()
  estado?: string;
}
