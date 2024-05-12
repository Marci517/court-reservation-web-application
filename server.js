import express from 'express';
import Joi from 'joi';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { addPalya, addFenykep, getPalyak } from './db.js';

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

const uploadDir = path.join(process.cwd(), 'uploadDir');

const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

app.post('/palyabevezet', express.urlencoded({ extended: true }), (req, res) => {
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

  const results = addPalya(data.palyak, data.f0oraber, data.f0cim, data.f0leiras);
  res.json(results);
  console.log('Sikeres feltoltes');
});

app.post('/kepfeltolt', multerUpload.single('f1kep'), (req, res) => {
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

  const results = addFenykep(data.f1palyaid, fileHandler.originalname);
  res.json(results);
});

app.post('/kliensszur', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('bent a klienszurben');
  const data = req.body;
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
  console.log('szurunk palyat az infok alapjan');
  console.log(data);

  getPalyak(data.palyakkliens, data.f3orabermin, data.f3orabermax);

  const results = await getPalyak(data.palyakkliens, data.f3orabermin, data.f3orabermax);

  if (results.length === 0) {
    console.log('Nincs keresett palya');
    const msgerr = 'Nem létezik ilyen pálya!';
    res.send(msgerr);
    return;
  }

  console.log('Sikeres lekerdezes!');
  console.log(results);
  res.send(results[0]);
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
