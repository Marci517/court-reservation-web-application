import pool from './dbConnection.js';

export function addFoglalas(fid, pid, kezd, veg, datum) {
  const sql = 'INSERT INTO Foglalasok (PID, FID, Datum, Kezdes, Vegzes) VALUES (?, ?, ?, ?, ?)';
  const values = [pid, fid, datum, kezd, veg];

  return pool.query(sql, values);
}

export function getOverlaps(pid, kezd, veg) {
  const sql = `SELECT* FROM Palyak AS p JOIN Foglalasok AS f ON p.PID = f.PID
    WHERE (((? BETWEEN f.Kezdes AND f.Vegzes) OR (? BETWEEN f.Kezdes AND f.Vegzes))
    OR ((f.Kezdes BETWEEN ? AND ?) OR (f.Vegzes BETWEEN ? AND ?))) AND p.PID = ?`;
  const values = [kezd, veg, kezd, veg, kezd, veg, pid];

  return pool.query(sql, values);
}

export function getOverlaps2(pid, kezd, veg) {
  const sql = `SELECT * FROM Palyak AS p
                 WHERE p.PID = ? AND ? <= p.NyitVeg AND ? >= p.NyitKezd AND ? <= p.NyitVeg AND ? >= p.NyitKezd`;

  const values = [pid, kezd, kezd, veg, veg];

  return pool.query(sql, values);
}

export function getFoglalasok(pid) {
  const sql = `SELECT f.Datum, f.Kezdes, f.Vegzes 
    FROM Palyak AS p JOIN Foglalasok AS f ON p.PID = f.PID
    WHERE p.PID = ?`;
  const values = [pid];

  return pool.query(sql, values);
}
