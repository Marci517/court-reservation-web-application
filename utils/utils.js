import fs from 'fs';

export function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Hiba történt a fájl törlése közben:', err);
    } else {
      console.log('A fájl sikeresen törölve.');
    }
  });
}

export function getminmaxnev(data) {
  if (!data.f3orabermin) {
    data.f3orabermin = '0';
  }
  if (!data.f3orabermax) {
    data.f3orabermax = '100000';
  }
  if (!data.palyakkliens) {
    data.palyakkliens = 'osszes';
  }
  return data;
}
