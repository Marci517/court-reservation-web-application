import express from 'express';
import Joi from 'joi';
import { addPalya } from '../db/dbPalyak.js';

const router = express.Router();

router.get('/bevezet', (req, res) => {
  console.log('bent a bevezetben');
  res.render('bevezet', {
    err: 0,
    errmess: 'Helytelen bemenet',
  });
});

router.post('/palyabevezet', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a palyabevezetben');
  const data = req.body;
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  const expected = Joi.object({
    palyak: Joi.string().required(),
    f0oraber: Joi.number().min(0).max(100000).required(),
    f0cim: Joi.string().required(),
    f0leiras: Joi.string().required(),
    f0kezd: Joi.string().pattern(regex).required(),
    f0vegez: Joi.string().pattern(regex).required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a palyabevezetnel!');
    res.render('bevezet', {
      err: 1,
      errmess: error.details[0].message,
    });
    return;
  }

  await addPalya(data.palyak, data.f0oraber, data.f0cim, data.f0leiras, data.f0kezd, data.f0vegez);
  res.redirect('/');
  console.log('Sikeres feltoltes');
});

export default router;
