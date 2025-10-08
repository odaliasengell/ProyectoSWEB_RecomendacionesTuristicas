import { Router } from 'express';
import { GuiaController } from './guia.controller';

const router = Router();
const guiaController = new GuiaController();

// GET /api/guias - Obtener todos los guías
router.get('/', (req, res) => guiaController.getAll(req, res));

// GET /api/guias/disponibles - Obtener guías disponibles
router.get('/disponibles', (req, res) => guiaController.getAvailable(req, res));

// GET /api/guias/:id - Obtener guía por ID
router.get('/:id', (req, res) => guiaController.getById(req, res));

// POST /api/guias - Crear nuevo guía
router.post('/', (req, res) => guiaController.create(req, res));

// PUT /api/guias/:id - Actualizar guía
router.put('/:id', (req, res) => guiaController.update(req, res));

// PATCH /api/guias/:id/disponibilidad - Cambiar disponibilidad
router.patch('/:id/disponibilidad', (req, res) => guiaController.toggleDisponibilidad(req, res));

// DELETE /api/guias/:id - Eliminar guía
router.delete('/:id', (req, res) => guiaController.delete(req, res));

export default router;