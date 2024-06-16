import express from 'express';
import { deleteFoglalas } from '../../db/dbFoglalasok.js';

const router = express.Router();

router.post('/torlesfog', express.urlencoded({ extended: true }), async (req, res) => {
  const data = req.body;
  console.log(data);
  const fogId = data.FogID;
  try {
    console.log(fogId);
    const result = await deleteFoglalas(fogId);
    console.log(result);
    if (!result) {
      res.render('error', {
        error: 'Hiba tortent a foglalas torlesenel, kerlek probald ujra!',
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba tortent a foglalas torlesenel, kerlek probald ujra!',
    });
    return;
  }
  res.redirect('/');
});

export default router;
