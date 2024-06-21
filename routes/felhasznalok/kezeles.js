import express from 'express';
import { getFelhasznalokNevei, torlesFelhasznalo, torlesFoglalas } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/kezeles', async (req, res) => {
  if (req.session.username !== 'admin') {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  const resul = await getFelhasznalokNevei();
  console.log(resul);
  res.render('admin/felhasznalokTorlese', {
    err: 0,
    errmess: '',
    bej: req.session.username,
    result: resul[0],
  });
});

router.post('/torlesfel', express.urlencoded({ extended: true }), async (req, res) => {
  if (req.session.username !== 'admin') {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  const data = req.body;
  console.log(data);
  const fid = data.FID;
  try {
    console.log(fid);
    await torlesFoglalas(fid);
    await torlesFelhasznalo(fid);
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba történt a felhasználó törlésénél, kérlek próbáld újra!',
    });
    return;
  }
  res.redirect('/');
});

export default router;
