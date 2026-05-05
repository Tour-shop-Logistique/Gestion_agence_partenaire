# 📷 Installation et Configuration du Scanner QR

## ✅ Modifications appliquées

### 1. **Nouveau composant QRScanner**
Fichier créé : `src/components/QRScanner.jsx`

Ce composant permet de :
- Scanner des QR codes avec la caméra
- Saisir manuellement un code colis
- Sélectionner automatiquement le colis dans la liste

### 2. **Intégration dans ColisAReceptionner**
Fichier modifié : `src/pages/ColisAReceptionner.jsx`

Ajouts :
- Bouton "Scanner" dans le header
- Modal de scan QR
- Fonction `handleQRScan` pour traiter les codes scannés
- Sélection automatique et scroll vers le colis
- ID unique sur chaque ligne du tableau pour le scroll

### 3. **Mise à jour du QR Code dans les reçus**
Fichier modifié : `src/components/Receipts/ReceiptThermal.jsx`

Changement :
- **AVANT** : QR code contient l'ID de l'expédition
- **APRÈS** : QR code contient le `code_colis` (ex: COL001)

---

## 🚀 Installation requise

### Étape 1 : Installer la bibliothèque html5-qrcode

```bash
npm install html5-qrcode
```

### Étape 2 : Redémarrer le serveur

```bash
# Arrêtez le serveur avec Ctrl+C
# Puis redémarrez :
npm run dev
```

---

## 📋 Fonctionnement du scanner

### 1. **Ouverture du scanner**
- Cliquez sur le bouton "Scanner" dans le header
- Une modal s'ouvre avec la caméra

### 2. **Scan du QR code**
- Placez le QR code du reçu devant la caméra
- Le code est automatiquement détecté
- Le colis correspondant est sélectionné dans la liste
- La page scroll automatiquement vers le colis

### 3. **Saisie manuelle**
Si la caméra ne fonctionne pas :
- Utilisez le champ de saisie manuelle en bas du modal
- Entrez le code colis (ex: COL001)
- Cliquez sur "Valider"

### 4. **Recherche intelligente**
Le scanner cherche le colis de 3 façons :
1. Par code_colis exact (COL001)
2. Par code_colis partiel (si le QR contient plus d'infos)
3. Par ID d'expédition (pour compatibilité avec anciens QR codes)

---

## 🎯 Cas d'usage

### Scénario 1 : Réception rapide
1. Ouvrir la page "Colis à réceptionner"
2. Cliquer sur "Scanner"
3. Scanner le QR code du reçu
4. Le colis est automatiquement sélectionné
5. Répéter pour plusieurs colis
6. Cliquer sur "Réceptionner la sélection"

### Scénario 2 : Vérification d'un colis
1. Scanner le QR code
2. Le colis est mis en surbrillance dans la liste
3. Vérifier les informations
4. Réceptionner individuellement ou en groupe

### Scénario 3 : Problème de caméra
1. Ouvrir le scanner
2. Si erreur de caméra, utiliser la saisie manuelle
3. Taper le code colis visible sur le reçu
4. Valider

---

## 🔧 Permissions de la caméra

### Sur ordinateur (Chrome/Edge/Firefox)
1. Le navigateur demandera l'autorisation d'accès à la caméra
2. Cliquez sur "Autoriser"
3. Si refusé par erreur :
   - Cliquez sur l'icône de cadenas dans la barre d'adresse
   - Autorisez l'accès à la caméra
   - Rechargez la page

### Sur mobile (Android/iOS)
1. Le navigateur demandera l'autorisation
2. Acceptez l'accès à la caméra
3. Si refusé :
   - Allez dans les paramètres du navigateur
   - Autorisez l'accès à la caméra pour le site
   - Rechargez la page

---

## 📱 Format du QR Code

### Nouveau format (après modification)
```
COL001
```
Le QR code contient directement le code_colis

### Ancien format (compatibilité)
```
123
```
Le QR code contient l'ID de l'expédition (le scanner cherchera tous les colis de cette expédition)

---

## ✅ Avantages

1. **Rapidité** : Scan en moins d'une seconde
2. **Précision** : Pas d'erreur de saisie
3. **Efficacité** : Sélection automatique dans la liste
4. **Flexibilité** : Saisie manuelle en cas de problème
5. **Feedback visuel** : Scroll automatique vers le colis
6. **Notifications** : Messages de succès/erreur

---

## 🐛 Dépannage

### Problème : La caméra ne s'ouvre pas
**Solution** :
- Vérifiez les permissions de la caméra
- Utilisez HTTPS (requis pour l'accès caméra)
- Essayez un autre navigateur
- Utilisez la saisie manuelle

### Problème : Le QR code n'est pas détecté
**Solution** :
- Assurez-vous que le QR code est bien visible
- Améliorez l'éclairage
- Rapprochez ou éloignez le QR code
- Utilisez la saisie manuelle

### Problème : Colis non trouvé après scan
**Solution** :
- Vérifiez que le colis est dans la liste
- Vérifiez que le colis n'est pas déjà réceptionné
- Actualisez la page
- Vérifiez le code colis manuellement

---

## 📊 Résumé des fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/components/QRScanner.jsx` | ✅ Créé - Composant de scan QR |
| `src/pages/ColisAReceptionner.jsx` | ✅ Modifié - Intégration du scanner |
| `src/components/Receipts/ReceiptThermal.jsx` | ✅ Modifié - QR code avec code_colis |

---

## 🎉 Prêt à utiliser !

Après avoir installé `html5-qrcode` et redémarré le serveur :

1. Allez sur la page "Colis à réceptionner"
2. Cliquez sur le bouton "Scanner"
3. Autorisez l'accès à la caméra
4. Scannez un QR code de reçu
5. Le colis est automatiquement sélectionné !

**Note** : Pour tester, imprimez d'abord un reçu thermique avec le nouveau QR code contenant le code_colis.
