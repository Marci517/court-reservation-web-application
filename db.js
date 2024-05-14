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
