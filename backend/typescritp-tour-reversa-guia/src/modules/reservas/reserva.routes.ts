import { Router } from 'express';
import { ReservaController } from './reserva.controller';

const router = Router();
const reservaController = new ReservaController();

router.get('/', (req, res) => reservaController.getAll(req, res));
router.get('/:id', (req, res) => reservaController.getById(req, res));
router.get('/usuario/:id_usuario', (req, res) => reservaController.getByUsuario(req, res));
router.post('/', (req, res) => reservaController.create(req, res));
router.put('/:id', (req, res) => reservaController.update(req, res));
router.delete('/:id', (req, res) => reservaController.delete(req, res));

export default router;
