import express from 'express';
import Joi from 'joi';
import path from 'path';
import fs from 'fs';
import { getPalya } from '../../db/dbPalyak.js';
import { addFenykep, getCountFenykepek } from '../../db/dbKepek.js';
import { getFoglalasok } from '../../db/dbFoglalasok.js';
import { deleteFile } from '../../utils/utils.js';
import { uploadDir, multerUpload } from '../../uploadConfigs/uploadConfigs.js';

const router = express.Router();

router.post('/kepfeltolt', multerUpload.single('f1kep'), async (req, res) => {
  console.log('bent a kepfeltoltben');
  const bejelentkezesTipus = req.session.username;
  if (bejelentkezesTipus !== 'admin') {
    res.render('error', {
      error: 'Hiba történt a képfeltöltés közben, próbáld újra!',
    });
    return;
  }
  const user = req.session.userid;
  const data = req.body;
  const fileHandler = req.file;
  try {
    const [foglalasok, result, kepek] = await Promise.all([
      getFoglalasok(data.f1palyaid),
      getPalya(data.f1palyaid),
      getCountFenykepek(data.f1palyaid),
    ]);

    let fogcheck = 0; // vane foglalas vagy sincs, ha nincs kiirjuk hogy nincs
    if (foglalasok[0].length === 0) {
      fogcheck = 1;
    }

    if (!fileHandler) {
      console.log('Nincs feltoltve kep!');
      res.render('reszletek/reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 1,
        errmess: 'Nincs feltöltve kép!',
        fog: fogcheck,
        foglalasok: foglalasok[0],
      });
      return;
    }
    const filePath = path.join(uploadDir, fileHandler.filename);
    if (!fileHandler.mimetype.startsWith('image/')) {
      console.log('A feltoltott allomany nem kep formatum!');
      res.render('reszletek/reszletek', {
        userid: user,
        bej: bejelentkezesTipus,
        result: result[0],
        err: 1,
        errmess: 'A feltöltött állomány nem kép formátum!',
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
      res.render('reszletek/reszletek', {
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
    res.render('reszletek/reszletek', {
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
      error: 'Hiba történt a kép feltöltésénél, kérlek próbáld újra!',
    });
  }
});

export default router;
