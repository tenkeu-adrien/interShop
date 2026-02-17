# Commandes essentielles

## 🚀 Développement

### Démarrer le serveur de développement
```bash
npm run dev
```
Ouvre l'application sur http://localhost:3000

### Build de production
```bash
npm run build
```
Crée une version optimisée pour la production

### Démarrer en mode production
```bash
npm run start
```
Lance le serveur de production (après build)

## 📦 Gestion des dépendances

### Installer toutes les dépendances
```bash
npm install
```

### Ajouter une nouvelle dépendance
```bash
npm install package-name
```

### Ajouter une dépendance de développement
```bash
npm install -D package-name
```

### Mettre à jour les dépendances
```bash
npm update
```

### Vérifier les vulnérabilités
```bash
npm audit
npm audit fix
```

## 🔥 Firebase

### Installer Firebase CLI
```bash
npm install -g firebase-tools
```

### Se connecter à Firebase
```bash
firebase login
```

### Initialiser Firebase dans le projet
```bash
firebase init
```
Sélectionner :
- Firestore
- Storage
- Hosting (optionnel)

### Déployer les règles Firestore
```bash
firebase deploy --only firestore:rules
```

### Déployer les indexes Firestore
```bash
firebase deploy --only firestore:indexes
```

### Déployer les règles Storage
```bash
firebase deploy --only storage:rules
```

### Déployer tout
```bash
firebase deploy
```

### Voir les logs Firebase
```bash
firebase functions:log
```

## 🧹 Nettoyage

### Nettoyer le cache Next.js
```bash
rm -rf .next
```

### Nettoyer node_modules et réinstaller
```bash
rm -rf node_modules package-lock.json
npm install
```

### Nettoyer tout
```bash
rm -rf .next node_modules package-lock.json
npm install
```

## 🔍 Vérification du code

### Vérifier les types TypeScript
```bash
npx tsc --noEmit
```

### Formater le code avec Prettier (si installé)
```bash
npx prettier --write .
```

### Linter (si configuré)
```bash
npm run lint
```

## 📊 Analyse

### Analyser la taille du bundle
```bash
npm run build
# Puis vérifier le rapport dans .next/analyze/
```

### Analyser les dépendances
```bash
npm list
npm list --depth=0  # Seulement les dépendances directes
```

## 🐛 Débogage

### Démarrer en mode debug
```bash
NODE_OPTIONS='--inspect' npm run dev
```

### Voir les variables d'environnement
```bash
# Windows CMD
set

# Windows PowerShell
Get-ChildItem Env:

# Linux/Mac
printenv
```

### Vérifier la version de Node
```bash
node --version
npm --version
```

## 🚢 Déploiement

### Déployer sur Vercel (via CLI)
```bash
npm install -g vercel
vercel login
vercel
```

### Déployer sur Vercel (production)
```bash
vercel --prod
```

### Déployer sur Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## 🗄️ Base de données

### Exporter Firestore
```bash
gcloud firestore export gs://[BUCKET_NAME]
```

### Importer dans Firestore
```bash
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_PREFIX]
```

### Supprimer toutes les données (ATTENTION!)
```bash
firebase firestore:delete --all-collections
```

## 🔐 Sécurité

### Vérifier les secrets exposés
```bash
# Installer git-secrets
git secrets --scan
```

### Vérifier les dépendances obsolètes
```bash
npm outdated
```

## 📝 Git

### Initialiser Git (si pas déjà fait)
```bash
git init
```

### Ajouter tous les fichiers
```bash
git add .
```

### Commit
```bash
git commit -m "Description du commit"
```

### Push vers GitHub
```bash
git remote add origin https://github.com/username/repo.git
git branch -M main
git push -u origin main
```

### Créer une nouvelle branche
```bash
git checkout -b feature/nom-feature
```

### Fusionner une branche
```bash
git checkout main
git merge feature/nom-feature
```

## 🧪 Tests (à configurer)

### Lancer les tests
```bash
npm test
```

### Tests en mode watch
```bash
npm test -- --watch
```

### Couverture de code
```bash
npm run test:coverage
```

### Tests E2E
```bash
npm run test:e2e
```

## 📱 Mobile (React Native - futur)

### Démarrer Metro
```bash
npx react-native start
```

### Lancer sur Android
```bash
npx react-native run-android
```

### Lancer sur iOS
```bash
npx react-native run-ios
```

## 🔧 Utilitaires

### Générer un composant (manuel)
```bash
# Créer le fichier
touch components/MonComposant.tsx
```

### Voir la taille des dossiers
```bash
# Windows PowerShell
Get-ChildItem | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round((Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)}}

# Linux/Mac
du -sh *
```

### Trouver les fichiers volumineux
```bash
# Linux/Mac
find . -type f -size +1M

# Windows PowerShell
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 1MB} | Select-Object FullName, Length
```

## 🆘 Dépannage

### Port 3000 déjà utilisé
```bash
# Utiliser un autre port
npm run dev -- -p 3001
```

### Erreur de permissions
```bash
# Windows : Lancer PowerShell en administrateur
# Linux/Mac
sudo npm install
```

### Cache corrompu
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problème avec Firebase
```bash
# Vérifier la configuration
firebase projects:list
firebase use --add

# Réinitialiser
firebase logout
firebase login
```

## 📚 Documentation

### Générer la documentation (si configuré)
```bash
npx typedoc
```

### Voir les scripts disponibles
```bash
npm run
```

## 🎯 Raccourcis utiles

### Tout en un : Clean + Install + Build
```bash
rm -rf .next node_modules package-lock.json && npm install && npm run build
```

### Déploiement rapide
```bash
npm run build && vercel --prod
```

### Mise à jour complète
```bash
npm update && npm audit fix && npm run build
```

## 💡 Conseils

1. **Toujours tester localement avant de déployer**
   ```bash
   npm run build && npm run start
   ```

2. **Vérifier les types avant de commit**
   ```bash
   npx tsc --noEmit
   ```

3. **Garder les dépendances à jour**
   ```bash
   npm outdated
   npm update
   ```

4. **Sauvegarder régulièrement**
   ```bash
   git add . && git commit -m "Sauvegarde" && git push
   ```

5. **Surveiller la taille du bundle**
   ```bash
   npm run build
   # Vérifier la sortie
   ```

## 🔗 Liens rapides

- Next.js Docs: https://nextjs.org/docs
- Firebase Console: https://console.firebase.google.com/
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: [Votre repo]

## 📞 Support

En cas de problème :
1. Vérifier les logs : `npm run dev` (regarder la console)
2. Vérifier Firebase Console
3. Consulter la documentation
4. Créer une issue sur GitHub
