import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { updateNev, getPassword } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/nevcsere', (req, res) => {
  console.log('bent az email csereben');
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elerheto!',
    });
    return;
  }
  res.render('nevCsere', {
    err: 0,
    errmess: '',
  });
});

router.post('/nevcsereform', express.urlencoded({ extended: true }), async (req, res) => {
  const data = req.body;
  const expected = Joi.object({
    f8nev: Joi.string().required(),
    f8kod: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Hibas nev vagy jelszo!');
    res.render('nevCsere', {
      err: 1,
      errmess: 'Hibas nev vagy jelszo',
    });
    return;
  }

  try {
    const id = req.session.userid;
    const em = req.session.email;
    const newNev = data.f8nev;
    const datkod = await getPassword(em);
    const match = await bcrypt.compare(data.f8kod, datkod[0][0].Kod);
    if (!match) {
      console.log('Helytelen jelszo!');
      res.render('nevCsere', {
        err: 1,
        errmess: 'Nem helyes uj nev vagy jelszo',
      });
      return;
    }
    await updateNev(id, newNev);
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba tortent a nev csereleskor, kerlek probald ujra!',
    });
  }
  res.redirect('/kijelentkezes');
  console.log('Sikeres nev csere');
});

export default router;
