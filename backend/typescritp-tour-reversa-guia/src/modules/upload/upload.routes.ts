import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configurar carpeta de uploads (ruta desde la raíz del proyecto)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'tours');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Asegurar que la carpeta existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('📁 Carpeta de uploads creada:', UPLOAD_DIR);
} else {
  console.log('📁 Usando carpeta de uploads:', UPLOAD_DIR);
}

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${random}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error(`Formato no permitido. Solo se permiten: ${ALLOWED_EXTENSIONS.join(', ')}`));
    return;
  }
  
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('El archivo debe ser una imagen'));
    return;
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter
  // Sin límite de tamaño
});

/**
 * POST /admin/upload/tour
 * Sube una imagen para un tour
 */
router.post('/tour', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        detail: 'No se proporcionó ningún archivo' 
      });
    }

    const fileUrl = `http://localhost:3000/uploads/tours/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error: any) {
    console.error('Error subiendo imagen de tour:', error);
    res.status(500).json({ 
      success: false,
      detail: error.message || 'Error al subir imagen' 
    });
  }
});

/**
 * DELETE /admin/upload/tour/:filename
 * Elimina una imagen de tour
 */
router.delete('/tour/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        detail: 'Imagen no encontrada'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error: any) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      detail: error.message || 'Error al eliminar imagen'
    });
  }
});

// Middleware de manejo de errores de multer
router.use((error: any, req: Request, res: Response, next: Function) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      detail: error.message
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      detail: error.message
    });
  }
  
  next();
});

export default router;
