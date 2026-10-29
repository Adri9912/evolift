# Evolift

**Chaque séance compte.** Un carnet de musculation personnel PUSH / PULL / LEGS, en français, utilisable sur mobile et ordinateur, avec thèmes jour et nuit.

## Lancer le projet

Prérequis : Node.js **22.12+** (Node 24 recommandé) et npm.

```bash
npm ci
npm run dev
```

Ouvrir **http://localhost:5173/evolift/**. Le serveur de développement recharge automatiquement les modifications. Pour le quitter : `Ctrl+C`.

Pour vérifier la version de production et sa PWA :

```bash
npm test
npm run build
npm run preview
```

Ouvrir **http://localhost:4173/evolift/**. Le service worker est actif dans la compilation de production, pas dans le serveur de développement. Les ports 5173 et 4173 sont des origines différentes : leurs sauvegardes sont distinctes.

## Ce que contient cette V1

- Accueil avec trois programmes, leurs durées estimées et les statistiques réelles.
- Navigation mobile à quatre onglets ; barre latérale sur ordinateur.
- Prénom facultatif demandé au premier lancement, modifiable ou retirable dans les réglages. Il personnalise discrètement l’accueil et la fin de séance ; la suggestion PUSH / PULL / LEGS suit la rotation et donne priorité à une séance en cours.
- Les 17 exercices du programme, dans l'ordre demandé, avec objectifs, repos, muscles, conseils et liens directs vers MuscleWiki.
- Une seule saisie globale par exercice : poids, séries effectuées, répétitions par série et difficulté.
- Une nouvelle séance démarre sans valeurs préremplies. La dernière performance reste une référence séparée.
- Sauvegarde à chaque modification, reprise après actualisation ou fermeture, historique indépendant et détail de séance.
- Confirmation de fin de séance. Seuls les exercices ayant les quatre informations valides sont comptés ; les exercices partiels sont exclus. Une séance vide peut être terminée.
- Graphiques Recharts : poids, répétitions, séries et volume. La difficulté et les valeurs exactes restent visibles dans les repères.
- Export/import JSON validé, confirmation de remplacement, suppression confirmée et récupération d'une sauvegarde illisible.
- PWA, cache du programme, du code et des graphiques, icônes originales et mise à jour proposée uniquement quand aucune séance n'est en cours.

Aucun compte, serveur applicatif, paiement ou stockage distant. Aucune séance de démonstration n'est fournie.

## Comprendre l'architecture

```text
src/
  App.jsx                     Navigation, état partagé, actions de séance
  components/                 Cartes, graphique et dialogue de confirmation
  pages/                      Accueil, Séance, Historique, Progression, Réglages
  data/programs.js             Les programmes et les 17 exercices
  data/muscles.js              Zones musculaires et tracés anatomiques originaux
  hooks/useStore.js            État React et sauvegarde immédiate
  hooks/usePwa.js              Installation et proposition de mise à jour
  services/storage.js         Lecture, écriture, validation, import et export
  utils/performance.js        Calculs, validation des nombres et cycle d'une séance
  utils/format.js             Dates, durées et nombres français
public/                       Favicon et icônes PWA
scripts/generate-icons.py     Déclinaison du logo fourni (Python et ImageMagick)
tests/core.test.js            Tests Node, sans bibliothèque supplémentaire
.github/workflows/deploy.yml  Vérification et déploiement GitHub Pages
```

Les pages affichent les données ; les fonctions de `utils` calculent et transforment ; le service `storage` lit et écrit. Ces séparations permettront de faire évoluer le stockage plus tard sans construire maintenant un backend ou un espace coach.

La navigation utilise le fragment d'URL (`#session`, `#history`, etc.). Le serveur reçoit toujours `/evolift/`, ce qui évite les erreurs 404 au rechargement sur GitHub Pages. React Router n'est pas nécessaire pour ces cinq pages.

Tailwind est intégré via son plugin Vite. La feuille `src/styles.css` définit aussi les composants visuels et les variables des deux thèmes. Lucide fournit les icônes, sans chargement de police ou média tiers.

## Comment les données fonctionnent

La clé localStorage est `evolift:data:v1`. Le format comprend :

```json
{
  "schemaVersion": 1,
  "sessions": [],
  "activeSession": null,
  "preferences": { "theme": "dark", "givenName": "", "welcomeCompleted": false }
}
```

