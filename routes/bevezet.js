import express from 'express';
import Joi from 'joi';
import { addPalya } from '../db/db.js';

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
      errmess: error.details[0].message,
    });
    return;
  }

  await addPalya(data.palyak, data.f0oraber, data.f0cim, data.f0leiras);
  res.redirect('/');
  console.log('Sikeres feltoltes');
});

export default router;
