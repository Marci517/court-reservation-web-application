function szinez(beirtText) {
  const figyeltText = document.getElementById('figyeltszoveg');
  let figyelt = figyeltText.value.trim();
  figyelt = figyelt.split(' ');
  let beirt = beirtText.value;
  const box = document.getElementById('cb');

  for (let i = 0; i < figyelt.length; i++) {
    const resz = figyelt[i];
    let regex;
    if (box.checked) {
      regex = new RegExp(resz, 'g');
    } else {
      regex = new RegExp(resz, 'gi');
    }
    beirt = beirt.replace(regex, `<span class="szin">${resz}</span>`);
  }
  //document.getElementsByClassName('eredmeny')[0].innerHTML = beirt;
  let elem = document.getElementById('eredmeny');
  let gyerek = elem.childNodes;
  for (let i = 0; i < gyerek.length; i++) {
    elem.removeChild(gyerek[i]);
  }
  elem.appendChild(document.createTextNode(beirt));
}

window.onload = () => {
  const beirtText = document.getElementById('beirtszoveg');
  beirtText.addEventListener('input', () => {
    szinez(beirtText);
  });

  document.getElementById('cb').addEventListener('input', () => {
    szinez(beirtText);
  });
};
