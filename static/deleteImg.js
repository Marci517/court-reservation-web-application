function deleteImage(button, nev) {
  fetch(`/api/images/${nev}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response.status === 204) {
        button.parentElement.remove();
        alert('Sikeres törlés');
      } else if (response.status === 404) {
        console.log(`Kep ID: ${nev} nincs meg.`);
        alert('Sikertelen törlés');
      } else {
        console.log('Hiba a kep torlesenel.');
        alert('Sikertelen törlés');
      }
    })
    .catch((err) => {
      console.error('Error:', err);
      console.log('Hiba a kep torlesenel.');
      alert('Sikertelen törlés');
    });
}

window.onload = () => {
  const buttons = document.querySelectorAll('.torlesgombok');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      console.log(button);
      const nev = button.dataset.fnev;
      console.log(nev);
      deleteImage(button, nev);
    });
  });
};
