import express from 'express';
import Joi from 'joi';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { addPalya, addFenykep, getPalyak, getAllPalyak, getPalya, getCountFenykepek } from './db.js';

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Hiba történt a fájl törlése közben:', err);
    } else {
      console.log('A fájl sikeresen törölve.');
    }
  });
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
  res.render('bevezet');
});

app.get('/reszletek', async (req, res) => {
  const pid = req.query;
  console.log(pid.id);
  const result = await getPalya(pid.id);
  console.log(result[0]);
  console.log('reszletek voltak');
  if (result[0][0].FNev === null) {
    result[0][0].FNev = 'Nincs kep hozzaadva';
  }
  console.log(result[0][0][5]);
  res.render('reszletek', {
    result: result[0],
  });
});

app.post('/palyabevezet', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a palyabevezetben');
  const data = req.body;

  const expected = Joi.object({
    palyak: Joi.string().required(),
    f0oraber: Joi.number().min(0).required(),
    f0cim: Joi.string().required(),
    f0leiras: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a palyabevezetnel!');
    const err = 'Helytelen bemenet!';
    res.status(400).send(err);
    return;
  }

  await addPalya(data.palyak, data.f0oraber, data.f0cim, data.f0leiras);
  res.redirect('/');
  console.log('Sikeres feltoltes');
});

app.post('/kepfeltolt', multerUpload.single('f1kep'), async (req, res) => {
  console.log('bent a kepfeltoltben');
  const fileHandler = req.file;

  const data = req.body;
  const expected = Joi.object({
    f1palyaid: Joi.string().required(),
  });

  if (!fileHandler) {
    console.log('Nincs feltoltve kep!');
    res.status(400).send('Nincs feltoltve kep!');
    return;
  }
  const filePath = path.join(uploadDir, fileHandler.filename);
  if (!fileHandler.mimetype.startsWith('image/')) {
    console.log('A feltoltott allomany nem kep formatum!');
    res.status(400).send('A feltoltott allomany nem kep formatumu!');
    deleteFile(filePath);
    return;
  }
  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen bemenet a kepfeltoltnel!');
    const err = 'Helytelen bemenet!';
    res.status(400).send(err);
    deleteFile(filePath);
    return;
  }

  const result = await getCountFenykepek(data.f1palyaid);
  console.log(result);
  const sorszam = result[0][0].kepek_szama + 1;
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
  res.redirect(`/reszletek?id=${data.f1palyaid}`);
});

app.get('/', async (req, res) => {
  console.log('bent a klienszurben');
  const data = req.query;
  let results = {};
  console.log(data.f3orabermax);
  if (data.f3orabermin && data.f3orabermax && data.palyakkliens) {
    const expected = Joi.object({
      f3orabermin: Joi.number().min(0).required(),
      f3orabermax: Joi.number().min(0).required(),
      palyakkliens: Joi.string().required(),
    });

    const { error } = expected.validate(data);
    if (error != null) {
      console.log('Helytelen bemenet a kliensszurnel!');
      const err = 'Helytelen bemenet!';
      res.status(400).send(err);
      return;
    }
    const min = parseInt(data.f3orabermin, 10);
    const max = parseInt(data.f3orabermax, 10);

    if (min > max) {
      console.log('Helytelen kliensszurnel, min > max miatt!');
      const err = 'Min oraber nagyobb mint a max oraber!!!';
      res.status(400).send(err);
      return;
    }

    results = await getPalyak(data.palyakkliens, data.f3orabermin, data.f3orabermax);
    console.log('szurunk palyat az infok alapjan');
    console.log(data);
  } else {
    results = await getAllPalyak();
  }

  if (results[0].length === 0) {
    console.log('Nincs keresett palya');
    res.render('index', {
      resul: results[0],
      err: 1,
    });
  }
  console.log(results[0]);

  console.log('Sikeres lekerdezes!');
  res.render('index', {
    resul: results[0],
    err: 0,
  });
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
