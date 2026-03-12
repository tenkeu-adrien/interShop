# Configuration Email - Guide Complet

## Problème actuel

Votre fichier `.env` contient une configuration email incorrecte :
```env
EMAIL_HOST=465  # ❌ INCORRECT - C'est un port, pas un hôte
EMAIL_USER=contact@ton-transporteur.fr
EMAIL_PASSWORD=oiseaux2KK2@!25
```

## Configuration correcte

### Option 1 : Utiliser Gmail (Recommandé pour les tests)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Mot de passe d'application (16 caractères)
```

#### Étapes pour Gmail :

1. **Activer la validation en 2 étapes** :
   - Allez sur https://myaccount.google.com/security
   - Activez "Validation en deux étapes"

2. **Créer un mot de passe d'application** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Autre (nom personnalisé)"
   - Entrez "InterAppShop" ou un nom de votre choix
   - Copiez le mot de passe généré (16 caractères)
   - Utilisez ce mot de passe dans `EMAIL_PASSWORD`

3. **Mettre à jour votre .env** :
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre.email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # Le mot de passe d'application
   ```

### Option 2 : Utiliser votre serveur SMTP personnalisé

Pour `contact@ton-transporteur.fr`, vous devez connaître :

1. **Le serveur SMTP** de votre hébergeur :
   - Exemples courants :
     - OVH : `ssl0.ovh.net` (port 465)
     - Ionos : `smtp.ionos.fr` (port 587)
     - O2Switch : `mail.votre-domaine.fr` (port 465)
     - Infomaniak : `mail.infomaniak.com` (port 587)

2. **Configuration typique** :
   ```env
   EMAIL_HOST=smtp.ton-transporteur.fr  # ou mail.ton-transporteur.fr
   EMAIL_PORT=465  # ou 587
   EMAIL_USER=contact@ton-transporteur.fr
   EMAIL_PASSWORD=oiseaux2KK2@!25
   ```

3. **Comment trouver votre serveur SMTP** :
   - Consultez la documentation de votre hébergeur
   - Cherchez "configuration SMTP" dans votre panneau d'administration
   - Contactez le support de votre hébergeur

### Option 3 : Utiliser un service d'emailing (Production)

Pour la production, utilisez un service professionnel :

#### SendGrid (Gratuit jusqu'à 100 emails/jour)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=votre_api_key_sendgrid
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@votre-domaine.mailgun.org
EMAIL_PASSWORD=votre_password_mailgun
```

#### Amazon SES
```env
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=votre_smtp_username
EMAIL_PASSWORD=votre_smtp_password
```

## Vérification de la configuration

### 1. Vérifier les logs du serveur

Après avoir mis à jour votre `.env`, redémarrez le serveur et regardez les logs :

```bash
npm run dev
```

Vous devriez voir :
```
📧 Configuration Email:
  - EMAIL_HOST: smtp.gmail.com
  - EMAIL_PORT: 587
  - EMAIL_USER: votre.email@gmail.com
  - EMAIL_PASSWORD: ***
✅ Nodemailer configuré avec succès
   Host: smtp.gmail.com:587
   Secure: false
```

### 2. Tester l'envoi d'email

Essayez de réinitialiser un mot de passe. Dans les logs, vous verrez :

**Si ça fonctionne** :
```
📤 Tentative d'envoi de l'email...
🔌 Vérification de la connexion SMTP...
✅ Connexion SMTP vérifiée
📨 Envoi de l'email en cours...
✅ Email envoyé avec succès!
   Message ID: <xxxxx@gmail.com>
   Response: 250 2.0.0 OK
   Accepted: [ 'destinataire@email.com' ]
   Rejected: []
```

**Si ça échoue** :
```
❌ Erreur lors de l'envoi de l'email:
   Message: Invalid login: 535-5.7.8 Username and Password not accepted
   Code: EAUTH
   Command: AUTH PLAIN
```

## Erreurs courantes et solutions

### Erreur : "Invalid login" ou "Authentication failed"
**Cause** : Mauvais identifiants ou mot de passe
**Solution** :
- Pour Gmail : Utilisez un mot de passe d'application, pas votre mot de passe Gmail
- Pour SMTP personnalisé : Vérifiez vos identifiants auprès de votre hébergeur

### Erreur : "Connection timeout" ou "ETIMEDOUT"
**Cause** : Le serveur SMTP est inaccessible
**Solution** :
- Vérifiez que `EMAIL_HOST` est correct
- Vérifiez que le port (465 ou 587) est ouvert
- Vérifiez votre pare-feu

### Erreur : "Self signed certificate"
**Cause** : Certificat SSL non valide
**Solution** : Ajoutez dans la configuration Nodemailer :
```typescript
transporter = nodemailer.createTransport({
  // ... autres options
  tls: {
    rejectUnauthorized: false
  }
});
```

### Erreur : "Greeting never received"
**Cause** : Mauvais port ou protocole
**Solution** :
- Essayez le port 587 au lieu de 465
- Ou inversement

## Configuration recommandée par environnement

### Développement (Local)
Utilisez Gmail avec un mot de passe d'application :
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.dev@gmail.com
EMAIL_PASSWORD=mot_de_passe_application
```

### Production
Utilisez un service professionnel comme SendGrid ou Amazon SES :
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=votre_api_key
```

## Test manuel de la configuration SMTP

Vous pouvez tester votre configuration SMTP avec cet outil en ligne de commande :

```bash
# Installer swaks (outil de test SMTP)
# Windows : télécharger depuis http://www.jetmore.org/john/code/swaks/
# Linux/Mac : sudo apt-get install swaks

# Tester la connexion
swaks --to destinataire@email.com \
      --from contact@ton-transporteur.fr \
      --server smtp.ton-transporteur.fr \
      --port 465 \
      --auth LOGIN \
      --auth-user contact@ton-transporteur.fr \
      --auth-password "oiseaux2KK2@!25" \
      --tls
```

## Checklist de vérification

- [ ] `EMAIL_HOST` contient le nom d'hôte SMTP (ex: smtp.gmail.com)
- [ ] `EMAIL_PORT` contient le port (465 ou 587)
- [ ] `EMAIL_USER` contient votre adresse email complète
- [ ] `EMAIL_PASSWORD` contient le bon mot de passe
- [ ] Pour Gmail : Validation en 2 étapes activée + mot de passe d'application créé
- [ ] Le serveur est redémarré après modification du .env
- [ ] Les logs montrent "✅ Nodemailer configuré avec succès"
- [ ] Les logs montrent "✅ Connexion SMTP vérifiée"

## Afficher le code en développement

En mode développement, le code est affiché dans la réponse de l'API pour faciliter les tests :

```json
{
  "success": true,
  "message": "Code envoyé",
  "code": "123456"  // Seulement en développement
}
```

Vous pouvez donc tester sans recevoir l'email en regardant la réponse dans les outils de développement du navigateur (onglet Network).
