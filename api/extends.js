import express from 'express';

const router = express.Router();

router.get('/palyak_lista', (req, res) => {
  res.json('kuldom a jelet');
});
export default router;
