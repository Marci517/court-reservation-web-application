import pool from './dbConnection.js';

export function getFelhasznalokNevei() {
  const sql = `SELECT f.FID ,f.FelNev
  FROM Felhasznalok AS f`;

  return pool.query(sql);
}

export function getFelhasznalokNeveiNemElfogadott() {
  const sql = `SELECT f.FID ,f.FelNev
  FROM Felhasznalok AS f
  WHERE f.Elfogadott = 0`;

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

export function getIdByNev(nev) {
  const sql = `SELECT f.FID
  FROM Felhasznalok AS f
  WHERE f.FelNev = ?`;
  const values = [nev];

  return pool.query(sql, values);
}

export function getPassword(email) {
  const sql = `SELECT f.Kod
  FROM Felhasznalok AS f
  WHERE f.Email = ?`;
  const values = [email];

  return pool.query(sql, values);
}

export function getHaElfogadott(id) {
  const sql = `SELECT f.Elfogadott
  FROM Felhasznalok AS f
  WHERE f.FID = ?`;
  const values = [id];

  return pool.query(sql, values);
}

export function addFelhasznalok(nev, email, kod) {
  const sql = 'INSERT INTO Felhasznalok (FelNev, Email, Kod, Elfogadott) VALUES (?, ?, ?, ?)';
  const values = [nev, email, kod, 0];

  return pool.query(sql, values);
}

export function updateEmail(id, email) {
  const sql = `UPDATE Felhasznalok
               SET Email = ?
               WHERE FID = ?`;
  const values = [email, id];

  return pool.query(sql, values);
}

export function updateElfogadott(id) {
  const sql = `UPDATE Felhasznalok
               SET Elfogadott = ?
               WHERE FID = ?`;
  const values = [1, id];

  return pool.query(sql, values);
}

export function updateNev(id, nev) {
  const sql = `UPDATE Felhasznalok
               SET FelNev = ?
               WHERE FID = ?`;
  const values = [nev, id];

  return pool.query(sql, values);
}

export function updatePassword(id, kod) {
  const sql = `UPDATE Felhasznalok
               SET Kod = ?
               WHERE FID = ?`;
  const values = [kod, id];

  return pool.query(sql, values);
}

// foglalas felhasznalo szerint torolve
export function torlesFoglalas(id) {
  const sql = 'DELETE FROM Foglalasok WHERE FID = ?';
  const values = [id];

  return pool.query(sql, values);
}

export function torlesFelhasznalo(id) {
  const sql = 'DELETE FROM Felhasznalok WHERE FID = ?';
  const values = [id];

  return pool.query(sql, values);
}
