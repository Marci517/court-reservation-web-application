import express from 'express';
import { getPalya } from '../../db/dbPalyak.js';
import { getFelhasznalokNevei } from '../../db/dbFelhasznalok.js';
import { getFoglalasok } from '../../db/dbFoglalasok.js';

const router = express.Router();

router.get('/reszletek', async (req, res) => {
  let bejelentkezesTipus = '';
  let user = 0;
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
    user = req.session.userid;
  } else {
    bejelentkezesTipus = 'Vendeg';
  }
  console.log('bent a reszeletekben');
  const pid = req.query;
  try {
    const [result, felhasznalok, foglalasok] = await Promise.all([
      getPalya(pid.id),
      getFelhasznalokNevei(),
      getFoglalasok(pid.id),
    ]);
    let fogcheck = 0;
    if (foglalasok[0].length === 0) {
      fogcheck = 1;
    }
    console.log(result[0]);
    res.render('reszletek', {
      userid: user,
      bej: bejelentkezesTipus,
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 0,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba a palya informacioi listazasanal!',
    });
  }
});

export default router;
