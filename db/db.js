import pool from './dbConnection.js';

export function addPalya(nev, oraber, cim, leiras) {
  const sql = 'INSERT INTO Palyak (Nev, Oraber, Cim, Leiras) VALUES (?, ?, ?, ?)';
  const values = [nev, oraber, cim, leiras];

  return pool.query(sql, values);
}

export function addFenykep(pid, nev) {
  const sql = 'INSERT INTO Fenykepek (PID, FNev) VALUES (?, ?)';
  const values = [pid, nev];

  return pool.query(sql, values);
}

export function getPalyak(nev, orabermin, orabermax) {
  const sql = `SELECT p.PID, p.Nev, p.Cim, p.Oraber, p.Leiras
  FROM Palyak AS p
  WHERE p.Oraber <= ? AND p.Oraber >= ? AND p.Nev = ?`;
  const values = [orabermax, orabermin, nev];

  return pool.query(sql, values);
}

export function getPalyak2(orabermin, orabermax) {
  const sql = `SELECT p.PID, p.Nev, p.Cim, p.Oraber, p.Leiras
  FROM Palyak AS p
  WHERE p.Oraber <= ? AND p.Oraber >= ?`;
  const values = [orabermax, orabermin];

  return pool.query(sql, values);
}

export function getAllPalyak() {
  const sql = `SELECT p.PID, p.Nev, p.Cim, p.Oraber, p.Leiras
  FROM Palyak AS p`;

  return pool.query(sql);
}

export function getPalya(pid) {
  const sql = `SELECT p.PID, p.Nev, p.Cim, p.Oraber, p.Leiras, f.FNev
  FROM Palyak AS p
  LEFT JOIN Fenykepek AS f ON p.PID = f.PID
  WHERE p.PID = ?`;
  const values = [pid];

  return pool.query(sql, values);
}

export function getCountFenykepek(pid) {
  const sql = `SELECT COUNT(*) AS kepek_szama
  FROM Palyak AS p
  JOIN Fenykepek AS f ON p.PID = f.PID
  WHERE p.PID = ?`;
  const values = [pid];

  return pool.query(sql, values);
}

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

export function addFoglalas(fid, pid, kezd, veg, datum) {
  const sql = 'INSERT INTO Foglalasok (PID, FID, Datum, Kezdes, Vegzes) VALUES (?, ?, ?, ?, ?)';
  const values = [pid, fid, datum, kezd, veg];

  return pool.query(sql, values);
}

export function getOverlaps(pid, kezd, veg) {
  const sql = `SELECT* FROM Palyak AS p JOIN Foglalasok AS f ON p.PID = f.PID
  WHERE ((? BETWEEN f.Kezdes AND f.Vegzes) OR (? BETWEEN f.Kezdes AND f.Vegzes)) AND p.PID = ?`;
  const values = [kezd, veg, pid];

  return pool.query(sql, values);
}

export function getFoglalasok(pid) {
  const sql = `SELECT f.Datum, f.Kezdes, f.Vegzes 
  FROM Palyak AS p JOIN Foglalasok AS f ON p.PID = f.PID
  WHERE p.PID = ?`;
  const values = [pid];

  return pool.query(sql, values);
}
