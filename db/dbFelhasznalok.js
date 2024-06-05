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

export function getName(id) {
  const sql = `SELECT f.FelNev
  FROM Felhasznalok AS f
  WHERE f.FID = ?`;
  const values = [id];

  return pool.query(sql, values);
}

export function getIdByEmail(email) {
  const sql = `SELECT f.FID
  FROM Felhasznalok AS f
  WHERE f.Email = ?`;
  const values = [email];

  return pool.query(sql, values);
}

export function getPassword(email) {
  const sql = `SELECT f.Kod
  FROM Felhasznalok AS f
  WHERE f.Email = ?`;
  const values = [email];

  return pool.query(sql, values);
}

export function addFelhasznalok(nev, email, kod) {
  const sql = 'INSERT INTO Felhasznalok (FelNev, Email, Kod) VALUES (?, ?, ?)';
  const values = [nev, email, kod];

  return pool.query(sql, values);
}
