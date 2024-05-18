import express from 'express';

const router = express.Router();

router.get('/bevezet', (req, res) => {
  console.log('bent a bevezetben');
  res.render('bevezet', {
    err: 0,
    errmess: 'Helytelen bemenet',
  });
});

export default router;
