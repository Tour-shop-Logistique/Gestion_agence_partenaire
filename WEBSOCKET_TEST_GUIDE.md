# 🧪 Guide de Test WebSocket

## 📋 Checklist de vérification

### 1. Vérification de la connexion

#### Console navigateur
Ouvrir la console (`F12`) et vérifier les logs :
```
✅ [Echo] Initialisation de la connexion WebSocket...
✅ [Echo] WebSocket connecté avec succès
✅ [Echo] Canal autorisé: agence.123
```

#### Indicateur visuel
- Dans le header, un point vert doit apparaître (indicateur WebSocket)
- Au survol : "Temps réel: Connecté"

### 2. Tests par événement

#### Test 1 : Changement de statut d'expédition
**Action backend :** Modifier le statut d'une expédition

**Pages à vérifier :**
- ✅ Dashboard → Notification toast + Refresh automatique
- ✅ Expeditions → Notification + Liste mise à jour
- ✅ Demandes → Notification si nouvelle demande

**Logs attendus :**
```
📦 [Dashboard] Expédition(s) mise(s) à jour: 1
📦 [Expeditions] Statut expédition(s) changé: 1
```

#### Test 2 : Paiement confirmé
**Action backend :** Confirmer un paiement

**Pages à vérifier :**
- ✅ Dashboard → Toast "Paiement confirmé pour REF-XXX"
- ✅ Expeditions → Mise à jour de la liste
- ✅ Comptabilite → Recharge des données + Toast

**Logs attendus :**
```
💰 [Dashboard] Paiement(s) confirmé(s): 1
💰 [Expeditions] Paiement confirmé: ["REF-001"]
💰 [Comptabilité] Paiement(s) confirmé(s): 1
```

#### Test 3 : Colis contrôlé
**Action backend :** Contrôler un ou plusieurs colis

**Pages à vérifier :**
- ✅ Dashboard → Toast "X colis contrôlé(s)"
- ✅ Colis → Notification + Refresh

**Logs attendus :**
```
✅ [Dashboard] Colis contrôlé(s): 1
✅ [Colis] Colis contrôlé(s): 1
```

#### Test 4 : Colis bloqué
**Action backend :** Bloquer un colis

**Pages à vérifier :**
- ✅ Dashboard → Toast warning "⚠️ X colis bloqué(s)"
- ✅ Colis → Toast + Son d'alerte + Refresh
- ✅ ColisAReceptionner → Toast + Son d'alerte

**Logs attendus :**
```
🚫 [Dashboard] Colis bloqué(s): 1
🚫 [Colis] Colis bloqué(s): ["COL-001"]
🚫 [Réception] Colis bloqué(s): ["COL-001"]
```

**Son :** Alert (bip urgent)

#### Test 5 : Nouveau colis assigné
**Action backend :** Assigner un colis à l'agence

**Pages à vérifier :**
- ✅ Dashboard → Toast info "X nouveau(x) colis"
- ✅ Colis → Toast "🎉 X nouveau(x) colis" + Son de succès
- ✅ ColisAReceptionner → Toast + Son de succès

**Logs attendus :**
```
📍 [Dashboard] Colis assigné(s): 1
📍 [Colis] Nouveau(x) colis assigné(s): 1
📍 [Réception] Nouveau(x) colis à réceptionner: 1
```

**Son :** Success (ding de notification)

#### Test 6 : Colis reçu par backoffice
**Action backend :** Confirmer réception au backoffice

**Pages à vérifier :**
- ✅ Dashboard → Toast info
- ✅ Colis → Toast + Refresh
- ✅ ColisAReceptionner → Toast "Colis en transit"

**Logs attendus :**
```
📥 [Dashboard] Colis reçu(s) par le backoffice: 1
📥 [Colis] Colis reçu(s) par le backoffice: ["COL-001"]
📥 [Réception] Colis arrivé(s) au backoffice: ["COL-001"]
```

#### Test 7 : Frais annexes mis à jour
**Action backend :** Modifier les frais annexes

**Pages à vérifier :**
- ✅ Dashboard → Toast info
- ✅ Expeditions → Toast + Refresh
- ✅ Comptabilite → Toast + Recharge données

**Logs attendus :**
```
💵 [Dashboard] Frais annexes mis à jour: 1
💵 [Expeditions] Frais annexes mis à jour: ["REF-001"]
💵 [Comptabilité] Frais annexes mis à jour: 1
```

#### Test 8 : Tarifs mis à jour
**Action backend :** Modifier un tarif simple ou groupage

**Pages à vérifier :**
- ✅ Dashboard → Toast info
- ✅ TarifsSimples → Toast warning + Recharge (si TarifSimple)
- ✅ TarifsGroupage → Toast warning + Recharge (si TarifGroupage)
- ✅ Comptabilite → Toast informatif

**Logs attendus :**
```
💲 [Dashboard] Tarifs mis à jour: TarifSimple
💲 [TarifsSimples] Tarifs mis à jour: TarifSimple
💲 [Comptabilité] Tarifs mis à jour: TarifSimple
```

#### Test 9 : Agence désactivée (CRITIQUE)
**Action backend :** Désactiver l'agence

**Pages à vérifier :**
- ✅ Dashboard → Toast error "⛔ Votre agence a été désactivée"
- ✅ Déconnexion automatique après 3 secondes
- ✅ Redirection vers /login

