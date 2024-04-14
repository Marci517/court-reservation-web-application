function szinez(beirtText, figyeltText, box) {
  let figyelt = figyeltText.value.trim().split(' ');
  let beirt = beirtText.value.trim().split(' ');
  let elem = document.getElementById('eredmeny');

  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }

  for (let i = 0; i < beirt.length; i++) {
    let logtomb = [];
    let szo = beirt[i];
    let alap = szo;
    if (!box.checked) {
      szo = szo.toLowerCase();
    }
    for (let j = 0; j < szo.length; j++) {
      logtomb[j] = false;
    }
    for (let j = 0; j < figyelt.length; j++) {
      let figyeltszo = figyelt[j];
      if (!box.checked) {
        figyeltszo = figyeltszo.toLowerCase();
      }
      let startindex = szo.indexOf(figyeltszo);
      let ind = 0;
      let startindexes = [];
      while (startindex !== -1) {
        startindexes[ind] = startindex;
        startindex = szo.indexOf(figyeltszo, startindex + 1);
        ind = ind + 1;
      }
      for (let h = 0; h < startindexes.length; h++) {
        for (let k = 0; k < figyeltszo.length; k++) {
          logtomb[k + startindexes[h]] = true;
        }
      }
    }

    for (let j = 0; j < szo.length; j++) {
      if (logtomb[j]) {
        let span = document.createElement('span');
        span.textContent = alap[j];
        span.classList.add('piros');
        elem.appendChild(span);
      } else {
        let span = document.createElement('span');
        span.textContent = alap[j];
        span.classList.add('fekete');
        elem.appendChild(span);
      }
    }
    let span = document.createElement('span');
    span.textContent = ' ';
    span.classList.add('fekete');
    elem.appendChild(span);
  }
}

window.onload = () => {
  const beirtText = document.getElementById('beirtszoveg');
  const figyeltText = document.getElementById('figyeltszoveg');
  const box = document.getElementById('cb');

  beirtText.addEventListener('input', () => {
    szinez(beirtText, figyeltText, box);
  });

  figyeltText.addEventListener('input', () => {
    szinez(beirtText, figyeltText, box);
  });

  box.addEventListener('input', () => {
    szinez(beirtText, figyeltText, box);
  });
};
