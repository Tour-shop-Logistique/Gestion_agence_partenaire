# 🚨 Guide de Dépannage - Réception Colis

## Problème : Les modifications ne s'affichent pas

### ✅ Vérifications effectuées
- ✅ Le code est bien présent dans `src/pages/ReceptionColis.jsx`
- ✅ Le tableau HTML est bien dans le fichier (ligne 230)
- ✅ Le tri est bien implémenté (lignes 53-82)
- ✅ Le console.log de débogage est présent (ligne 76)
- ✅ Le serveur Vite tourne sur le port 5173

## 🔧 Solutions à essayer DANS L'ORDRE

### Solution 1 : Hard Refresh du navigateur (ESSAYEZ EN PREMIER)

**Windows/Linux :**
```
Ctrl + Shift + Delete
```
Puis sélectionnez "Images et fichiers en cache" et cliquez sur "Effacer les données"

**Ensuite :**
```
Ctrl + Shift + R
```

**Mac :**
```
Cmd + Shift + Delete
```
Puis :
```
Cmd + Shift + R
```

### Solution 2 : Redémarrer le serveur Vite

**Dans votre terminal où tourne le serveur :**

1. Arrêtez le serveur : `Ctrl + C`
2. Supprimez le cache de Vite :
   ```bash
   rm -rf node_modules/.vite
   # ou sur Windows PowerShell :
   Remove-Item -Recurse -Force node_modules/.vite
   ```
3. Redémarrez :
   ```bash
   npm run dev
   ```

### Solution 3 : Vérifier que vous êtes sur la bonne page

1. L'URL doit être : `http://localhost:5173/reception-colis` (ou similaire)
2. Vérifiez dans la barre d'adresse du navigateur
3. Si vous êtes sur une autre page, naviguez vers "Réception Colis" via le menu

### Solution 4 : Vérifier la console du navigateur

1. Ouvrez la page Réception Colis
2. Appuyez sur **F12**
3. Allez dans l'onglet **Console**
4. Actualisez la page avec **Ctrl + R**
5. Cherchez le message : `📦 Colis triés (non réceptionnés en premier):`

**Si vous NE voyez PAS ce message :**
- Le fichier n'est pas chargé ou une ancienne version est en cache
- Passez à la Solution 5

**Si vous VOYEZ ce message :**
- Le code fonctionne ! Le problème est visuel
- Vérifiez que vous regardez bien le tableau et non une autre section

### Solution 5 : Forcer la recompilation complète

```bash
# Arrêtez le serveur (Ctrl + C)

# Supprimez tous les caches
rm -rf node_modules/.vite
rm -rf dist

# Sur Windows PowerShell :
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Redémarrez
npm run dev
```

### Solution 6 : Vérifier le fichier source dans le navigateur

1. Ouvrez les outils de développement (**F12**)
2. Allez dans l'onglet **Sources** (ou **Debugger**)
3. Naviguez vers `src/pages/ReceptionColis.jsx`
4. Vérifiez que vous voyez :
   - Ligne 16 : `// Version: 2.0 - Tableau avec tri automatique`
   - Ligne 76 : `console.log('📦 Colis triés...`
   - Ligne 230 : `<table className="w-full">`

**Si vous ne voyez PAS ces lignes :**
- Le navigateur charge une ancienne version
- Fermez COMPLÈTEMENT le navigateur et rouvrez-le

### Solution 7 : Tester dans un autre navigateur

1. Ouvrez un autre navigateur (Chrome, Firefox, Edge)
2. Allez sur `http://localhost:5173`
3. Naviguez vers la page Réception Colis
4. Vérifiez si les modifications sont visibles

### Solution 8 : Mode navigation privée

1. Ouvrez une fenêtre de navigation privée/incognito
2. Allez sur `http://localhost:5173`
3. Naviguez vers Réception Colis
4. Les modifications devraient être visibles (pas de cache)

---

## 📋 Ce que vous devriez voir

### Dans le tableau :
- **En-têtes de colonnes** : Code Colis, Désignation, Poids, Expédition, Trajet, Date Création, Contenu, Statut, Action
- **Colis non réceptionnés EN HAUT** avec badge "⏳ EN ATTENTE" (fond orange/amber)
- **Colis réceptionnés EN BAS** avec badge "✓ REÇU" (fond vert)
- **Bordures gauches colorées** sur chaque ligne
- **Fond dégradé** sur le header de la page

### Dans la console (F12) :
```javascript
📦 Colis triés (non réceptionnés en premier): [
  { code: "COL001", receptionne: false, ordre: "1-En attente" },
  { code: "COL002", receptionne: false, ordre: "1-En attente" },
  { code: "COL003", receptionne: true, ordre: "2-Reçu" }
]
```

---

## 🆘 Si rien ne fonctionne

Partagez-moi les informations suivantes :

1. **Navigateur utilisé** : Chrome / Firefox / Edge / Safari ?
2. **URL dans la barre d'adresse** : 
3. **Message dans la console** (F12 → Console) :
4. **Capture d'écran** de la page actuelle
5. **Version du fichier dans le navigateur** :
   - F12 → Sources → src/pages/ReceptionColis.jsx
   - Ligne 16 : Que voyez-vous ?

---

## 📝 Commandes rapides

```bash
# Redémarrer proprement
Ctrl + C
Remove-Item -Recurse -Force node_modules/.vite
npm run dev

# Vérifier que le serveur tourne
netstat -ano | Select-String "5173"

# Ouvrir directement la page
start http://localhost:5173/reception-colis
```