**Logs attendus :**
```
⚠️ [Dashboard] Statut agence changé: [{ actif: false }]
```

**Comportement attendu :**
1. Toast rouge d'erreur pendant 3 secondes
2. Nettoyage du localStorage
3. Redirection automatique vers la page de login

### 3. Tests de robustesse

#### Test de déconnexion/reconnexion
1. Fermer le backend
2. Vérifier que l'indicateur passe à "Déconnecté" (point gris)
3. Redémarrer le backend
4. Vérifier la reconnexion automatique (point vert)

**Logs attendus :**
```
⚠️ [Echo] WebSocket déconnecté
✅ [Echo] WebSocket connecté avec succès
```

#### Test de changement de page
1. Se connecter sur Dashboard
2. Naviguer vers Expeditions
3. Naviguer vers Colis
4. Vérifier qu'il n'y a qu'une seule connexion active
5. Les événements doivent être reçus sur toutes les pages

#### Test de rafraîchissement de page
1. Être sur Dashboard avec WebSocket connecté
2. Rafraîchir la page (F5)
3. Vérifier la reconnexion automatique
4. Vérifier que les événements sont toujours reçus

### 4. Tests multi-onglets

#### Scénario 1 : Deux onglets Dashboard
1. Ouvrir Dashboard dans deux onglets
2. Déclencher un événement backend
3. Vérifier que les DEUX onglets se mettent à jour

#### Scénario 2 : Dashboard + Expeditions
1. Ouvrir Dashboard dans onglet 1
2. Ouvrir Expeditions dans onglet 2
3. Changer le statut d'une expédition
4. Vérifier que les deux onglets se mettent à jour

### 5. Tests de performance

#### Test de charge (multiple événements)
1. Backoffice : Contrôler 50 colis d'un coup
2. Vérifier :
   - ✅ Notification groupée : "50 colis contrôlés"
   - ✅ Un seul refresh API
   - ✅ Pas de freeze de l'interface

**Log attendu :**
```
✅ [Dashboard] Colis contrôlé(s): 50
```

#### Test de spam d'événements
1. Déclencher plusieurs événements rapidement (5 en 1 seconde)
2. Vérifier :
   - ✅ Toutes les notifications s'affichent
   - ✅ Les refresh sont bien gérés
   - ✅ Pas de ralentissement

## 🐛 Problèmes courants

### Problème : "Impossible de créer Echo: pas de token disponible"
**Solution :** Vérifier que l'utilisateur est bien connecté et que le token existe dans localStorage

### Problème : "Erreur d'autorisation"
**Solution :** 
1. Vérifier l'endpoint `/broadcasting/auth` dans le backend
2. Vérifier que le token est bien envoyé dans le header Authorization
3. Vérifier les CORS

### Problème : Événements non reçus
**Solution :**
1. Vérifier dans la console que le canal est bien autorisé
2. Vérifier l'ID de l'agence
3. Vérifier dans la console backend que l'événement est bien émis

### Problème : Double notification
**Solution :** Vérifier qu'il n'y a pas deux hooks useWebSocket sur la même page

### Problème : Pas de reconnexion automatique
**Solution :** C'est normal avec Pusher, la reconnexion est automatique mais peut prendre quelques secondes

## 📊 Métriques de succès

### ✅ Tous les tests passent si :
1. ✅ Connexion établie en moins de 2 secondes
2. ✅ Tous les événements sont reçus (0% de perte)
3. ✅ Notifications affichées en moins de 500ms
4. ✅ Refresh API déclenchés correctement
5. ✅ Aucune erreur dans la console
6. ✅ Reconnexion automatique fonctionnelle
7. ✅ Déconnexion propre à la fermeture
8. ✅ Pas de fuite mémoire (test sur 30 minutes)

## 🎯 Commandes utiles

### Simuler une déconnexion (Console navigateur)
```javascript
// Déconnecter manuellement
const echo = window.Pusher.instances[0];
echo.disconnect();

// Reconnecter
echo.connect();
```

### Voir l'état de la connexion
```javascript
const echo = window.Pusher.instances[0];
console.log(echo.connection.state); // 'connected', 'connecting', 'disconnected'
```

### Lister les canaux actifs
```javascript
const echo = window.Pusher.instances[0];
console.log(echo.channels.channels); // Liste des canaux
```

## 📝 Rapport de test

### Template de rapport
```
Date: _______________
Testeur: ____________
Version: 1.0.0

CONNEXION
[ ] Connexion établie
[ ] Indicateur visuel fonctionnel
[ ] Reconnexion automatique

ÉVÉNEMENTS
[ ] Changement statut expédition
[ ] Paiement confirmé
[ ] Colis contrôlé
[ ] Colis bloqué (avec son)
[ ] Nouveau colis assigné (avec son)
[ ] Colis reçu backoffice
[ ] Frais annexes mis à jour
[ ] Tarifs mis à jour
[ ] Agence désactivée (déconnexion)

ROBUSTESSE
[ ] Multi-onglets
[ ] Rafraîchissement page
[ ] Déconnexion/reconnexion
[ ] Changement de page
[ ] Test de charge (50+ événements)

COMMENTAIRES:
_______________________________
_______________________________
_______________________________
```

---

**Bonne chance pour les tests ! 🚀**
