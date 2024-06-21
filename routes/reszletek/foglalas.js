import express from 'express';
import { getPalya } from '../../db/dbPalyak.js';
import { getFoglalasok, getOverlaps, addFoglalas, getOverlaps2, getFoglalasokByDate } from '../../db/dbFoglalasok.js';

const router = express.Router();

function validateDate(dateString) {
  const regex2 = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!regex2.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  if (month === 2) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (day > 29 || (day === 29 && !isLeapYear)) {
      return false;
    }
  } else if ([4, 6, 9, 11].includes(month)) {
    if (day > 30) {
      return false;
    }
  }
  return true;
}

router.post('/foglalas', express.urlencoded({ extended: true }), async (req, res) => {
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
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
      res.render('reszletek/reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 2,
        errmess: 'Nem vagy bejelentkezve!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    const felid = req.session.userid;
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(data.f4kezd) || !regex.test(data.f4kezd) || !validateDate(data.f4datum)) {
      console.log('Helytelen bemenet a foglalasnal!');
      res.render('reszletek/reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 2,
        errmess: 'Helytelen bemenet a foglalásnál!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    const [ellenorzo1, ellenorzo2] = await Promise.all([
      getOverlaps(data.f4palyaid, data.f4kezd, data.f4vegez, data.f4datum),
      getOverlaps2(data.f4palyaid, data.f4kezd, data.f4vegez),
    ]);
    if (ellenorzo1[0].length !== 0) {
      console.log('Mar van foglalas ebben az intervallumban');
      res.render('reszletek/reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 2,
        errmess: 'Már van foglalás ebben az intervallumban',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    const today = new Date();
    const inputDate = new Date(data.f4datum);
    if (ellenorzo2[0].length === 0 || inputDate < today) {
      console.log('Nincs nyitva ebben az intervallumban!');
      res.render('reszletek/reszletek', {
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

    console.log(felid);
    await addFoglalas(felid, data.f4palyaid, data.f4kezd, data.f4vegez, data.f4datum);
    const foglalasokuj = await getFoglalasok(data.f4palyaid);
    fogcheck = 0;
    if (foglalasokuj[0].length === 0) {
      fogcheck = 1;
    }
    res.render('reszletek/reszletek', {
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
      error: 'Hiba történt a foglalás közben, próbáld újra!',
    });
  }
});

router.get('/foglalasszures', async (req, res) => {
  let bejelentkezesTipus = '';
  let user = 0;
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
    user = req.session.userid;
  } else {
    res.render('error', {
      error: 'Hiba történt a foglalás szűrése közben, próbáld újra!',
    });
    return;
  }
  const pid = req.query.f4palyaidsz;
  const datum = req.query.f4datumsz;

  try {
    if (!validateDate(datum)) {
      const [result, foglalasok] = await Promise.all([getPalya(pid.id), getFoglalasok(pid.id)]);
      let fogcheck = 0;
      if (foglalasok[0].length === 0) {
        fogcheck = 1;
      }
      console.log(result[0]);
      res.render('reszletek/reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 0,
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
    }
    const [result, foglalasok] = await Promise.all([getPalya(pid), getFoglalasokByDate(pid, datum)]);
    let fogcheck = 0;
    if (foglalasok[0].length === 0) {
      fogcheck = 1;
    }

    res.render('reszletek/reszletek', {
      userid: user,
      bej: bejelentkezesTipus,
      result: result[0],
      err: 0,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba a foglalások listázásánál!',
    });
  }
});

router.get('/foglalasosszes', async (req, res) => {
  let bejelentkezesTipus = '';
  let user = 0;
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
    user = req.session.userid;
  } else {
    bejelentkezesTipus = 'Vendeg';
  }
  console.log(req.query);
  const pid = req.query.f4palyaido;

  try {
    const [result, foglalasok] = await Promise.all([getPalya(pid), getFoglalasok(pid)]);
    let fogcheck = 0;
    if (foglalasok[0].length === 0) {
      fogcheck = 1;
    }

    res.render('reszletek/reszletek', {
      userid: user,
      bej: bejelentkezesTipus,
      result: result[0],
      err: 0,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba a foglalások listázásánál!',
    });
  }
});

export default router;
