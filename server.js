import express from 'express';
import Joi from 'joi';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import {
  addPalya,
  addFenykep,
  getPalyak,
  getPalya,
  getCountFenykepek,
  getPalyak2,
  getFelhasznalokNevei,
  getId,
  addFoglalas,
  getOverlaps,
  getFoglalasok,
} from './db.js';

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Hiba történt a fájl törlése közben:', err);
    } else {
      console.log('A fájl sikeresen törölve.');
    }
  });
}

function getminmaxnev(data) {
  if (!data.f3orabermin) {
    data.f3orabermin = '0';
  }
  if (!data.f3orabermax) {
    data.f3orabermax = '100000';
  }
  if (!data.palyakkliens) {
    data.palyakkliens = 'osszes';
  }
  return data;
}

const app = express();

app.use(express.static(path.join(process.cwd(), 'static')));
app.use(express.static(path.join(process.cwd(), 'uploadDir')));
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

const uploadDir = path.join(process.cwd(), 'uploadDir');

const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

app.get('/bevezet', (req, res) => {
  console.log('bent a bevezetben');
  res.render('bevezet', {
    err: 0,
  });
});

app.get('/reszletek', async (req, res) => {
  console.log('bent a reszeletekben');
  const pid = req.query;
  const result = await getPalya(pid.id);
  const felhasznalok = await getFelhasznalokNevei();
  const foglalasok = await getFoglalasok(pid.id);
  let fogcheck = 0;
  if (foglalasok[0].length === 0) {
    fogcheck = 1;
  }
  console.log(result[0]);
  if (result[0][0].FNev === null) {
    result[0][0].FNev = 'Nincs kep hozzaadva';
  }
  res.render('reszletek', {
    result: result[0],
    felhasznalok: felhasznalok[0],
    err: 0,
    fog: fogcheck,
    foglalasok: foglalasok[0],
  });
});

app.post('/foglalas', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a foglalasban');
  const data = req.body;
  const result = await getPalya(data.f4palyaid);
  const felhasznalok = await getFelhasznalokNevei();
  const foglalasok = await getFoglalasok(data.f4palyaid);
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
      err: 5,
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
      err: 4,
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
  res.render('reszletek', {
    result: result[0],
    felhasznalok: felhasznalok[0],
    err: 10,
    fog: fogcheck,
    foglalasok: foglalasokuj[0],
  });
});

app.post('/palyabevezet', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a palyabevezetben');
  const data = req.body;

  const expected = Joi.object({
    palyak: Joi.string().required(),
    f0oraber: Joi.number().min(0).max(100000).required(),
    f0cim: Joi.string().required(),
    f0leiras: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a palyabevezetnel!');
    res.render('bevezet', {
      err: 1,
    });
    return;
  }

  await addPalya(data.palyak, data.f0oraber, data.f0cim, data.f0leiras);
  res.redirect('/');
  console.log('Sikeres feltoltes');
});

app.post('/kepfeltolt', multerUpload.single('f1kep'), async (req, res) => {
  console.log('bent a kepfeltoltben');
  const data = req.body;
  const fileHandler = req.file;
  const felhasznalok = await getFelhasznalokNevei();
  const foglalasok = await getFoglalasok(data.f1palyaid);
  let fogcheck = 0;
  if (foglalasok[0].length === 0) {
    fogcheck = 1;
  }

  const expected = Joi.object({
    f1palyaid: Joi.string().required(),
  });

  if (!fileHandler) {
    console.log('Nincs feltoltve kep!');
    const result = await getPalya(data.f1palyaid);
    res.render('reszletek', {
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 1,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
    return;
  }
  const filePath = path.join(uploadDir, fileHandler.filename);
  if (!fileHandler.mimetype.startsWith('image/')) {
    console.log('A feltoltott allomany nem kep formatum!');
    const result = await getPalya(data.f1palyaid);
    res.render('reszletek', {
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 2,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
    deleteFile(filePath);
    return;
  }
  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a kepfeltoltnel!');
    const result = await getPalya(data.f1palyaid);
    res.render('reszletek', {
      result: result[0],
      felhasznalok: felhasznalok[0],
      err: 3,
      fog: fogcheck,
      foglalasok: foglalasok[0],
    });
    deleteFile(filePath);
    return;
  }

  const kepek = await getCountFenykepek(data.f1palyaid);
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
  const result = await getPalya(data.f1palyaid);
  res.render('reszletek', {
    result: result[0],
    felhasznalok: felhasznalok[0],
    err: 0,
    fog: fogcheck,
    foglalasok: foglalasok[0],
  });
});

app.get('/', async (req, res) => {
  console.log('bent a klienszurben');
  let data = req.query;
  let results = {};
  data = getminmaxnev(data);

  const expected = Joi.object({
    f3orabermin: Joi.number().min(0).required(),
    f3orabermax: Joi.number().min(0).max(100000).required(),
    palyakkliens: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a kliensszurnel!');
    res.render('index', {
      resul: results[0],
      err: 3,
    });
    return;
  }
  const min = parseInt(data.f3orabermin, 10);
  const max = parseInt(data.f3orabermax, 10);

  if (min > max) {
    console.log('Helytelen kliensszurnel, min > max miatt!');
    res.render('index', {
      resul: results[0],
      err: 2,
    });
    return;
  }

  if (data.palyakkliens === 'osszes') {
    results = await getPalyak2(data.f3orabermin, data.f3orabermax);
  } else {
    results = await getPalyak(data.palyakkliens, data.f3orabermin, data.f3orabermax);
  }
  console.log('szurunk palyat az infok alapjan');
  console.log(data);

  if (results[0].length === 0) {
    console.log('Nincs keresett palya');
    res.render('index', {
      resul: results[0],
      err: 1,
    });
    return;
  }
  res.render('index', {
    resul: results[0],
    err: 0,
  });
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
