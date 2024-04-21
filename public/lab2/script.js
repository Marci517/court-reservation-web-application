function clearElement(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
}

function checkEmpty(beirtText, figyeltText, elem) {
  if (!beirtText.value.trim()) {
    return true;
  }

  if (!figyeltText.value.trim()) {
    const text = beirtText.value;
    for (let j = 0; j < text.length; j++) {
      const span = document.createElement('span');
      span.textContent = text[j];
      span.classList.add('fekete');
      elem.appendChild(span);
    }
    return true;
  }

  return false;
}

function szinez(beirtText, figyeltText, box) {
  const elem = document.getElementById('eredmeny');

  clearElement(elem);
  if (checkEmpty(beirtText, figyeltText, elem)) {
    return;
  }

  const figyelt = figyeltText.value.trim().split(' ');
  const beirt = beirtText.value.trim().split(' ');

  for (let i = 0; i < beirt.length; i++) {
    const logtomb = [];
    let szo = beirt[i];
    const alap = szo;
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
      const startindexes = [];
      while (startindex !== -1) {
        startindexes[ind] = startindex;
        startindex = szo.indexOf(figyeltszo, startindex + 1);
        ind += 1;
      }
      for (let h = 0; h < startindexes.length; h++) {
        for (let k = 0; k < figyeltszo.length; k++) {
          logtomb[k + startindexes[h]] = true;
        }
      }
    }

    for (let j = 0; j < szo.length; j++) {
      if (logtomb[j]) {
        const span = document.createElement('span');
        span.textContent = alap[j];
        span.classList.add('piros');
        elem.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.textContent = alap[j];
        span.classList.add('fekete');
        elem.appendChild(span);
      }
    }
    const span = document.createElement('span');
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
