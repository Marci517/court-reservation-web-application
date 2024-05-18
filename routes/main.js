import express from 'express';
import Joi from 'joi';
import { addPalya, getPalyak, getPalyak2 } from '../db/db.js';
import { getminmaxnev } from '../utils/utils.js';

const router = express.Router();

router.post('/palyabevezet', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a palyabevezetben');
  const data = req.body;

  const expected = Joi.object({
    palyak: Joi.string().required(),
    f0oraber: Joi.number().min(0).max(100000).required(),
    f0cim: Joi.string().required(),
    f0leiras: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a palyabevezetnel!');
    res.render('bevezet', {
      err: 1,
    });
    return;
  }

  await addPalya(data.palyak, data.f0oraber, data.f0cim, data.f0leiras);
  res.redirect('/');
  console.log('Sikeres feltoltes');
});

router.get('/', async (req, res) => {
  console.log('bent a klienszurben');
  let data = req.query;
  let results = {};
  data = getminmaxnev(data);

  const expected = Joi.object({
    f3orabermin: Joi.number().min(0).required(),
    f3orabermax: Joi.number().min(0).max(100000).required(),
    palyakkliens: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a kliensszurnel!');
    res.render('index', {
      resul: results[0],
      err: 3,
    });
    return;
  }
  const min = parseInt(data.f3orabermin, 10);
  const max = parseInt(data.f3orabermax, 10);

  if (min > max) {
    console.log('Helytelen kliensszurnel, min > max miatt!');
    res.render('index', {
      resul: results[0],
      err: 2,
    });
    return;
  }

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
      resul: results[0],
      err: 1,
    });
    return;
  }
  res.render('index', {
    resul: results[0],
    err: 0,
  });
});

export default router;
