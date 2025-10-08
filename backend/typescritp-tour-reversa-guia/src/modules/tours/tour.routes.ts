import { Router } from 'express';
import { TourController } from './tour.controller';

const router = Router();
const tourController = new TourController();

// GET /api/tours - Obtener todos los tours
router.get('/', (req, res) => tourController.getAll(req, res));

// GET /api/tours/disponibles - Obtener tours disponibles
router.get('/disponibles', (req, res) => tourController.getAvailable(req, res));

// GET /api/tours/:id - Obtener tour por ID
router.get('/:id', (req, res) => tourController.getById(req, res));

// POST /api/tours - Crear nuevo tour
router.post('/', (req, res) => tourController.create(req, res));

// PUT /api/tours/:id - Actualizar tour
router.put('/:id', (req, res) => tourController.update(req, res));

// PATCH /api/tours/:id/disponibilidad - Cambiar disponibilidad
router.patch('/:id/disponibilidad', (req, res) => tourController.toggleDisponibilidad(req, res));

// DELETE /api/tours/:id - Eliminar tour
router.delete('/:id', (req, res) => tourController.delete(req, res));

export default router;