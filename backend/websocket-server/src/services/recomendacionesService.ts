import { Recomendacion } from '../models/recomendacion';

export class RecomendacionesService {
    private recomendaciones: Recomendacion[];

    constructor() {
        this.recomendaciones = [];
    }

    public agregarRecomendacion(recomendacion: Recomendacion): void {
        this.recomendaciones.push(recomendacion);
    }

    public obtenerRecomendaciones(): Recomendacion[] {
        return this.recomendaciones;
    }

    public buscarRecomendacion(id: string): Recomendacion | undefined {
        return this.recomendaciones.find(rec => rec.id === id);
    }
}