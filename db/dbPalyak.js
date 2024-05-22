import pool from './dbConnection.js';

export function addPalya(nev, oraber, cim, leiras, kezd, veg) {
  const sql = 'INSERT INTO Palyak (Nev, Oraber, Cim, Leiras, NyitKezd, NyitVeg) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nev, oraber, cim, leiras, kezd, veg];

  return pool.query(sql, values);
}

export function getPalyak(nev, orabermin, orabermax) {
  const sql = `SELECT p.PID, p.Nev, p.Cim, p.Oraber, p.Leiras, p.NyitKezd, p.NyitVeg
    FROM Palyak AS p
    WHERE p.Oraber <= ? AND p.Oraber >= ? AND p.Nev = ?`;
  const values = [orabermax, orabermin, nev];

  return pool.query(sql, values);
}

export function getPalyak2(orabermin, orabermax) {
  const sql = `SELECT p.PID, p.Nev, p.Cim, p.Oraber, p.Leiras, p.NyitKezd, p.NyitVeg
    FROM Palyak AS p
    WHERE p.Oraber <= ? AND p.Oraber >= ?`;
  const values = [orabermax, orabermin];

  return pool.query(sql, values);
}

export function getPalya(pid) {
  const sql = `SELECT p.PID, p.Nev, p.Cim, p.Oraber, p.Leiras, p.NyitKezd, p.NyitVeg, f.FNev
    FROM Palyak AS p
    LEFT JOIN Fenykepek AS f ON p.PID = f.PID
    WHERE p.PID = ?`;
  const values = [pid];

  return pool.query(sql, values);
}
