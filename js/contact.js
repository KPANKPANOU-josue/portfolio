/* ====== À MODIFIER : colle ici ton lien Formspree (voir README) ======
   Tant que c'est vide, le formulaire ouvre l'application mail du visiteur. */
const FORM_ENDPOINT = 'https://formspree.io/f/meaendel';

const form = document.getElementById('cform');
const status = document.getElementById('status');
const cnt = document.getElementById('cnt');
const msg = document.getElementById('fm');
const btn = form.querySelector('.send');
const MAIL = document.querySelector('.c-info a[href^="mailto:"]').getAttribute('href').slice(7);

const show = (text, kind) => { status.textContent = text; status.className = 'status ' + kind; };
msg.addEventListener('input', () => { cnt.textContent = msg.value.length + '/800'; });

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (form.elements['_gotcha'].value) return; // anti-spam
  const d = Object.fromEntries(new FormData(form));
  delete d._gotcha;

  if (!FORM_ENDPOINT) {
    const subject = `[${d.sujet}] Message de ${d.nom}`;
    const body = `${d.message}\n\n${d.nom} (${d.email})`;
    location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    show('Ton application mail s’ouvre : clique sur Envoyer pour terminer.', 'ok');
    return;
  }
  btn.disabled = true; show('Envoi en cours…', 'ok');
  try {
    const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(d) });
    if (!r.ok) throw new Error(r.status);
    form.reset(); cnt.textContent = '0/800';
    show('Message envoyé, merci ! Je te réponds vite.', 'ok');
  } catch {
    show('L’envoi a échoué. Écris-moi directement par email.', 'err');
  } finally { btn.disabled = false; }
});

/* Bouton CV : prévient si le fichier assets/cv.pdf n'existe pas encore */
let cvOk = true;
fetch('assets/cv.pdf', { method: 'HEAD' }).then(r => { cvOk = r.ok; }).catch(() => { cvOk = false; });
document.querySelectorAll('a[href="assets/cv.pdf"]').forEach(a =>
  a.addEventListener('click', e => { if (!cvOk) { e.preventDefault(); alert('Ajoute ton CV dans le dossier assets/ avec le nom cv.pdf'); } }));
