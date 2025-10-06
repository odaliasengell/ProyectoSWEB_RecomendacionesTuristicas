import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';

export class CreateReservaDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del tour es obligatorio' })
  id_tour!: number;

  @IsNumber()
  @IsNotEmpty({ message: 'El ID del usuario/cliente es obligatorio' })
  id_usuario!: number;

  @IsDateString({}, { message: 'La fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'La fecha de reserva es obligatoria' })
  fecha_reserva!: string;

  @IsNumber()
  @Min(1, { message: 'Debe haber al menos 1 persona en la reserva' })
  cantidad_personas!: number;

  @IsString()
  @IsOptional()
  estado?: string; // "pendiente", "confirmada", "cancelada"
}
