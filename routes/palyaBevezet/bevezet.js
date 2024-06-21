import express from 'express';

const router = express.Router();

router.get('/bevezet', (req, res) => {
  console.log('bent a bevezetben');
  let bejelentkezesTipus = '';
  if (req.session.username === 'admin') {
    bejelentkezesTipus = req.session.username;
  } else {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  res.render('bevezet', {
    bej: bejelentkezesTipus,
    err: 0,
    errmess: '',
  });
});

export default router;
