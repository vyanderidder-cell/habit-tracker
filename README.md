# Carnet — V1 : tracker d'habitudes

Première brique du projet : suivre des habitudes (sport, skincare, etc.) avec
une grille des 7 derniers jours et des séries ("streaks"). Le constructeur de
séances et la nutrition (OpenFoodFacts) viendront après, une fois que celle-ci
tourne.

## 1. Créer le projet Supabase (5 min, une seule fois)

1. Va sur [supabase.com](https://supabase.com), crée un compte gratuit.
2. "New project" → choisis un nom et un mot de passe de base de données
   (garde-le de côté, tu n'en auras normalement plus besoin).
3. Une fois le projet créé, va dans **SQL Editor** (menu de gauche) → "New
   query", colle tout le contenu de `supabase/schema.sql`, puis clique
   "Run". Ça crée les deux tables (`habits`, `habit_logs`) et les règles de
   sécurité.
4. Va dans **Settings → API**. Tu y trouveras deux valeurs :
   - `Project URL`
   - `anon public` key
5. Dans ce projet, duplique `.env.example` en `.env` et colle ces deux
   valeurs dedans.

Par défaut, Supabase demande une confirmation par email à l'inscription.
Pour tester plus vite entre potes au début, tu peux la désactiver dans
**Authentication → Providers → Email → "Confirm email"** (à réactiver plus
tard si tu ouvres vraiment au public).

## 2. Lancer le projet sur PC

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (en général `http://localhost:5173`). Crée un compte
avec ton email, ajoute une habitude, coche des jours.

## 3. Mettre le code sur GitHub (une fois, depuis le PC)

```bash
git init
git add .
git commit -m "V1 : tracker d'habitudes"
```

Crée un repo vide sur [github.com](https://github.com) (bouton "New"), puis :

```bash
git remote add origin <URL_DE_TON_REPO>
git branch -M main
git push -u origin main
```

## 4. Déployer en ligne avec Vercel (une fois, puis c'est automatique)

1. Va sur [vercel.com](https://vercel.com), connecte-toi avec ton compte
   GitHub.
2. "Add New → Project", choisis ton repo `habit-tracker`.
3. Dans "Environment Variables", ajoute `VITE_SUPABASE_URL` et
   `VITE_SUPABASE_ANON_KEY` (les mêmes valeurs que ton `.env`).
4. "Deploy". Tu obtiens une URL publique (ex : `carnet.vercel.app`).

À partir de là, à chaque fois que tu fais `git push`, le site se
redéploie tout seul.

## 5. Travailler depuis l'iPad le reste de la semaine

- **Modifier du code** : va sur [stackblitz.com](https://stackblitz.com),
  "Import from GitHub", colle l'URL de ton repo. Tu peux éditer et voir
  l'aperçu en direct dans Safari. Pour sauvegarder tes changements sur
  GitHub depuis StackBlitz, connecte ton compte GitHub dans les réglages
  StackBlitz puis utilise "Commit & push" dans l'interface.
- **Sans coder** : teste le site déployé sur Vercel dans Safari, note les
  bugs et idées (Notes/Notion), rédige les textes et la liste
  d'habitudes/exercices que tu ajouteras plus tard, maquette des écrans sur
  Figma.

## Prochaines étapes (pas encore dans ce projet)

- Constructeur de séances de sport perso.
- Intégration OpenFoodFacts pour la nutrition.
- Conseils skincare écrits par tes soins au départ.

Résiste à l'envie de tout ajouter d'un coup : fais tester cette V1 (tracker
seul) à 10-20 personnes avant d'aller plus loin. Si personne ne revient
cocher ses habitudes après quelques jours, ce n'est pas la peine de
construire le reste — mieux vaut le savoir maintenant qu'après trois mois de
travail.
