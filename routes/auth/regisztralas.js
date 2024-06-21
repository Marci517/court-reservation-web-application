import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { addFelhasznalok, getId, getIdByEmail } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/regisztralas', (req, res) => {
  console.log('bent a regisztralasban');
  if (req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }

  res.render('regisztralas', {
    err: 0,
    errmess: '',
  });
});

router.post('/regisztralasform', express.urlencoded({ extended: true }), async (req, res) => {
  const data = req.body;
  const expected = Joi.object({
    f5nev: Joi.string().required(),
    f5email: Joi.string().email().required(),
    f5kod: Joi.string().required(),
    f5kodu: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a regisztralasnal!');
    res.render('regisztralas', {
      err: 1,
      errmess: error.details[0].message,
    });
    return;
  }
  if (data.f5kod !== data.f5kodu) {
    console.log('A jelszavak nem egyeznek!');
    res.render('regisztralas', {
      err: 1,
      errmess: 'A jelszavak nem egyeznek',
    });
    return;
  }

  try {
    const [kod, id, id2] = await Promise.all([
      // az id-k arra szolgalnak, hogy megnezzem mar vane ilyen nev, email az adatbazisban
      bcrypt.hash(data.f5kod, 10),
      getId(data.f5nev),
      getIdByEmail(data.f5email),
    ]);
    if (id[0].length !== 0) {
      console.log('Mar letezik ilyen nevu felhasznalo!');
      res.render('regisztralas', {
        err: 1,
        errmess: 'Hiba történt regisztráláskor, adj meg más felhasználónevet!',
      });
      return;
    }

    if (id2[0].length !== 0) {
      console.log('Az email mar hasznalatban!');
      res.render('regisztralas', {
        err: 1,
        errmess: 'Hiba történt regisztráláskor, adj meg más emailt!',
      });
      return;
    }
    await addFelhasznalok(data.f5nev, data.f5email, kod);
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba történt a felhasználó hozzáadásakor, kérlek próbáld újra!',
    });
    return;
  }
  res.redirect('/bejelentkezes');
  console.log('Sikeres regisztralas');
});

export default router;
