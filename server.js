import express from 'express';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import requestMain from './routes/index.js';
import requestReszletek from './routes/reszletek.js';
import requestBevezet from './routes/bevezet.js';
import requestRegisztralas from './routes/regisztralas.js';
import requestBejelentkezes from './routes/bejelentkezes.js';
import requestKijelentkezes from './routes/kijelentkezes.js';
import apiRoutes from './api/index.js';

const app = express();

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
app.use('', requestMain);
app.use('', requestReszletek);
app.use('', requestBevezet);
app.use('', requestRegisztralas);
app.use('', requestBejelentkezes);
app.use('', requestKijelentkezes);

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
