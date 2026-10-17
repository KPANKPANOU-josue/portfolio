import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* ====== À MODIFIER : tes deux villes ====== */
const FROM = { name: 'Lomé',     lat: 6.13,  lon: 1.22 };   // ta ville
const TO   = { name: 'Allemagne', lat: 52.52, lon: 13.40 }; // Berlin : change-le si besoin
const LAND_MASK = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png';
const ROLES = ['Développeur Back-end', 'Passionné d’IA', 'Étudiant en Licence 3 GLSI'];

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const box = document.getElementById('globe');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
box.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.z = 3.3;
const globe = new THREE.Group();
scene.add(globe);

// Étoiles
{
  const p = [];
  for (let i = 0; i < 500; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(6 + Math.random() * 4);
    p.push(v.x, v.y, v.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8fa3d1, size: 0.02, transparent: true, opacity: 0.7 })));
}

globe.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), new THREE.MeshBasicMaterial({ color: 0x080c18 })));
[[1.04, 0.1], [1.1, 0.05], [1.2, 0.025]].forEach(([r, o]) =>
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(r, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x2ee6b6, transparent: true, opacity: o, side: THREE.BackSide }))));

const toVec = (lat, lon, r = 1) => {
  const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};

function addDots(isLand) {
  const N = 22000, pos = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), a = i * 2.399963;
    const lat = Math.asin(y) * 180 / Math.PI;
    const lon = ((Math.atan2(Math.sin(a), Math.cos(a)) * 180 / Math.PI) + 540) % 360 - 180;
    if (isLand(lat, lon)) { const v = toVec(lat, lon, 1.003); pos.push(v.x, v.y, v.z); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  globe.add(new THREE.Points(g, new THREE.PointsMaterial({
    color: 0x2ee6b6, size: 0.014, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
}
const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = () => {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  addDots((lat, lon) => {
    const px = Math.floor((lon + 180) / 360 * (c.width - 1)), py = Math.floor((90 - lat) / 180 * (c.height - 1));
    return d[(py * c.width + px) * 4] < 128; // si les continents sont inversés : > 128
  });
};
img.onerror = () => addDots(() => true);
img.src = LAND_MASK;

// Marqueurs, anneaux pulsants, étiquettes, arc animé
const a = toVec(FROM.lat, FROM.lon), b = toVec(TO.lat, TO.lon);
const rings = [], pins = [];
[[a, FROM.name], [b, TO.name]].forEach(([p, name]) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), new THREE.MeshBasicMaterial({ color: 0x35c8ff }));
  m.position.copy(p); globe.add(m);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.036, 32),
    new THREE.MeshBasicMaterial({ color: 0x35c8ff, transparent: true, side: THREE.DoubleSide }));
  ring.position.copy(p.clone().multiplyScalar(1.004)); ring.lookAt(p.clone().multiplyScalar(2));
  globe.add(ring); rings.push(ring);
  const el = document.createElement('span'); el.className = 'pin'; el.textContent = name;
  box.appendChild(el); pins.push([el, p]);
});
const mid = a.clone().add(b).normalize().multiplyScalar(1.5);
const arcPts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(100);
const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
globe.add(new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0x35c8ff })));

globe.rotation.y = -(FROM.lon + 90) * Math.PI / 180 + 0.9;
globe.rotation.x = 0.35;

function resize() {
  const s = box.clientWidth; renderer.setSize(s, s, false);
  camera.aspect = 1; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// Projets sur le globe : on peut voir où chaque projet a été réalisé
const projects = [...document.querySelectorAll('.card')].map(el => {
  const lat = +el.dataset.lat, lon = +el.dataset.lon, p = toVec(lat, lon);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff7ad9 }));
  dot.position.copy(p.clone().multiplyScalar(1.004)); globe.add(dot);
  return { p, lat, lon, title: el.querySelector('h3').textContent, place: el.dataset.place };
});
const selVec = new THREE.Vector3(), projEl = document.createElement('span');
projEl.className = 'pin proj'; projEl.style.opacity = 0; box.appendChild(projEl); pins.push([projEl, selVec]);
const selRing = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.036, 32), new THREE.MeshBasicMaterial({ color: 0xff7ad9, transparent: true, side: THREE.DoubleSide }));
selRing.visible = false; globe.add(selRing); rings.push(selRing);
let focus = null;
function focusProject(i) {
  const pr = projects[i]; if (!pr) return;
  selVec.copy(pr.p); projEl.textContent = pr.title + ' — ' + pr.place;
  selRing.visible = true; selRing.position.copy(pr.p).multiplyScalar(1.004);
  selRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pr.p.clone().normalize());
  focus = { ry: -(pr.lon + 90) * Math.PI / 180, rx: pr.lat * Math.PI / 180 * 0.9 };
}
document.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
  focusProject(+b.dataset.i); document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
}));

