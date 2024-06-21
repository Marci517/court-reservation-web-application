import express from 'express';
import extendsRoutes from './extends.js';
import imagesRoutes from './images.js';
// apik bekotese
const router = express.Router();
router.use('/extends', extendsRoutes);
router.use('/images', imagesRoutes);

export default router;
