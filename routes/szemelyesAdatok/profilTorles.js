import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { torlesFelhasznalo, getPassword, torlesFoglalas } from '../../db/dbFelhasznalok.js';

const router = express.Router();

router.get('/profiltorlese', (req, res) => {
  console.log('bent a profil torleseben csereben');
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  res.render('profilTorlese', {
    err: 0,
    errmess: '',
    bej: req.session.username,
  });
});

router.post('/profiltorlesform', express.urlencoded({ extended: true }), async (req, res) => {
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  const data = req.body;
  const expected = Joi.object({
    f10kod: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Hibas jelszo!');
    res.render('profilTorlese', {
      err: 1,
      errmess: 'Hibás jelszó',
      bej: req.session.username,
    });
    return;
  }

  try {
    const id = req.session.userid;
    const em = req.session.email;
    const datkod = await getPassword(em);
    const match = await bcrypt.compare(data.f10kod, datkod[0][0].Kod);

    if (!match) {
      console.log('Helytelen jelszo!');
      res.render('profilTorlese', {
        err: 1,
        errmess: 'Nem helyes jelszó',
        bej: req.session.username,
      });
      return;
    }
    await torlesFoglalas(id);
    await torlesFelhasznalo(id);
  } catch (err) {
    console.log(err);
    res.render('error', {
      error: 'Hiba történt a profil törlésekor, kérlek próbáld újra!',
    });
    return;
  }
  res.redirect('/kijelentkezes');
  console.log('Sikeres profil torles');
});

export default router;
