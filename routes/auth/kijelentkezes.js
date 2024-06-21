import express from 'express';

const router = express.Router();

router.all('/kijelentkezes', (req, res) => {
  if (!req.session.username) {
    res.render('error', {
      error: 'Az oldal nem elérhető!',
    });
    return;
  }
  req.session.destroy((err) => {
    if (err) {
      res.render('error', {
        error: 'Hiba törtent a kijelentkezés közben, próbáld újra!',
      });
      return;
    }
    res.redirect('/');
  });
});

export default router;
