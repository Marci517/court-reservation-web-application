import express from 'express';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import requestMain from './routes/index/index.js';
import requestReszletek from './routes/reszletek/reszletek.js';
import requestFoglalas from './routes/reszletek/foglalas.js';
import requestKepFeltolt from './routes/reszletek/kepFeltolt.js';
import requestTorolFoglalas from './routes/reszletek/torlesFoglalas.js';
import requestBevezet from './routes/palyaBevezet/bevezet.js';
import requestPalyaBevezet from './routes/palyaBevezet/palyaBevezet.js';
import requestRegisztralas from './routes/auth/regisztralas.js';
import requestBejelentkezes from './routes/auth/bejelentkezes.js';
import requestKijelentkezes from './routes/auth/kijelentkezes.js';
import requestAdatok from './routes/szemelyesAdatok/szemelyesAdatok.js';
import requestEmailCsere from './routes/szemelyesAdatok/emailCsere.js';
import requestNevCsere from './routes/szemelyesAdatok/nevCsere.js';
import requestJelszoCsere from './routes/szemelyesAdatok/jelszoCsere.js';
import requestProfilTorles from './routes/szemelyesAdatok/profilTorles.js';
import requestFelhasznalok from './routes/felhasznalok/felhasznalok.js';
import requestKezeles from './routes/felhasznalok/kezeles.js';
import requestEngedely from './routes/felhasznalok/engedelykeresek.js';
import apiRoutes from './api/index.js';
import { checkUserExists } from './middleware/checkUserExists.js';

const app = express();
// bekotesek

app.use(express.static(path.join(process.cwd(), 'static')));
app.use(express.static(path.join(process.cwd(), 'uploadDir')));
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(morgan('tiny'));
app.use('/api', apiRoutes);
app.use(
  session({
    secret: '141e6ecf428fefwfff',
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(checkUserExists);
app.use('', requestMain);
app.use('', requestReszletek);
app.use('', requestFoglalas);
app.use('', requestTorolFoglalas);
app.use('', requestKepFeltolt);
app.use('', requestBevezet);
app.use('', requestPalyaBevezet);
app.use('', requestRegisztralas);
app.use('', requestBejelentkezes);
app.use('', requestKijelentkezes);
app.use('', requestAdatok);
app.use('', requestEmailCsere);
app.use('', requestNevCsere);
app.use('', requestJelszoCsere);
app.use('', requestProfilTorles);
app.use('', requestFelhasznalok);
app.use('', requestKezeles);
app.use('', requestEngedely);

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
