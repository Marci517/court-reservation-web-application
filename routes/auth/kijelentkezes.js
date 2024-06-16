import express from 'express';

const router = express.Router();

router.all('/kijelentkezes', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.render('error', {
        error: 'Hiba tortent a kijelentkezes kozben, probald ujra!',
      });
      return;
    }
    res.redirect('/');
  });
});

export default router;
