import express from 'express';
import { deleteFoglalas } from '../../db/dbFoglalasok.js';

const router = express.Router();

router.post('/torlesfog', express.urlencoded({ extended: true }), async (req, res) => {
  const data = req.body;
  if (!req.session.username) {
    res.render('error', {
      error: 'Hiba történt a foglalás közben, próbáld újra!',
    });
  }
  console.log(data);
  const fogId = data.FogID;
  try {
    console.log(fogId);
    const result = await deleteFoglalas(fogId);
    console.log(result);
    if (!result) {
      res.render('error', {
        error: 'Hiba történt a foglalás közben, próbáld újra!',
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba történt a foglalás közben, próbáld újra!',
    });
    return;
  }
  res.redirect('/');
});

export default router;
