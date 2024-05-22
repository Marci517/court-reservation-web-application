import pool from './dbConnection.js';

export function addFenykep(pid, nev) {
  const sql = 'INSERT INTO Fenykepek (PID, FNev) VALUES (?, ?)';
  const values = [pid, nev];

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

export const deleteKep = async (FNev) => {
  const [result] = await pool.query('DELETE FROM Fenykepek WHERE FNev = ?', [FNev]);
  return result.affectedRows > 0;
};
