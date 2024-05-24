import express from 'express';
import { getPalya } from '../db/dbPalyak.js';

const router = express.Router();

router.get('/:PID', (req, res) => {
  const { PID } = req.params;
  console.log('PID:');
  console.log(PID);
  getPalya(PID)
    .then((result) => {
      if (result[0][0]) {
        res.json(result[0][0]);
      } else {
        res.status(404).json({ message: `Palya ID: ${PID} nincs meg.` });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: `Hiba a palya keresesenel ID: ${PID}: ${err.message}` });
    });
});
export default router;
