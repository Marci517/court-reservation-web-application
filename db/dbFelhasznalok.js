import pool from './dbConnection.js';

export function getFelhasznalokNevei() {
  const sql = `SELECT f.FID ,f.FelNev
  FROM Felhasznalok AS f`;

  return pool.query(sql);
}

export function getId(nev) {
  const sql = `SELECT f.FID
  FROM Felhasznalok AS f
  WHERE f.FelNev = ?`;
  const values = [nev];

  return pool.query(sql, values);
}
