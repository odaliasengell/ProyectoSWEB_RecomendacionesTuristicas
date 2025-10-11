import { Request, Response } from 'express';
import { Recomendacion } from '../models/recomendacion';
import { getRecomendaciones } from '../services/recomendacionesService';

export const obtenerRecomendaciones = async (req: Request, res: Response): Promise<void> => {
    try {
        const recomendaciones: Recomendacion[] = await getRecomendaciones();
        res.status(200).json(recomendaciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recomendaciones', error });
    }
};