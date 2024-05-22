const extended = [];

function getMessage(item, index) {
  console.log(index);
  fetch('/api/extends/palyak_lista')
    .then((response) => response.json())
    .then((message) => {
      console.log(message);
      const nyitvatartas = item.children[item.children.length - 2];
      const leiras = item.children[item.children.length - 3];
      const reszletek = item.children[item.children.length - 1];
      const spanLeiras = document.createElement('span');
      spanLeiras.textContent = leiras.textContent;
      const spanNyit = document.createElement('span');
      spanNyit.textContent = nyitvatartas.textContent;
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
    });
}

window.onload = () => {
  const text = document.getElementById('palyak_lista');
  const items = text.children;
  for (let i = 0; i < items.length; i++) {
    extended[i] = 0;
  }
  for (let i = 0; i < items.length; i++) {
    items[i].addEventListener('click', () => {
      getMessage(items[i], i);
    });
  }
};
