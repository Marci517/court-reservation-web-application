import express from 'express';
import { getPalya } from '../../db/dbPalyak.js';
import { getFoglalasok, getOverlaps, addFoglalas, getOverlaps2 } from '../../db/dbFoglalasok.js';

const router = express.Router();

router.post('/foglalas', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a foglalasban');
  const bejelentkezesTipus = req.session.username;
  const user = req.session.userid;
  const data = req.body;
  try {
    const [result, foglalasok] = await Promise.all([getPalya(data.f4palyaid), getFoglalasok(data.f4palyaid)]);
    let fogcheck = 0;
    if (foglalasok[0].length === 0) {
      fogcheck = 1;
    }
    console.log(data);
    if (!req.session.userid) {
      res.render('reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 2,
        errmess: 'Nem vagy bejelentkezve!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
    }
    const felid = req.session.userid;
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(data.f4kezd) || !regex.test(data.f4kezd)) {
      console.log('Helytelen bemenet a foglalasnal!');
      res.render('reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 2,
        errmess: 'Helytelen bemenet a foglalasnal!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    const [ellenorzo1, ellenorzo2] = await Promise.all([
      getOverlaps(data.f4palyaid, data.f4kezd, data.f4vegez),
      getOverlaps2(data.f4palyaid, data.f4kezd, data.f4vegez),
    ]);
    if (ellenorzo1[0].length !== 0) {
      console.log('Mar van foglalas ebben az intervallumban');
      res.render('reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 2,
        errmess: 'Mar van foglalas ebben az intervallumban',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    if (ellenorzo2[0].length === 0) {
      console.log('Nincs nyitva ebben az intervallumban!');
      res.render('reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 2,
        errmess: 'Nincs nyitva ebben az intervallumban!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    const today = new Date();
    console.log(felid);
    await addFoglalas(felid, data.f4palyaid, data.f4kezd, data.f4vegez, today);
    const foglalasokuj = await getFoglalasok(data.f4palyaid);
    fogcheck = 0;
    if (foglalasokuj[0].length === 0) {
      fogcheck = 1;
    }
    res.render('reszletek', {
      userid: user,
      bej: bejelentkezesTipus,
      result: result[0],
      err: 10,
      errmess: '',
      fog: fogcheck,
      foglalasok: foglalasokuj[0],
    });
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba tortent a foglalas kozben, probald ujra!',
    });
  }
});

export default router;