Chaque séance possède un identifiant unique, un programme et une date de début. Une séance terminée possède aussi une date de fin. Les performances sont indexées par identifiant d'exercice.

Le volume d'un exercice est `poids × séries × répétitions`. Le poids et les répétitions sont identiques sur toutes les séries déclarées. Le poids nul est accepté (mouvement sans charge ajoutée), les séries et répétitions doivent être des entiers supérieurs à zéro. Limites de saisie : 2 000 kg, 100 séries, 1 000 répétitions ; les brouillons peuvent temporairement contenir zéro série/répétition, sans compter l'exercice comme effectué.

Pour les haltères, utilise une convention constante (par haltère ou somme des deux) pour garder des comparaisons utiles. Le volume est une estimation, pas une mesure de travail physique ni une comparaison entre machines. La durée inclut le temps écoulé entre début et fin, y compris une éventuelle interruption.

Les erreurs de lecture n'écrasent pas une sauvegarde existante. Les erreurs d'écriture sont affichées ; la saisie reste en mémoire, et terminer une séance est bloqué tant que l'écriture ne réussit pas. Dans ce cas, exporte depuis les réglages avant de fermer l'onglet. L'export brut permet de conserver une sauvegarde illisible avant réinitialisation.

L'import accepte seulement le schéma connu, des identifiants uniques, des programmes/exercices cohérents, des dates valides et des performances valides (10 Mo maximum). Il **remplace** les données après confirmation ; il ne fusionne pas les historiques.

Le prénom et le choix de passer la présentation sont inclus dans les exports JSON. Les anciennes sauvegardes sans ces champs restent acceptées ; la présentation sera proposée une fois après leur import.

Les données ne sont pas synchronisées entre navigateurs, appareils ou origines. Utilise un seul onglet pour enregistrer une séance : la V1 ne gère pas l'édition simultanée entre onglets. Exporte régulièrement et avant tout changement d'adresse ou de navigateur.

## Tester chaque étape

1. **Structure et design** : ouvrir l'accueil à 320–390 px puis sur ordinateur ; basculer jour/nuit et actualiser. Les cartes s'empilent sur mobile, les quatre onglets restent en bas.
2. **Programmes** : ouvrir « Voir le programme », changer PUSH / PULL / LEGS, contrôler l'ordre des exercices et ouvrir « Voir la technique ». Les démonstrations sont des liens externes ; aucun GIF ou vidéo protégé n'est intégré. Les liens MuscleWiki ont été vérifiés le 29 octobre 2026 et peuvent être en anglais.
3. **Saisie** : commencer une séance, saisir `15.5` kg, `3` séries, `15` répétitions et une difficulté. Vérifier la coche et l'avancement. Essayer une série décimale ou un poids négatif : ils sont refusés.
4. **Sauvegarde et historique** : renseigner un second exercice partiellement, revenir à l'accueil, reprendre puis actualiser. Terminer et confirmer : seul le premier exercice apparaît dans le détail. Commencer une autre séance : champs vides, dernière performance visible séparément.
5. **Progression** : après deux séances du même exercice, sélectionner l'exercice et les quatre mesures. Comparer les valeurs exactes sous le graphique. Avec zéro ou une seule performance, un message explique l'absence de courbe.
6. **PWA** : compiler, ouvrir l'aperçu en ligne et attendre la mise en cache. Actualiser une fois, couper le réseau puis recharger. Vérifier la saisie, l'historique et la progression ; les démonstrations externes restent indisponibles hors ligne.
7. **Sauvegardes et déploiement** : exporter les données. Vérifier qu'un JSON invalide est refusé et qu'un import valide demande confirmation. Tester le remplacement/suppression uniquement après export. Lancer `npm test` et `npm run build` avant publication.

Les 20 tests automatisés couvrent les programmes, décimales, limites, calculs, identifiants uniques, champs vides, conservation du brouillon, exclusion des exercices incomplets, indépendance de l'historique, sauvegarde/lecture, stockage refusé/corrompu et imports invalides. Ils vérifient aussi le prénom facultatif, la mémorisation du choix de passer, la validation du profil, la rotation suggérée et la compatibilité avec les anciennes sauvegardes sans prénom.

## Installer sur téléphone

Après publication en HTTPS :

- **iPhone / Safari** : Partager → Sur l'écran d'accueil → Ajouter.
- **Android / Chrome** : menu ⋮ → Installer l'application ou Ajouter à l'écran d'accueil. Un bouton d'installation est aussi proposé dans les réglages lorsque le navigateur le permet.

