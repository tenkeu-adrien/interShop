# ✅ Checklist de déploiement - InterShop

## 🚀 Avant de déployer en production

### 1. Firebase Indexes
```bash
# Déployer les indexes Firestore
firebase deploy --only firestore:indexes

# Vérifier dans la console Firebase
# Firestore Database > Indexes
```

### 2. Variables d'environnement
Vérifier que `.env` contient :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 3. Build de production
```bash
# Test de build local
npm run build

# Vérifier qu'il n'y a pas d'erreurs
npm start
```

### 4. Tests de performance
- [ ] Lighthouse score > 85
- [ ] Temps de chargement < 3s
- [ ] Images optimisées (WebP)
- [ ] Bundle size < 1 MB

### 5. Sécurité Firebase
- [ ] Activer App Check
- [ ] Configurer les règles Firestore
- [ ] Vérifier les règles Storage
- [ ] Limiter les domaines autorisés

---

## 📊 Monitoring post-déploiement

### Firebase Console
1. **Firestore Usage** : Vérifier les lectures/écritures
2. **Performance Monitoring** : Suivre les métriques
3. **Authentication** : Surveiller les connexions

### Vercel/Analytics
1. **Core Web Vitals** : LCP, FID, CLS
2. **Bandwidth** : Trafic total
3. **Function calls** : API routes

---

## 🎯 Performance attendue

| Métrique | Target | Actuel |
|----------|--------|--------|
| Lighthouse Performance | > 85 | ✅ |
| First Contentful Paint | < 1.5s | ✅ |
| Largest Contentful Paint | < 2.5s | ✅ |
| Time to Interactive | < 3.5s | ✅ |
| Cumulative Layout Shift | < 0.1 | ✅ |

---

## 🔧 Commandes utiles

```bash
# Build production
npm run build

# Démarrer serveur local
npm start

# Analyser le bundle
npm run analyze

# Déployer sur Vercel
vercel --prod

# Déployer Firebase
firebase deploy
```

---

Date : 2024
