import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { getIdByEmail, getPassword, getName } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/bejelentkezes', (req, res) => {
  console.log('bent a bejelentkezesben');
  if (req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elerheto!',
    });
    return;
  }
  res.render('bejelentkezes', {
    err: 0,
    errmess: '',
  });
});

router.post('/bejelentkezesform', express.urlencoded({ extended: true }), async (req, res) => {
  if (req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elerheto!',
    });
    return;
  }
  const data = req.body;
  const expected = Joi.object({
    f6email: Joi.string().email().required(),
    f6kod: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Hibas email cim vagy jelszo!');
    res.render('bejelentkezes', {
      err: 1,
      errmess: 'Hibas email vagy jelszo',
    });
    return;
  }

  try {
    const id = await getIdByEmail(data.f6email);
    if (id[0].length === 0) {
      console.log('Nem letezik ilyen email!');
      res.render('bejelentkezes', {
        err: 1,
        errmess: 'Nem helyes email cim vagy jelszo',
      });
      return;
    }
    const datkod = await getPassword(data.f6email);
    const match = await bcrypt.compare(data.f6kod, datkod[0][0].Kod);
    if (!match) {
      console.log('Helytelen jelszo!');
      res.render('bejelentkezes', {
        err: 1,
        errmess: 'Nem helyes email cim vagy jelszo',
      });
      return;
    }

    req.session.userid = id[0][0].FID;
    const nev = await getName(id[0][0].FID);
    req.session.username = nev[0][0].FelNev;
    req.session.email = data.f6email;
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba tortent a bejelentkezeskor, kerlek probald ujra!',
    });
    return;
  }
  res.redirect('/');
  console.log('Sikeres regisztralas');
});

export default router;
