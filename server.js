import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { join } from 'path';

const app = express();

app.use(express.static(join(process.cwd(), 'static')));

app.post('/palyabevezet', (req, res) => {
  console.log('bent a palyabevezetben');
  const palya = req.body;
  console.log(palya);
  const newid = uuidv4();
  res.send(newid);
});

app.post('/kliensszur', express.urlencoded({ extended: true }), (req, res) => {
  console.log('bent a klienszurben');
  const data = req.body;
  const expected = Joi.object({
    f3orabermin: Joi.number().min(0).required(),
    f3orabermax: Joi.number().required(),
    palyakkliens: Joi.string().required(),
  });

  const { error } = expected.validate(data);
  if (error != null) {
    console.log('Helytelen!');
    const err = 'Helytelen bemenet!';
    res.status(400).send(err);
  } else {
    console.log('okes a dolog');
    const msg = 'szia';
    res.send(msg);
  }
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
