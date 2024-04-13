function szinez(figyeltText, beirtText) {
  let figyelt = figyeltText.value.split(' ');
  let beirt = beirtText.value;
  let box = document.getElementById('cb');

  for (let f in figyelt) {
    let resz = figyelt[f];
    let regex;
    if (resz != ' ') {
      if (box.checked) {
        regex = new RegExp(resz, 'g');
      } else {
        regex = new RegExp(resz, 'gi');
      }
      beirt = beirt.replace(regex, `<span class="szin">${resz}</span>`);
    }
  }
  document.getElementsByClassName('eredmeny')[0].innerHTML = beirt;
}

window.onload = () => {
  let figyeltText = document.getElementById('figyeltszoveg');
  let beirtText = document.getElementById('beirtszoveg');
  beirtText.addEventListener('input', () => {
    szinez(figyeltText, beirtText);
  });
};
