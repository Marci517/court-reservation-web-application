import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { updateNev, getPassword, getIdByNev } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/nevcsere', (req, res) => {
  console.log('bent az email csereben');
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  res.render('adatok/nevCsere', {
    err: 0,
    errmess: '',
    bej: req.session.username,
  });
});

router.post('/nevcsereform', express.urlencoded({ extended: true }), async (req, res) => {
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  const data = req.body;
  const expected = Joi.object({
    f8nev: Joi.string().required(),
    f8kod: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Hibás név vagy jelszó!');
    res.render('adatok/nevCsere', {
      err: 1,
      errmess: 'Hibás név vagy jelszó!',
      bej: req.session.username,
    });
    return;
  }

  try {
    const id = req.session.userid;
    const em = req.session.email;
    const newNev = data.f8nev;
    const datkod = await getPassword(em);
    const [match, id2] = await Promise.all([bcrypt.compare(data.f8kod, datkod[0][0].Kod), getIdByNev(newNev)]);

    if (id2[0].length !== 0) {
      console.log('A nev mar hasznalatban!');
      res.render('adatok/nevCsere', {
        err: 1,
        errmess: 'Hiba történt a név cserénél, adj meg más nevet!',
        bej: req.session.username,
      });
      return;
    }
    if (!match) {
      console.log('Helytelen jelszo!');
      res.render('adatok/nevCsere', {
        err: 1,
        errmess: 'Nem helyes új név vagy jelszó',
        bej: req.session.username,
      });
      return;
    }
    await updateNev(id, newNev);
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba történt a név cseréléskor, kérlek próbáld újra!',
    });
    return;
  }
  res.redirect('/kijelentkezes');
  console.log('Sikeres nev csere');
});

export default router;
