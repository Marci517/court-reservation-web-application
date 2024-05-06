import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

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
const informations = {};

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
  console.log(data);
  const newid = uuidv4();
  informations[newid] = {
    palyak: data.palyak,
    f0oraber: data.f0oraber,
    f0cim: data.f0cim,
    f0leiras: data.f0leiras,
    kep: 'Nincs kep csatolva hozza',
  };
  console.log(`informations: ${JSON.stringify(informations[newid])}`);
  res.send(newid);
});

app.post('/kepfeltolt', multerUpload.single('f1kep'), (req, res) => {
  console.log('bent a kepfeltoltben');
  const fileHandler = req.file;

  const data = req.body;
  console.log(data);
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

  if (informations[data.f1palyaid]) {
    informations[data.f1palyaid].kep = fileHandler.originalname;
    console.log(`uj kep: ${JSON.stringify(informations[data.f1palyaid])}`);
  } else {
    console.log('nincs ilyen id');
    const err = 'Nem letezo id!';
    res.status(400).send(err);
    deleteFile(filePath);
    return;
  }
  const msg = `Sikeres feltoltes:
        allomanynev: ${fileHandler.originalname}
        nev a szerveren: ${fileHandler.path}
        meret: ${fileHandler.size}
        mime-type: ${fileHandler.mimetype}`;
  res.send(msg);
});

app.post('/kliensszur', express.urlencoded({ extended: true }), (req, res) => {
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
  let log = false;
  const msg = [];
  Object.keys(informations).forEach((key) => {
    const info = informations[key];
    if (info.palyak === data.palyakkliens && info.f0oraber >= min && info.f0oraber <= max) {
      log = true;
      msg.push(`A palya tipusa: ${info.palyak}
                       Oraber: ${info.f0oraber}
                       Cim: ${info.f0cim}
                       Leiras: ${info.f0leiras}
                       Kep: ${info.kep}`);
    }
  });
  if (!log) {
    console.log('Nincs keresett palya');
    const msgerr = 'Nem letezik ilyen palya!';
    res.send(msgerr);
    return;
  }
  let textResponse = 'Palyak:\n';
  msg.forEach((i) => {
    textResponse += `${i}\n\n`;
  });

  res.set('Content-Type', 'text/plain;charset=utf-8');
  res.send(textResponse);
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
