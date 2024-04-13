function szinez(figyeltText, beirtText) {
  const figyelt = figyeltText.value.split(' ');
  let beirt = beirtText.value;
  const box = document.getElementById('cb');

  for (const resz of figyelt) {
    let regex;

    if (box.checked) {
      regex = new RegExp(resz, 'g');
    } else {
      regex = new RegExp(resz, 'gi');
    }
    beirt = beirt.replace(regex, `<span class="szin">${resz}</span>`);
  }
  document.getElementsByClassName('eredmeny')[0].innerHTML = beirt;
}

window.onload = () => {
  const figyeltText = document.getElementById('figyeltszoveg');
  const beirtText = document.getElementById('beirtszoveg');
  beirtText.addEventListener('input', () => {
    szinez(figyeltText, beirtText);
  });
};
