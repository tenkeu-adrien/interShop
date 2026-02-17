# ⚡ Solution Rapide - Erreur SMS Firebase

## 🔴 Erreur

```
SMS unable to be sent until this region enabled by the app developer
(auth/operation-not-allowed)
```

## ✅ Solution en 3 étapes

### Étape 1 : Ouvrir Firebase Console

🔗 https://console.firebase.google.com

1. Sélectionner le projet **interappshop**
2. Cliquer sur **Authentication**
3. Onglet **Sign-in method**

### Étape 2 : Configurer Phone Authentication

1. Cliquer sur **Phone** dans la liste
2. Chercher **"Allowed countries"** ou **"Phone number sign-in countries"**
3. Cliquer sur **Add country** ou **Edit**

### Étape 3 : Ajouter le Cameroun

1. Chercher **"Cameroon"** ou **"Cameroun"**
2. Cocher la case ☑️
3. Cliquer sur **Save**
4. Attendre 2-5 minutes

## 🎯 Alternative : Numéros de test (GRATUIT)

Si vous voulez tester SANS activer les régions :

### Dans Firebase Console

1. **Authentication** > **Sign-in method** > **Phone**
2. Descendre jusqu'à **"Phone numbers for testing"**
3. Ajouter :
   ```
   Numéro : +237651503914
   Code : 123456
   ```
4. Sauvegarder

### Tester

1. Entrer le numéro : `+237 651 50 39 14`
2. Cliquer sur "Envoyer le code"
3. Entrer le code : `123456`
4. ✅ Validé !

## ⚠️ Important

### Pour les SMS réels

- ❌ **Spark Plan (gratuit)** : Pas de SMS réels
- ✅ **Blaze Plan (payant)** : SMS réels (~$0.10 par SMS)

### Pour les tests

- ✅ **Numéros de test** : Gratuit, fonctionne sur Spark Plan
- ✅ Pas de SMS envoyé, code fixe

## 🚀 Recommandation

**Pour le développement** :
→ Utiliser les numéros de test (gratuit)

**Pour la production** :
→ Passer au Blaze Plan + Activer les régions

---

**Temps estimé** : 5 minutes
**Coût** : Gratuit (avec numéros de test)
