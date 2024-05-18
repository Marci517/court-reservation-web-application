import express from 'express';
import path from 'path';
import requestMain from './routes/main.js';
import requestReszletek from './routes/reszletek.js';
import requestBevezet from './routes/bevezet.js';

const app = express();

app.use(express.static(path.join(process.cwd(), 'static')));
app.use(express.static(path.join(process.cwd(), 'uploadDir')));
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

app.use('', requestMain);
app.use('', requestReszletek);
app.use('', requestBevezet);

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
