const extended = [];

function getMessage(item, PID, index) {
  fetch(`/api/extends/${PID}`)
    .then((response) => response.json())
    .then((message) => {
      const nyitvatartas = item.children[item.children.length - 2];
      const leiras = item.children[item.children.length - 3];
      const reszletek = item.children[item.children.length - 1];
      const ujnyitvatartaskezd = message.NyitKezd;
      const ujnyitvatartasveg = message.NyitVeg;
      const ujnyitvatartasleiras = message.Leiras;

      console.log(ujnyitvatartaskezd);
      const spanLeiras = document.createElement('span');
      spanLeiras.textContent = ujnyitvatartasleiras;

      const spanNyit = document.createElement('span');
      spanNyit.textContent = `${ujnyitvatartaskezd}-${ujnyitvatartasveg}`;

      if (extended[index] === 0) {
        spanLeiras.classList.add('visible');
        spanNyit.classList.add('visible');
      } else {
        spanLeiras.classList.add('hidden');
        spanNyit.classList.add('hidden');
      }

      item.removeChild(reszletek);
      item.removeChild(leiras);
      item.removeChild(nyitvatartas);

      item.appendChild(spanLeiras);
      item.appendChild(spanNyit);
      item.appendChild(reszletek);

      extended[index] = extended[index] * -1 + 1;
    })
    .catch((error) => {
      console.error('Hiba történt:', error);
      alert('Hiba történt!');
    });
}

window.onload = () => {
  const items = document.querySelectorAll('.informaciok');

  for (let i = 0; i < items.length; i++) {
    extended[i] = 0;
  }

  for (let i = 0; i < items.length; i++) {
    items[i].addEventListener('click', () => {
      const pidd = items[i].dataset.pid;
      getMessage(items[i], pidd, i);
    });
  }
};
