import express from 'express';
import Joi from 'joi';
import { getPalyak, getPalyak2 } from '../db/dbPalyak.js';
import { getminmaxnev } from '../utils/utils.js';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('bent a klienszurben');
  let data = req.query;
  let results = {};
  data = getminmaxnev(data);
  let bejelentkezesTipus = '';
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
  } else {
    bejelentkezesTipus = 'Vendeg';
  }

  const expected = Joi.object({
    f3orabermin: Joi.number().min(0).required(),
    f3orabermax: Joi.number().min(0).max(100000).required(),
    palyakkliens: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a kliensszurnel!');
    res.render('index', {
      bej: bejelentkezesTipus,
      resul: results[0],
      err: 1,
      errmess: error.details[0].message,
    });
    return;
  }
  const min = parseInt(data.f3orabermin, 10);
  const max = parseInt(data.f3orabermax, 10);

  if (min > max) {
    console.log('Helytelen kliensszurnel, min > max miatt!');
    res.render('index', {
      bej: bejelentkezesTipus,
      resul: results[0],
      err: 1,
      errmess: 'Helytelen kliensszurnel, min > max miatt!',
    });
    return;
  }
  try {
    if (data.palyakkliens === 'osszes') {
      results = await getPalyak2(data.f3orabermin, data.f3orabermax);
    } else {
      results = await getPalyak(data.palyakkliens, data.f3orabermin, data.f3orabermax);
    }
    console.log('szurunk palyat az infok alapjan');
    console.log(data);

    if (results[0].length === 0) {
      console.log('Nincs keresett palya');
      res.render('index', {
        bej: bejelentkezesTipus,
        resul: results[0],
        err: 1,
        errmess: 'Nincs keresett palya',
      });
      return;
    }
    res.render('index', {
      bej: bejelentkezesTipus,
      resul: results[0],
      err: 0,
      errmess: '',
    });
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba a fooldal betoltesekor, probald ujra!',
    });
  }
});

export default router;
