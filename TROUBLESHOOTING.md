# 🔧 Guide de dépannage - InterShop

## ⚠️ Problèmes courants et solutions

### 1. **Page reste sur "Chargement..." indéfiniment**

#### Symptôme
Une page affiche un spinner ou "Chargement..." sans jamais afficher les données.

#### Cause
Manque de `useEffect` pour charger les données depuis Firebase.

#### Solution
```typescript
// ❌ MAUVAIS - Données jamais chargées
const [stats] = useState({ totalProducts: 0, totalOrders: 0 });

// ✅ BON - Chargement des données
const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0 });
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (user?.id) {
    loadStats();
  }
}, [user?.id]);

const loadStats = async () => {
  setLoading(true);
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('fournisseurId', '==', user.id)
    );
    const snapshot = await getDocs(productsQuery);
    setStats({ totalProducts: snapshot.size, totalOrders: 0 });
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

---

### 2. **404 sur une route qui existe**

#### Symptôme
`GET /fr/dashboard/admin 404 (Not Found)` alors que le fichier `page.tsx` existe.

#### Causes possibles
1. Le serveur Next.js n'a pas rechargé
2. Le fichier est dans le mauvais dossier
3. Erreur de syntaxe dans le fichier

#### Solutions
```bash
# 1. Redémarrer le serveur
Ctrl+C
npm run dev

# 2. Vérifier la structure des dossiers
app/[locale]/dashboard/admin/page.tsx  ✅
app/dashboard/admin/page.tsx           ❌ (manque [locale])

# 3. Vérifier qu'il n'y a pas d'erreur de syntaxe
npm run build
```

---

### 3. **Images ne se chargent pas**

#### Symptôme
Images cassées ou erreur "Invalid src prop"

#### Cause
Domaine externe non autorisé dans `next.config.ts`

#### Solution
```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
    },
    {
      protocol: 'https',
      hostname: 'votre-domaine.com', // Ajouter ici
    },
  ],
}
```

---

### 4. **Requêtes Firebase très lentes**

#### Symptôme
Chargement de pages > 5 secondes

#### Causes
1. Pas de pagination
2. Pas d'indexes
3. Chargement de toutes les données

#### Solutions

##### A. Utiliser la pagination
```typescript
// ❌ MAUVAIS
const snapshot = await getDocs(collection(db, 'orders'));

// ✅ BON
const { data, loadNextPage } = usePagination({
  collectionName: 'orders',
  pageSize: 20
});
```

##### B. Déployer les indexes
```bash
firebase deploy --only firestore:indexes
```

##### C. Utiliser le cache
```typescript
import { cache } from '@/lib/cache/simpleCache';

const cachedData = cache.get('dashboard-stats');
if (cachedData) {
  setStats(cachedData);
} else {
  const data = await loadFromFirebase();
  cache.set('dashboard-stats', data, 5 * 60 * 1000);
}
```

---

### 5. **Erreur "Missing queryFn"**

#### Symptôme
Console affiche "Missing queryFn" avec React Query

#### Cause
Hook utilisé sans fonction de fetch

#### Solution
```typescript
// ❌ MAUVAIS
const { data } = useQuery({ queryKey: ['orders'] });

// ✅ BON
const { data } = useQuery({
  queryKey: ['orders'],
  queryFn: async () => {
    const snapshot = await getDocs(collection(db, 'orders'));
    return snapshot.docs.map(doc => doc.data());
  }
});
```

---

### 6. **Erreur "hydration mismatch"**

#### Symptôme
Warning dans la console sur hydration

#### Cause
Contenu différent entre serveur et client (souvent dates, random, localStorage)

#### Solution
```typescript
// ❌ MAUVAIS
<div>{new Date().toString()}</div>

// ✅ BON
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

return <div>{new Date().toString()}</div>;
```

---

### 7. **Bundle JavaScript trop gros**

#### Symptôme
Premier chargement > 5 secondes

#### Solution
```typescript
// Lazy load des composants lourds
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
  loading: () => <p>Chargement...</p>
});
```

---

### 8. **Erreur "Firebase: Error (auth/popup-blocked)"**

#### Symptôme
Connexion Google/Facebook ne fonctionne pas

#### Solutions
1. Autoriser les popups dans le navigateur
2. Utiliser redirect au lieu de popup :
```typescript
// ❌ Popup (peut être bloqué)
await signInWithPopup(auth, provider);

// ✅ Redirect (toujours fonctionne)
await signInWithRedirect(auth, provider);
```

---

### 9. **Cache ne fonctionne pas**

#### Symptôme
Données rechargées à chaque visite malgré le cache

#### Vérifications
```typescript
// 1. Vérifier que la clé est constante
cache.set('dashboard-stats', data);  // ✅
cache.set(`dashboard-${Date.now()}`, data);  // ❌

// 2. Vérifier le TTL
cache.set('data', value, 5 * 60 * 1000);  // 5 minutes

// 3. Vérifier l'invalidation
cache.has('dashboard-stats');  // true ou false ?
```

---

### 10. **Erreur "Cannot read properties of undefined"**

#### Symptôme
Erreur lors de l'accès à des propriétés d'objets

#### Solution
Utiliser l'optional chaining et les valeurs par défaut :
```typescript
// ❌ MAUVAIS
<p>{user.displayName}</p>

// ✅ BON
<p>{user?.displayName || 'Utilisateur'}</p>
```

---

## 🔍 Debug en production

### Vérifier les logs Firebase
```bash
firebase functions:log
```

### Vérifier les erreurs Vercel
1. Dashboard Vercel > Logs
2. Filtrer par "Error"

### Monitoring en temps réel
```typescript
// Ajouter des logs stratégiques
console.log('🔍 Loading data for user:', user?.id);
console.time('loadOrders');
const orders = await loadOrders();
console.timeEnd('loadOrders');
console.log('✅ Orders loaded:', orders.length);
```

---

## 📝 Checklist de debug

Quand une page ne fonctionne pas :

- [ ] Vérifier la console navigateur (F12)
- [ ] Vérifier le terminal du serveur Next.js
- [ ] Vérifier que l'utilisateur est connecté (`console.log(user)`)
- [ ] Vérifier que les règles Firestore autorisent l'accès
- [ ] Vérifier que les indexes Firebase existent
- [ ] Vérifier que le composant a un `useEffect` pour charger les données
- [ ] Vérifier qu'il y a un état `loading` qui passe à `false`
- [ ] Redémarrer le serveur en dernier recours

---

## 🚨 En cas d'urgence

### Rollback rapide
```bash
# Git
git log --oneline  # Voir les commits
git revert HEAD    # Annuler le dernier commit

# Vercel
# Dashboard > Deployments > Previous > Promote to Production
```

### Désactiver une fonctionnalité
```typescript
// Feature flag temporaire
const ENABLE_FEATURE = false;

{ENABLE_FEATURE && <NewFeature />}
```

---

Date : 2024
