import express from 'express';
import { getFelhasznalokNeveiNemElfogadott, updateElfogadott } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/engedelykeresek', async (req, res) => {
  if (req.session.username !== 'admin') {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  const resul = await getFelhasznalokNeveiNemElfogadott();
  console.log(resul);
  res.render('admin/engedelykeresek', {
    err: 0,
    errmess: '',
    bej: req.session.username,
    result: resul[0],
  });
});

router.post('/engedfel', express.urlencoded({ extended: true }), async (req, res) => {
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
    await updateElfogadott(fid);
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba történt az engedélykéréseknél, kérlek próbáld újra!',
    });
    return;
  }
  res.redirect('/');
});

export default router;
