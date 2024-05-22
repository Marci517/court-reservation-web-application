import express from 'express';
import path from 'path';
import { deleteKep } from '../db/dbKepek.js';
import { uploadDir } from '../uploadConfigs/uploadConfigs.js';
import { deleteFile } from '../utils/utils.js';

const router = express.Router();

router.delete('/:FNev', (req, res) => {
  const { FNev } = req.params;
  console.log('FNev:');
  console.log(FNev);
  const filePath = path.join(uploadDir, FNev);
  deleteFile(filePath);
  deleteKep(FNev)
    .then((rows) => (rows ? res.sendStatus(204) : res.status(404).json({ message: `Kep ID: ${FNev} nincs meg.` })))
    .catch((err) => res.status(500).json({ message: `Hiba a kep torlesenel ID: ${FNev}: ${err.message}` }));
});
export default router;
