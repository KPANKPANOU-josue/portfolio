/* Fenêtre « Tester maintenant ». Pour brancher un vrai projet en ligne, mets son lien dans data-live="..." du bouton (index.html). */
const dlg = document.getElementById('demo'), body = document.getElementById('dm-body'), ttl = document.getElementById('dm-title');

const AERO = {
  '/aeroports': [{ code: 'LFW', nom: 'Lomé – Gnassingbé Eyadéma', lat: 6.1656, lon: 1.2545 }, { code: 'LRL', nom: 'Niamtougou', lat: 9.7677, lon: 1.091 }],
  '/vols': [{ id: 'AL101', de: 'LFW', vers: 'LRL', statut: 'à l’heure' }, { id: 'AL102', de: 'LRL', vers: 'LFW', statut: 'retardé' }],
  '/vols/AL101': { id: 'AL101', avion: 'ATR 72', capacite: 70, passagers: 52, fret_kg: 410, statut: 'à l’heure' },
  '/meteo/LFW': { aeroport: 'LFW', temp_c: 29, vent_kmh: 14, visibilite: 'bonne', piste: 'ouverte' }
};
const MENU = [['Riz au poulet', 2500], ['Poisson braisé', 3000], ['Pâtes bolognaise', 2000], ['Jus de bissap', 500]];

const demos = {
  aerolink() {
    body.innerHTML = `<p class="dm-note">Simulation : données fictives, avec le format de réponse d’une API REST.</p>
      <div class="cbtns">${Object.keys(AERO).map(k => `<button class="btn sm" data-k="${k}">GET ${k}</button>`).join('')}</div>
      <pre class="json" id="out">Clique sur un endpoint pour voir la réponse.</pre>`;
    body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { body.querySelector('#out').textContent = JSON.stringify(AERO[b.dataset.k], null, 2); });
  },
  cancer() {
    body.innerHTML = `<p class="dm-note">Démonstration fictive : ce résultat n’a aucune valeur médicale.</p>
      <label>Âge : <b id="va">45</b><input type="range" id="age" min="18" max="90" value="45"></label>
      <label>Taille de la masse (mm) : <b id="vs">10</b><input type="range" id="size" min="1" max="60" value="10"></label>
      <label><input type="checkbox" id="fam"> Antécédents familiaux</label>
      <div class="bar"><i id="bar"></i></div><p id="res"></p>`;
    const g = id => body.querySelector('#' + id);
    const calc = () => {
      const s = Math.min(100, Math.round(g('age').value * 0.3 + g('size').value * 1.2 + (g('fam').checked ? 15 : 0)));
      g('va').textContent = g('age').value; g('vs').textContent = g('size').value; g('bar').style.width = s + '%';
      g('res').textContent = `Niveau ${s < 35 ? 'faible' : s < 65 ? 'moyen' : 'élevé'} (fictif, ${s}/100). En vrai, consulte toujours un médecin.`;
    };
    body.querySelectorAll('input').forEach(i => i.oninput = calc); calc();
  },
  resto() {
    const q = MENU.map(() => 0);
    const draw = msg => {
      const tot = q.reduce((s, n, i) => s + n * MENU[i][1], 0);
      body.innerHTML = `<p class="dm-note">Simulation : menu fictif, prix en FCFA.</p>
        ${MENU.map((m, i) => `<div class="row"><span>${m[0]} <small>${m[1]} F</small></span><span><button class="btn sm" data-i="${i}" data-d="-1">−</button> <b>${q[i]}</b> <button class="btn sm" data-i="${i}" data-d="1">+</button></span></div>`).join('')}
        <div class="row"><b>Total</b><b>${tot} FCFA</b></div>
        <div class="cbtns"><button class="btn p sm" id="ok" ${tot ? '' : 'disabled'}>Valider la commande</button></div><p class="dm-note" style="margin-top:10px">${msg || ''}</p>`;
      body.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { q[b.dataset.i] = Math.max(0, q[b.dataset.i] + +b.dataset.d); draw(); });
      body.querySelector('#ok').onclick = () => { q.fill(0); draw('Commande n°' + Math.floor(1000 + Math.random() * 9000) + ' enregistrée.'); };
    };
    draw();
  }
};

document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => {
  ttl.textContent = b.dataset.title;
  if (b.dataset.live) {
    body.innerHTML = `<iframe src="${b.dataset.live}" title="${b.dataset.title}" style="width:100%;height:60vh;border:0;border-radius:10px;background:#fff"></iframe>
      <p class="dm-note"><a href="${b.dataset.live}" target="_blank" rel="noopener">Ouvrir dans un nouvel onglet</a></p>`;
  } else demos[b.dataset.demo]();
  dlg.showModal();
}));
document.getElementById('dm-close').onclick = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
