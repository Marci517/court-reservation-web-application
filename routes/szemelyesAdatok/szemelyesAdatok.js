import express from 'express';

const router = express.Router();

router.get('/adatok', (req, res) => {
  console.log('bent az adatokban');
  let bejelentkezesTipus = '';
  let bejelentkezesEmail = '';
  if (req.session.username) {
    bejelentkezesTipus = req.session.username;
    bejelentkezesEmail = req.session.email;
  } else {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  res.render('adatok', {
    bej: bejelentkezesTipus,
    email: bejelentkezesEmail,
    err: 0,
    errmess: '',
  });
});

export default router;
