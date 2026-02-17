# 📱 Guide: Activer Phone Authentication dans Firebase

## ⚠️ IMPORTANT - À FAIRE MAINTENANT

Pour que la vérification par téléphone fonctionne, vous DEVEZ activer Phone Authentication dans Firebase Console.

## 🚀 Étapes rapides (5 minutes)

### Étape 1: Ouvrir Firebase Console

Allez sur: https://console.firebase.google.com/project/interappshop/authentication/providers

### Étape 2: Activer Phone Authentication

1. Dans la liste des fournisseurs d'authentification, trouvez **"Phone"**

2. Cliquez sur **"Phone"**

3. Activez le bouton **"Enable"** (Activer)

4. Cliquez sur **"Save"** (Enregistrer)

### Étape 3: Configurer les domaines autorisés

1. Allez sur: https://console.firebase.google.com/project/interappshop/authentication/settings

2. Section **"Authorized domains"** (Domaines autorisés)

3. Vérifiez que ces domaines sont présents:
   - `localhost` (pour développement local)
   - Votre domaine de production (ex: `votresite.com`)

4. Si `localhost` n'est pas présent, ajoutez-le:
   - Cliquez sur **"Add domain"**
   - Entrez `localhost`
   - Cliquez sur **"Add"**

### Étape 4: (Optionnel) Configurer des numéros de test

Pour tester sans consommer de SMS:

1. Allez sur: https://console.firebase.google.com/project/interappshop/authentication/settings

2. Section **"Phone numbers for testing"**

3. Cliquez sur **"Add phone number"**

4. Entrez un numéro de test (ex: `+237600000000`)

5. Entrez un code de test (ex: `123456`)

6. Cliquez sur **"Add"**

Maintenant vous pouvez tester avec ce numéro sans recevoir de SMS réel.

## ✅ Vérification

Pour vérifier que tout fonctionne:

1. Redémarrez votre serveur Next.js:
   ```bash
   npm run dev
   ```

2. Créez un compte fournisseur sur `/register`

3. Vérifiez votre email sur `/verify-email`

4. Vous serez redirigé vers `/verify-phone`

5. Entrez votre numéro de téléphone

6. Vous devriez recevoir un SMS avec le code

## 🔍 Logs à surveiller

Dans la console du navigateur (F12), vous devriez voir:

```
reCAPTCHA résolu
Code envoyé par SMS !
```

Si vous voyez des erreurs, vérifiez:
- Phone Auth est bien activé
- Le domaine est autorisé
- Le numéro est au format international (+237...)

## 💰 Quotas et coûts

### Gratuit
- 10,000 vérifications SMS par mois

### Payant (au-delà de 10,000)
- ~0.01$ à 0.02$ par SMS selon le pays
- Cameroun: ~0.02$ par SMS

### Surveiller les quotas

1. Allez sur: https://console.firebase.google.com/project/interappshop/usage

2. Section **"Authentication"**

3. Vous verrez le nombre de SMS envoyés ce mois

## 🛡️ Sécurité

### reCAPTCHA

Firebase Phone Auth utilise automatiquement reCAPTCHA pour:
- Bloquer les bots
- Prévenir les abus
- Protéger contre les attaques

Le reCAPTCHA est **invisible** - l'utilisateur ne voit rien.

### Rate Limiting

J'ai déjà implémenté:
- Maximum 1 demande de code par minute
- Code expire après 2 minutes
- Historique des tentatives sauvegardé

## ❌ Problèmes courants

### "Phone authentication is not enabled"

**Solution**: Retournez à l'Étape 2 et activez Phone Authentication

### "reCAPTCHA verification failed"

**Solutions**:
1. Vérifiez que le domaine est autorisé (Étape 3)
2. Videz le cache du navigateur
3. Désactivez les bloqueurs de publicité
4. Essayez en navigation privée

### "Invalid phone number"

**Solutions**:
1. Vérifiez le format: `+237612345678` (avec le +)
2. Pas d'espaces ni de tirets
3. Code pays correct

### "Quota exceeded"

**Solutions**:
1. Vous avez dépassé 10,000 SMS ce mois
2. Activez la facturation dans Firebase Console
3. Ou attendez le mois prochain

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs du navigateur (F12 → Console)
2. Vérifiez les logs Firebase Console
3. Consultez la documentation: https://firebase.google.com/docs/auth/web/phone-auth

## 🎯 Checklist finale

Avant de tester, vérifiez que:

- [ ] Phone Authentication est activé dans Firebase Console
- [ ] `localhost` est dans les domaines autorisés
- [ ] Le serveur Next.js est redémarré
- [ ] Vous avez un vrai numéro de téléphone (ou numéro de test configuré)
- [ ] Le numéro est au format international (+237...)

## 🚀 Prêt à tester !

Une fois tout configuré, testez le flow complet:

1. `/register` → Créer un compte fournisseur
2. `/verify-email` → Vérifier l'email
3. `/verify-phone` → Vérifier le téléphone
4. `/pending-approval` → Attendre validation admin

Tout devrait fonctionner parfaitement ! 🎉
