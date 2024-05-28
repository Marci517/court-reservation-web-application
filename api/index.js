import express from 'express';
import extendsRoutes from './extends.js';
import imagesRoutes from './images.js';

const router = express.Router();
router.use('/extends', extendsRoutes);
router.use('/images', imagesRoutes);

export default router;
