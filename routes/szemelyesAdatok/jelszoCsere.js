import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { updatePassword, getPassword } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/jelszocsere', (req, res) => {
  console.log('bent az jelszo csereben');
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  res.render('jelszoCsere', {
    err: 0,
    errmess: '',
    bej: req.session.username,
  });
});

router.post('/jelszocsereform', express.urlencoded({ extended: true }), async (req, res) => {
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  const data = req.body;
  const expected = Joi.object({
    f8kod: Joi.string().required(),
    f8koduj: Joi.string().required(),
    f8koduj2: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Hibas jelszo!');
    res.render('jelszoCsere', {
      err: 1,
      errmess: 'Hibás jelszó',
      bej: req.session.username,
    });
    return;
  }

  if (data.f8koduj !== data.f8koduj2) {
    console.log('Hibas jelszo!');
    res.render('jelszoCsere', {
      err: 1,
      errmess: 'Nem talál a két jelszó',
      bej: req.session.username,
    });
    return;
  }
  try {
    const id = req.session.userid;
    const em = req.session.email;
    const newKod = data.f8koduj;
    const datkod = await getPassword(em);
    const match = await bcrypt.compare(data.f8kod, datkod[0][0].Kod);
    if (!match) {
      console.log('Helytelen jelszo!');
      res.render('jelszoCsere', {
        err: 1,
        errmess: 'Nem helyes jelszó',
        bej: req.session.username,
      });
      return;
    }
    const hashedKod = await bcrypt.hash(newKod, 10);
    await updatePassword(id, hashedKod);
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba történt a jelszó cseréléskor, kérlek próbáld újra!',
    });
    return;
  }
  res.redirect('/kijelentkezes');
  console.log('Sikeres jelszo csere');
});

export default router;
