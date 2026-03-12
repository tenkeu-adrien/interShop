# 🚨 INSTRUCTIONS URGENTES - Configuration Email

## Problème identifié

Votre fichier `.env` contenait :
```env
EMAIL_HOST=465  ❌ INCORRECT (c'est un port, pas un serveur)
```

L'erreur dans les logs :
```
❌ Erreur lors de l'envoi de l'email:
Message: getaddrinfo ENOTFOUND 465
Code: EDNS
```

## ✅ Solution rapide - Utilisez Gmail pour tester

### Étape 1 : Créer un mot de passe d'application Gmail

1. Allez sur https://myaccount.google.com/security
2. Activez "Validation en deux étapes" si ce n'est pas déjà fait
3. Allez sur https://myaccount.google.com/apppasswords
4. Sélectionnez "Autre (nom personnalisé)"
5. Entrez "InterAppShop"
6. Cliquez sur "Générer"
7. **Copiez le mot de passe à 16 caractères** (ex: `abcd efgh ijkl mnop`)

### Étape 2 : Modifier votre .env

Ouvrez `.env` et modifiez la section email :

```env
# Commentez l'OPTION 1
# EMAIL_HOST=mail.ton-transporteur.fr
# EMAIL_PORT=465
# EMAIL_USER=contact@ton-transporteur.fr
# EMAIL_PASSWORD=oiseaux2KK2@!25

# Décommentez et configurez l'OPTION 2
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Étape 3 : Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

### Étape 4 : Tester

1. Allez sur la page "Mot de passe oublié"
2. Entrez votre email
3. Regardez les logs du serveur

**Logs de succès attendus :**
```
📧 Configuration Email:
  - EMAIL_HOST: smtp.gmail.com
  - EMAIL_PORT: 587
  - EMAIL_USER: votre.email@gmail.com
✅ Nodemailer configuré avec succès
🔌 Vérification de la connexion SMTP...
✅ Connexion SMTP vérifiée
✅ Email envoyé avec succès!
```

4. Vérifiez votre boîte email Gmail

## 🔧 Solution permanente - Configurer ton-transporteur.fr

Pour utiliser `contact@ton-transporteur.fr`, vous devez trouver le serveur SMTP.

### Comment trouver votre serveur SMTP ?

1. **Vérifiez votre panneau d'hébergement** :
   - Cherchez "Configuration email" ou "Paramètres SMTP"
   - Notez le serveur SMTP et le port

2. **Serveurs SMTP courants** :
   - **OVH** : `ssl0.ovh.net` (port 465)
   - **Ionos** : `smtp.ionos.fr` (port 587)
   - **O2Switch** : `mail.ton-transporteur.fr` (port 465)
   - **Infomaniak** : `mail.infomaniak.com` (port 587)
   - **Hostinger** : `smtp.hostinger.com` (port 587)

3. **Contactez votre hébergeur** :
   - Demandez : "Quel est le serveur SMTP pour envoyer des emails depuis contact@ton-transporteur.fr ?"

### Une fois que vous avez le serveur SMTP

Modifiez `.env` :
```env
EMAIL_HOST=smtp.votre-hebergeur.com  # Le serveur SMTP fourni
EMAIL_PORT=465  # ou 587 selon votre hébergeur
EMAIL_USER=contact@ton-transporteur.fr
EMAIL_PASSWORD=oiseaux2KK2@!25
```

## 🐛 Mode Debug - Voir le code sans email

En mode développement, le code est affiché dans :

1. **Les logs du serveur** :
   ```
   🔑 Code généré: 575198
   ```

2. **La console du navigateur** (F12) :
   ```
   🔑 CODE DE VÉRIFICATION (DEV): 575198
   ```

3. **Un toast sur la page** :
   ```
   Code (DEV): 575198
   ```

Vous pouvez donc tester le flux complet même sans recevoir l'email !

## ✅ Checklist de vérification

- [ ] `.env` modifié avec Gmail ou le bon serveur SMTP
- [ ] Serveur redémarré (`npm run dev`)
- [ ] Logs montrent "✅ Nodemailer configuré avec succès"
- [ ] Logs montrent "✅ Connexion SMTP vérifiée"
- [ ] Email reçu OU code visible dans les logs/console

## 📞 Besoin d'aide ?

Si vous ne trouvez pas votre serveur SMTP :
1. Regardez dans votre panneau d'hébergement
2. Cherchez "webmail" ou "email" dans votre interface
3. Contactez le support de votre hébergeur avec cette question :
   > "Bonjour, j'ai besoin des paramètres SMTP pour envoyer des emails depuis contact@ton-transporteur.fr. Pouvez-vous me fournir le serveur SMTP et le port à utiliser ?"

## 🎯 Résumé rapide

**Pour tester maintenant** : Utilisez Gmail (voir Étape 1-4 ci-dessus)

**Pour la production** : Trouvez votre serveur SMTP et configurez-le dans `.env`

Le code est sauvegardé dans Firestore même si l'email ne part pas, donc le système fonctionne. L'email est juste un bonus pour l'expérience utilisateur !