let drag = false, lx = 0, t = 0;
box.addEventListener('pointerdown', e => { drag = true; focus = null; lx = e.clientX; box.setPointerCapture(e.pointerId); });
box.addEventListener('pointermove', e => { if (drag) { globe.rotation.y += (e.clientX - lx) * 0.006; lx = e.clientX; } });
box.addEventListener('pointerup', () => drag = false);

(function loop() {
  t += 0.016;
  if (focus && !drag) {
    globe.rotation.y += Math.atan2(Math.sin(focus.ry - globe.rotation.y), Math.cos(focus.ry - globe.rotation.y)) * 0.06;
    globe.rotation.x += (focus.rx - globe.rotation.x) * 0.06;
  } else if (!drag && !still) globe.rotation.y += 0.003;
  camera.position.z += ((focus ? 2.7 : 3.3) - camera.position.z) * 0.05;
  const n = still ? 101 : Math.min(101, Math.floor(((t % 6) / 3) * 101)); // l’arc se dessine puis repart
  arcGeo.setDrawRange(0, n);
  rings.forEach(r => { const k = (t * 0.7) % 1; r.scale.setScalar(1 + k * 4); r.material.opacity = 1 - k; });
  globe.updateMatrixWorld();
  pins.forEach(([el, p]) => {
    const w = p.clone().applyMatrix4(globe.matrixWorld);
    const front = w.clone().normalize().dot(camera.position.clone().normalize()) > 0.2;
    const s = w.project(camera);
    el.style.transform = `translate(${(s.x * 0.5 + 0.5) * box.clientWidth}px,${(-s.y * 0.5 + 0.5) * box.clientHeight}px)`;
    el.style.opacity = front ? 1 : 0;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
})();

/* ---------- Texte qui s’écrit (titre) ---------- */
const roleEl = document.getElementById('role');
if (!still) {
  let w = 0, i = 0, del = false;
  (function type() {
    const word = ROLES[w];
    i += del ? -1 : 1;
    roleEl.textContent = word.slice(0, i);
    let wait = del ? 40 : 80;
    if (!del && i === word.length) { del = true; wait = 1600; }
    else if (del && i === 0) { del = false; w = (w + 1) % ROLES.length; wait = 300; }
    setTimeout(type, wait);
  })();
}

/* ---------- Lumière qui suit la souris ---------- */
const glow = document.getElementById('glow');
addEventListener('pointermove', e => { glow.style.setProperty('--x', e.clientX + 'px'); glow.style.setProperty('--y', e.clientY + 'px'); });

/* ---------- Carrousel de projets ---------- */
const cards = [...document.querySelectorAll('.card')];
let cur = 0;
function place() {
  cards.forEach((el, i) => {
    let d = (i - cur + cards.length) % cards.length;
    if (d > cards.length / 2) d -= cards.length;
    el.style.transform = `translateX(${d * 60}%) translateZ(${-Math.abs(d) * 160}px) rotateY(${-d * 18}deg)`;
    el.style.opacity = Math.abs(d) > 1 ? 0 : (d === 0 ? 1 : 0.45);
    el.style.zIndex = 10 - Math.abs(d);
    el.style.pointerEvents = d === 0 ? 'auto' : 'none';
  });
}
document.getElementById('next').onclick = () => { cur = (cur + 1) % cards.length; place(); focusProject(cur); };
document.getElementById('prev').onclick = () => { cur = (cur - 1 + cards.length) % cards.length; place(); focusProject(cur); };
place();
