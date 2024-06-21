import express from 'express';

const router = express.Router();

router.get('/felhasznalok', (req, res) => {
  if (req.session.username !== 'admin') {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  res.render('felhasznalok', {
    err: 0,
    errmess: '',
    bej: req.session.username,
  });
});

export default router;
