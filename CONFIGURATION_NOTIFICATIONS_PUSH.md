# 🔔 Configuration des Notifications Push avec Firebase Cloud Messaging

## ✅ Ce qui a été implémenté

1. **Service Worker** (`public/firebase-messaging-sw.js`) - Gère les notifications en arrière-plan
2. **Système de permission** (`lib/firebase/messaging.ts`) - Demande et gère les permissions
3. **Bannière de demande** (`components/notifications/NotificationPermissionBanner.tsx`) - Interface utilisateur
4. **Enregistrement automatique** - Le service worker s'enregistre au chargement de l'app

## 🔧 Configuration Firebase requise

### Étape 1 : Activer Firebase Cloud Messaging

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `interappshop`
3. Dans le menu latéral, cliquez sur **Build** > **Cloud Messaging**
4. Cliquez sur **Get Started** si ce n'est pas déjà fait

### Étape 2 : Générer une clé VAPID

1. Dans Firebase Console > **Project Settings** (⚙️ en haut à gauche)
2. Allez dans l'onglet **Cloud Messaging**
3. Scrollez jusqu'à **Web Push certificates**
4. Cliquez sur **Generate key pair**
5. Copiez la clé générée (elle ressemble à : `BKagOny0KF_2pCJQ3m....`)

### Étape 3 : Ajouter la clé VAPID dans le code

Ouvrez le fichier `lib/firebase/messaging.ts` et remplacez :

```typescript
vapidKey: 'VOTRE_VAPID_KEY_ICI'
```

Par votre clé VAPID :

```typescript
vapidKey: 'BKagOny0KF_2pCJQ3m....' // Votre vraie clé
```

### Étape 4 : Configurer le domaine autorisé

1. Dans Firebase Console > **Project Settings** > **Cloud Messaging**
2. Sous **Web configuration**, ajoutez votre domaine :
   - Pour le développement : `http://localhost:3000`
   - Pour la production : `https://votre-domaine.com`

## 📱 Comment ça fonctionne

### 1. Demande de permission

Quand un utilisateur se connecte, une bannière apparaît après 3 secondes pour demander la permission :

```
┌─────────────────────────────────────┐
│ 🔔 Activer les notifications        │
│ Restez informé en temps réel        │
│                                     │
│ Recevez des notifications pour :   │
│ ✓ Nouveaux messages                │
│ ✓ Mises à jour de commandes        │
│ ✓ Offres spéciales                 │
│ ✓ Transactions wallet               │
│                                     │
│ [Activer] [Plus tard]              │
└─────────────────────────────────────┘
```

### 2. Sauvegarde du token

Si l'utilisateur accepte :
- Un token FCM unique est généré
- Le token est sauvegardé dans Firestore : `users/{userId}/fcmTokens[]`
- Le champ `notificationsEnabled: true` est ajouté

### 3. Réception des notifications

**Quand l'app est ouverte :**
- Les notifications sont gérées par `onMessageListener()`
- Vous pouvez afficher un toast ou une notification in-app

**Quand l'app est fermée/en arrière-plan :**
- Le Service Worker (`firebase-messaging-sw.js`) reçoit la notification
- Une notification système s'affiche automatiquement

### 4. Clic sur la notification

Quand l'utilisateur clique sur une notification :
- Si l'app est déjà ouverte → Focus sur l'onglet
- Sinon → Ouvre une nouvelle fenêtre avec l'URL appropriée

## 🚀 Envoyer des notifications (Backend)

### Option 1 : Depuis votre code (recommandé)

Créez une Cloud Function Firebase :

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendNotificationToUser = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const userId = notification.userId;
    
    // Récupérer les tokens FCM de l'utilisateur
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const fcmTokens = userDoc.data()?.fcmTokens || [];
    
    if (fcmTokens.length === 0) {
      console.log('Aucun token FCM pour cet utilisateur');
      return;
    }
    
    // Préparer le message
    const message = {
      notification: {
        title: notification.title,
        body: notification.message,
        icon: '/logo.png'
      },
      data: {
        notificationId: snap.id,
        type: notification.type,
        url: notification.data?.url || '/'
      },
      tokens: fcmTokens
    };
    
    // Envoyer la notification
    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Notifications envoyées:', response.successCount);
      
      // Nettoyer les tokens invalides
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            tokensToRemove.push(fcmTokens[idx]);
          }
        });
        
        if (tokensToRemove.length > 0) {
          await admin.firestore().collection('users').doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
          });
        }
      }
    } catch (error) {
      console.error('Erreur envoi notification:', error);
    }
  });
```

### Option 2 : Depuis Firebase Console (pour tester)

1. Firebase Console > **Cloud Messaging**
2. Cliquez sur **Send your first message**
3. Remplissez :
   - **Notification title** : "Test"
   - **Notification text** : "Ceci est un test"
4. Cliquez sur **Send test message**
5. Collez un token FCM (vous pouvez le voir dans la console du navigateur)

### Option 3 : API REST

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/interappshop/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "USER_FCM_TOKEN",
      "notification": {
        "title": "Nouveau message",
        "body": "Vous avez reçu un nouveau message"
      },
      "data": {
        "url": "/chat"
      }
    }
  }'
```

## 🔍 Debugging

### Vérifier si le Service Worker est enregistré

Ouvrez la console du navigateur et tapez :

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Vérifier la permission

```javascript
console.log('Permission:', Notification.permission);
```

### Voir les tokens FCM

Dans Firestore, allez dans `users/{userId}` et regardez le champ `fcmTokens`.

## 📊 Structure Firestore

```
users/{userId}
  ├── fcmTokens: string[]           // Tokens FCM (un par appareil)
  ├── notificationsEnabled: boolean // Si les notifications sont activées
  └── lastTokenUpdate: timestamp    // Dernière mise à jour du token

notifications/{notificationId}
  ├── userId: string
  ├── type: string
  ├── title: string
  ├── message: string
  ├── isRead: boolean
  ├── channel: 'email' | 'in_app' | 'both'
  ├── emailSent: boolean
  ├── createdAt: timestamp
  └── data: object (optionnel)
```

## ⚠️ Points importants

1. **HTTPS requis** : Les notifications push ne fonctionnent qu'en HTTPS (sauf localhost)
2. **Permissions persistantes** : Une fois accordée, la permission reste jusqu'à ce que l'utilisateur la révoque
3. **Tokens multiples** : Un utilisateur peut avoir plusieurs tokens (un par appareil/navigateur)
4. **Nettoyage des tokens** : Supprimez les tokens invalides pour éviter les erreurs
5. **Limites** : Firebase a des quotas (gratuit : 10 000 messages/jour)

## 🎯 Prochaines étapes

1. ✅ Configurer la clé VAPID
2. ✅ Tester les notifications en local
3. ✅ Créer une Cloud Function pour envoyer automatiquement
4. ✅ Ajouter une page de paramètres pour gérer les notifications
5. ✅ Implémenter les notifications pour chaque événement (messages, commandes, etc.)

## 📚 Ressources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
