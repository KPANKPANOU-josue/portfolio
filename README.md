# Mon portfolio

Portfolio statique (HTML, CSS, JavaScript) avec un globe 3D (Three.js) et un carrousel de projets.

## Lancer en local
Les modules JavaScript demandent un petit serveur (ouvrir le fichier directement ne marche pas) :

    python3 -m http.server 8000

Puis ouvre http://localhost:8000

## Personnaliser
- `index.html` : ton nom, ton titre, ton parcours, tes projets, tes technologies, ton contact.
- `js/main.js` : tes deux villes (`FROM` et `TO`) en haut du fichier.
- `css/style.css` : les couleurs sont dans `:root` (`--ac` et `--ac2`).

## Mettre sur GitHub avec GitHub Pages
1. Crée un dépôt sur github.com nommé `portfolio` (ou `ton-pseudo.github.io` pour avoir l'adresse principale).
2. Dans ce dossier :

       git init
       git add .
       git commit -m "Premier commit"
       git branch -M main
       git remote add origin https://github.com/TON-PSEUDO/portfolio.git
       git push -u origin main

3. Sur GitHub : Settings > Pages > Source : `Deploy from a branch` > branche `main`, dossier `/ (root)` > Save.
4. Après 1 à 2 minutes, ton site est sur `https://TON-PSEUDO.github.io/portfolio/`.

## À compléter avant d'envoyer le lien
Les zones entourées en orange pointillé dans le site sont à remplir. Cherche `todo` dans `index.html` : quand c'est rempli, supprime `class="todo"`.
Ajoute aussi `assets/CV.pdf` (ton CV) et tes captures d'écran dans `assets/`.

## Bouton « Télécharger mon CV »
Mets ton CV dans le dossier `assets/` avec exactement le nom `cv.pdf`.

## Formulaire de contact
GitHub Pages ne peut pas envoyer d'emails seul. Gratuit avec Formspree :
1. Crée un compte sur formspree.io, puis « New form » avec ton email.
2. Copie le lien du formulaire (il ressemble à `https://formspree.io/f/abcdwxyz`).
3. Dans `js/contact.js`, colle-le dans `FORM_ENDPOINT`, puis push sur GitHub.
Tant que `FORM_ENDPOINT` est vide, le formulaire ouvre simplement l'application mail du visiteur.
