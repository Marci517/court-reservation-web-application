import { getId } from '../db/dbFelhasznalok.js';

export const checkUserExists = async (req, res, next) => {
  if (req.session.username) {
    const user = await getId(req.session.username);
    if (user[0].length === 0) {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    } else {
      next();
    }
  } else {
    next();
  }
};
