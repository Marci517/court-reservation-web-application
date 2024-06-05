import express from 'express';
import Joi from 'joi';
import path from 'path';
import fs from 'fs';
import { getPalya } from '../db/dbPalyak.js';
import { getFelhasznalokNevei } from '../db/dbFelhasznalok.js';
import { addFenykep, getCountFenykepek } from '../db/dbKepek.js';
import { getFoglalasok, getOverlaps, addFoglalas, getOverlaps2, deleteFoglalas } from '../db/dbFoglalasok.js';
import { deleteFile } from '../utils/utils.js';
import { uploadDir, multerUpload } from '../uploadConfigs/uploadConfigs.js';

const router = express.Router();

router.get('/reszletek', async (req, res) => {
  let bejelentkezesTipus = '';
  let user = 0;
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
    user = req.session.userid;
  } else {
    bejelentkezesTipus = 'Vendeg';
  }
  console.log('bent a reszeletekben');
  const pid = req.query;
  try {
    const [result, felhasznalok, foglalasok] = await Promise.all([
      getPalya(pid.id),
      getFelhasznalokNevei(),
      getFoglalasok(pid.id),
    ]);
    let fogcheck = 0;
    if (foglalasok[0].length === 0) {
      fogcheck = 1;
    }
    console.log(result[0]);
    res.render('reszletek', {
      userid: user,
      bej: bejelentkezesTipus,
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 0,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba a palya informacioi listazasanal!',
    });
  }
});

router.post('/foglalas', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a foglalasban');
  let bejelentkezesTipus = '';
  let user = 0;
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
    user = req.session.userid;
  } else {
    bejelentkezesTipus = 'Vendeg';
  }
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

router.post('/kepfeltolt', multerUpload.single('f1kep'), async (req, res) => {
  console.log('bent a kepfeltoltben');
  let bejelentkezesTipus = '';
  let user = 0;
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
    user = req.session.userid;
  } else {
    bejelentkezesTipus = 'Vendeg';
  }
  const data = req.body;
  const fileHandler = req.file;
  try {
    const [foglalasok, result, kepek] = await Promise.all([
      getFoglalasok(data.f1palyaid),
      getPalya(data.f1palyaid),
      getCountFenykepek(data.f1palyaid),
    ]);

    let fogcheck = 0;
    if (foglalasok[0].length === 0) {
      fogcheck = 1;
    }

    if (!fileHandler) {
      console.log('Nincs feltoltve kep!');
      res.render('reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 1,
        errmess: 'Nincs feltoltve kep!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    const filePath = path.join(uploadDir, fileHandler.filename);
    if (!fileHandler.mimetype.startsWith('image/')) {
      console.log('A feltoltott allomany nem kep formatum!');
      res.render('reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 1,
        errmess: 'A feltoltott allomany nem kep formatum!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      deleteFile(filePath);
      return;
    }
    const expected = Joi.object({
      f1palyaid: Joi.string().required(),
    });
    const { error } = expected.validate(data);
    if (error != null) {
      console.log('Helytelen bemenet a kepfeltoltnel!');
      res.render('reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 1,
        errmess: error.details[0].message,
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      deleteFile(filePath);
      return;
    }
    const sorszam = kepek[0][0].kepek_szama + 1;
    const newFileName = `kep${data.f1palyaid}_${sorszam}.${fileHandler.originalname.split('.').pop()}`;
    const newFilePath = path.join(uploadDir, newFileName);
    fs.rename(filePath, newFilePath, (err) => {
      if (err) {
        console.error('Hiba történt a fájl átnevezése közben:', err);
      } else {
        console.log('Sikeresen átnevezve:', newFileName);
      }
    });
    await addFenykep(data.f1palyaid, newFileName);
    const result2 = await getPalya(data.f1palyaid);
    res.render('reszletek', {
      userid: user,
      bej: bejelentkezesTipus,
      result: result2[0],
      err: 0,
      errmess: '',
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba tortent a kep feltoltesenel, kerlek probald ujra!',
    });
  }
});

router.post('/torlesfog', express.urlencoded({ extended: true }), async (req, res) => {
  const data = req.body;
  console.log(data);
  const fogId = data.FogID;
  try {
    console.log(fogId);
    const result = await deleteFoglalas(fogId);
    console.log(result);
    if (!result) {
      res.render('error', {
        error: 'Hiba tortent a foglalas torlesenel, kerlek probald ujra!',
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.render('error', {
      error: 'Hiba tortent a foglalas torlesenel, kerlek probald ujra!',
    });
  }
  res.redirect('/');
});

export default router;
