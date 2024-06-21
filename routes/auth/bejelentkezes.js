import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { getIdByEmail, getPassword, getName, getHaElfogadott } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/bejelentkezes', (req, res) => {
  console.log('bent a bejelentkezesben');
  if (req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
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
      error: 'Az oldal nem elérhető!',
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
      errmess: 'Hibás email vagy jelszó',
    });
    return;
  }

  try {
    const id = await getIdByEmail(data.f6email);
    if (id[0].length === 0) {
      console.log('Nem letezik ilyen email!');
      res.render('bejelentkezes', {
        err: 1,
        errmess: 'Nem helyes email cím vagy jelszó',
      });
      return;
    }
    const datkod = await getPassword(data.f6email);
    const match = await bcrypt.compare(data.f6kod, datkod[0][0].Kod);
    if (!match) {
      console.log('Helytelen jelszo!');
      res.render('bejelentkezes', {
        err: 1,
        errmess: 'Nem helyes email cím vagy jelszó',
      });
      return;
    }
    console.log(id[0][0].FID);

    const elfogadott = await getHaElfogadott(id[0][0].FID); // ha az admin engedelyezte vagy sem
    console.log(elfogadott[0]);
    if (elfogadott[0][0].Elfogadott === 0) {
      console.log('Nincs engedely meg!');
      res.render('bejelentkezes', {
        err: 1,
        errmess: 'Nincs hitelesítve a profilja! Kérjük várjon, majd probálja újra!',
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
      error: 'Hiba történt a bejelentkezéskor, kérlek próbáld újra!',
    });
    return;
  }
  res.redirect('/');
  console.log('Sikeres regisztralas');
});

export default router;
