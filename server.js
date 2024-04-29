import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { join } from 'path';
import multer from 'multer';

const app = express();
const informations = [];

app.use(express.static(join(process.cwd(), 'static')));

const uploadDir = join(process.cwd(), 'uploadDir');

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
  } else {
    console.log(data);
    const newid = uuidv4();
    informations.push([newid, data.palyak, data.f0oraber, data.f0cim, data.f0leiras, 'Nincs kep csatolva hozza']);
    console.log(`informations: ${informations[informations.length - 1]}`);
    res.send(newid);
  }
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
  } else if (!fileHandler.mimetype.startsWith('image/')) {
    console.log('A feltoltott allomany nem kep formatum!');
    res.status(400).send('A feltoltott allomany nem kep formatumu!');
  } else {
    const { error } = expected.validate(data);
    if (error != null) {
      console.log('Helytelen bemenet a kepfeltoltnel!');
      const err = 'Helytelen bemenet!';
      res.status(400).send(err);
    } else {
      let log = false;
      for (let i = 0; i < informations.length; i++) {
        if (informations[i][0] === data.f1palyaid) {
          log = true;
        }
      }
      if (log) {
        console.log('sikeresen feltoltve a kep');
        for (let i = 0; i < informations.length; i++) {
          if (informations[i][0] === data.f1palyaid) {
            informations[i][5] = fileHandler.originalname;
            console.log(informations[i][5]);
          }
        }

        const msg = `Sikeres feltoltes:
        allomanynev: ${fileHandler.originalname}
        nev a szerveren: ${fileHandler.path}
        meret: ${fileHandler.size}
        mime-type: ${fileHandler.mimetype}`;
        res.send(msg);
      } else {
        console.log('nincs ilyen id');
        const err = 'Nem letezo id!';
        res.status(400).send(err);
      }
    }
  }
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
  } else {
    const min = parseInt(data.f3orabermin, 10);
    const max = parseInt(data.f3orabermax, 10);

    if (min > max) {
      console.log('Helytelen kliensszurnel, min > max miatt!');
      const err = 'Min oraber nagyobb mint a max oraber!!!';
      res.status(400).send(err);
    } else {
      console.log('szurunk palyat az infok alapjan');
      console.log(data);
      let log = false;
      const msg = [];
      for (let i = 0; i < informations.length; i++) {
        if (
          informations[i][1] === data.palyakkliens &&
          informations[i][2] >= data.f3orabermin &&
          informations[i][2] <= data.f3orabermax
        ) {
          log = true;
          msg[i] = `A palya tipusa: ${informations[i][1]}
                       Oraber: ${informations[i][2]}
                       Cim: ${informations[i][3]}
                       Leiras: ${informations[i][4]}
                       Kep: ${informations[i][5]}`;
        }
      }
      if (!log) {
        console.log('Nincs keresett palya');
        const msgerr = 'Nem letezik ilyen palya!';
        res.send(msgerr);
      } else {
        let textResponse = 'Palyak:\n';
        msg.forEach((i) => {
          textResponse += `${i}\n\n`;
        });

        res.set('Content-Type', 'text/plain;charset=utf-8');
        res.send(textResponse);
      }
    }
  }
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
