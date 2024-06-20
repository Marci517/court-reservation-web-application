import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { updateEmail, getPassword, getIdByEmail } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/emailcsere', (req, res) => {
  console.log('bent az email csereben');
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elerheto!',
    });
    return;
  }
  res.render('emailCsere', {
    err: 0,
    errmess: '',
  });
});

router.post('/emailcsereform', express.urlencoded({ extended: true }), async (req, res) => {
  const data = req.body;
  const expected = Joi.object({
    f7email: Joi.string().email().required(),
    f7kod: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Hibas email cim vagy jelszo!');
    res.render('emailCsere', {
      err: 1,
      errmess: 'Hibas email vagy jelszo',
    });
    return;
  }

  try {
    const id = req.session.userid;
    const em = req.session.email;
    const newEmail = data.f7email;
    const datkod = await getPassword(em);
    const [match, id2] = await Promise.all([bcrypt.compare(data.f7kod, datkod[0][0].Kod), getIdByEmail(newEmail)]);

    if (id2[0].length !== 0) {
      console.log('Az email mar hasznalatban!');
      res.render('emailCsere', {
        err: 1,
        errmess: 'Hiba tortent a email cserenel, adj meg mas emailt!',
      });
      return;
    }
    if (!match) {
      console.log('Helytelen jelszo!');
      res.render('emailCsere', {
        err: 1,
        errmess: 'Nem helyes uj email cim vagy jelszo',
      });
      return;
    }
    await updateEmail(id, newEmail);
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba tortent a email csereleskor, kerlek probald ujra!',
    });
    return;
  }
  res.redirect('/kijelentkezes');
  console.log('Sikeres email csere');
});

export default router;