L'adresse `localhost` fonctionne uniquement sur l'appareil qui héberge le serveur. Pour installer sur le téléphone, utilise l'adresse HTTPS GitHub Pages après ton autorisation de publication. L'adresse réseau HTTP affichée par Vite permet une consultation locale sur le même Wi-Fi, mais ne garantit pas l'installation ni le service worker.

Les mises à jour n'actualisent pas automatiquement un formulaire. Une bannière propose l'application de la nouvelle version après la fin de la séance. Les ressources essentielles, y compris le module des graphiques, sont précachées. Les liens MuscleWiki nécessitent Internet.

## Connecter GitHub et activer Pages

Le dépôt distant est [Adri9912/evolift](https://github.com/Adri9912/evolift). Aucun push ni déploiement n’a encore été effectué à cette étape de préparation. **Les commandes suivantes sont à exécuter uniquement lorsque tu décides de publier.**

1. Créer sur GitHub un dépôt nommé **evolift**, vide, sans README initial.
2. Dans le dossier du projet, initialiser Git si nécessaire :

   ```bash
   git init
   git add .
   git commit -m "Créer Evolift V1"
   git branch -M main
   git remote add origin https://github.com/Adri9912/evolift.git
   ```

3. Dans le dépôt GitHub, ouvrir **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Quand tu souhaites publier, exécuter `git push -u origin main`.
5. Consulter l'onglet **Actions** : le workflow installe les dépendances verrouillées (`npm ci`), teste, compile puis déploie `dist/`.
6. Ouvrir `https://Adri9912.github.io/evolift/`. Vérifier ensuite l'installation et le mode avion sur les vrais appareils.

Le workflow teste aussi les pull requests sans les déployer. Un lancement manuel est disponible dans Actions. Il n'envoie les fichiers sur Pages que sur `main` ou via un lancement manuel ; le dossier `dist` et `node_modules` ne sont pas suivis par Git.

La base Vite, le manifeste, les assets et la portée du service worker sont configurés pour **`/evolift/`** (nom en minuscules). Si tu changes le nom du dépôt ou utilises un domaine personnalisé, adapte `base`, `manifest.id/start_url/scope` et `workbox.navigateFallback` dans `vite.config.js`, puis reconstruis. Un changement d'origine nécessite d'exporter et réimporter les données.

Documentation de référence : [Vite](https://vite.dev/guide/), [Tailwind avec Vite](https://tailwindcss.com/docs/installation/using-vite), [PWA React et mises à jour](https://vite-pwa-org.netlify.app/frameworks/react), [GitHub Pages avec Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Vérifications et limites

- Compilation de production et tests automatisés réussis.
- Parcours vérifié dans le navigateur : saisie décimale, rejet des séries décimales, rechargement, référence de la dernière performance, exclusion des exercices partiels, historique, thème mémorisé et graphiques.
- Test du cache : serveur de test arrêté, rechargement de l'application, fin de séance et premier chargement du graphique réussis depuis le cache.
- L'installation réelle sur iPhone/Android et le déploiement GitHub Pages restent à vérifier après une publication HTTPS autorisée.
- L'audit npm initial signale quatre alertes **faibles**, dans la chaîne de compilation PWA (`deepmerge` via Workbox). Aucun correctif compatible n'est proposé par npm au moment de la création ; ne pas exécuter `npm audit fix --force`, qui rétrograderait le plugin PWA. Aucune alerte modérée, élevée ou critique lors de cet audit.

## Repères musculaires

Dans « Voir la technique », chaque exercice dispose d’un schéma de face et de dos. Le muscle principal est mis en évidence en vert menthe, avec son nom et une légende ; les muscles secondaires restent indiqués en texte. Le développé incliné cible uniquement la partie haute des pectoraux sur le dessin.

Ces schémas SVG simplifiés ont été créés pour Evolift : aucun visuel MuscleWiki ou autre média externe n’est copié. Ils suivent les deux thèmes, s’adaptent au téléphone et sont inclus dans le code précaché de la PWA, donc disponibles hors ligne. Un test vérifie la correspondance des zones pour les 17 exercices.

Repères anatomiques consultés : [muscles extrinsèques du dos](https://www.ncbi.nlm.nih.gov/books/NBK537216/), [muscle brachial](https://www.ncbi.nlm.nih.gov/sites/books/NBK551630/).
