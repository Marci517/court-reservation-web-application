import express from 'express';
import Joi from 'joi';
import path from 'path';
import fs from 'fs';
import {
  getPalya,
  getFelhasznalokNevei,
  getFoglalasok,
  getOverlaps,
  getId,
  addFoglalas,
  getCountFenykepek,
  addFenykep,
} from '../db/db.js';
import { deleteFile } from '../utils/utils.js';
import { uploadDir, multerUpload } from '../uploadConfigs/uploadConfigs.js';

const router = express.Router();

router.get('/reszletek', async (req, res) => {
  console.log('bent a reszeletekben');
  const pid = req.query;
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
    result: result[0],
    felhasznalok: felhasznalok[0],
    err: 0,
    fog: fogcheck,
    foglalasok: foglalasok[0],
  });
});

router.post('/foglalas', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a foglalasban');
  const data = req.body;
  const [result, felhasznalok, foglalasok] = await Promise.all([
    getPalya(data.f4palyaid),
    getFelhasznalokNevei(),
    getFoglalasok(data.f4palyaid),
  ]);
  let fogcheck = 0;
  if (foglalasok[0].length === 0) {
    fogcheck = 1;
  }
  console.log(data);

  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!regex.test(data.f4kezd) || !regex.test(data.f4kezd)) {
    console.log('Helytelen bemenet a foglalasnal!');
    res.render('reszletek', {
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 2,
      errmess: 'Helytelen bemenet a foglalasnal!',
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
    return;
  }
  const ellenorzo = await getOverlaps(data.f4palyaid, data.f4kezd, data.f4vegez);
  if (ellenorzo[0].length !== 0) {
    console.log('Mar van foglalas ebben az intervallumban');
    res.render('reszletek', {
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 2,
      errmess: 'Mar van foglalas ebben az intervallumban',
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
    return;
  }
  const felid = await getId(data.felhasznalok);
  const today = new Date();
  console.log(felid);
  console.log(today);
  await addFoglalas(felid[0][0].FID, data.f4palyaid, data.f4kezd, data.f4vegez, today);
  const foglalasokuj = await getFoglalasok(data.f4palyaid);

  fogcheck = 0;
  if (foglalasokuj[0].length === 0) {
    fogcheck = 1;
  }

  res.render('reszletek', {
    result: result[0],
    felhasznalok: felhasznalok[0],
    err: 10,
    errmess: '',
    fog: fogcheck,
    foglalasok: foglalasokuj[0],
  });
});

router.post('/kepfeltolt', multerUpload.single('f1kep'), async (req, res) => {
  console.log('bent a kepfeltoltben');
  const data = req.body;
  const fileHandler = req.file;
  const [felhasznalok, foglalasok, result, kepek] = await Promise.all([
    getFelhasznalokNevei(),
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
      result: result[0],
      felhasznalok: felhasznalok[0],
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
      result: result[0],
      felhasznalok: felhasznalok[0],
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
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 1,
      errmess: error.details[0].message,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
    deleteFile(filePath);
    return;
  }

  console.log('a kepek szama az adott palyanak:');
  console.log(kepek[0][0].kepek_szama);
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
    result: result2[0],
    felhasznalok: felhasznalok[0],
    err: 0,
    errmess: '',
    fog: fogcheck,
    foglalasok: foglalasok[0],
  });
});

export default router;
