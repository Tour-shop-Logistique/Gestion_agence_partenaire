# Test de Rechargement

## Instructions CRITIQUES

Le serveur Vite ne détecte pas les changements automatiquement. Vous DEVEZ :

### ⚠️ ARRÊTER ET REDÉMARRER LE SERVEUR

**Dans le terminal où tourne `npm run dev` :**

1. **Arrêtez le serveur** : Appuyez sur `Ctrl + C`

2. **Supprimez le cache Vite** :
   ```powershell
   Remove-Item -Recurse -Force node_modules\.vite
   ```

3. **Redémarrez le serveur** :
   ```bash
   npm run dev
   ```

4. **Attendez** que le serveur affiche :
   ```
   VITE v... ready in ... ms
   ➜  Local:   http://localhost:5173/
   ```

5. **Fermez COMPLÈTEMENT votre navigateur** (toutes les fenêtres)

6. **Rouvrez le navigateur** et allez sur `http://localhost:5173`

7. **Naviguez vers la page Réception Colis**

---

## Ce que vous DEVEZ voir après le redémarrage

### 1. Titre de la page
```
Réception des Colis 📦 [NOUVEAU]
```

### 2. Un TABLEAU (pas des cartes)
Avec des colonnes :
- Code Colis
- Désignation  
- Poids
- Expédition
- Trajet
- Date Création
- Contenu
- Statut
- Action

### 3. Dans la console (F12)
```
📦 Colis triés (non réceptionnés en premier): [...]
```

---

## Si vous ne voyez TOUJOURS PAS les modifications

### Vérifiez que vous modifiez le bon fichier

Exécutez cette commande pour voir le chemin complet :
```powershell
Get-Item "src/pages/ReceptionColis.jsx" | Select-Object FullName
```

Le fichier doit être dans le même dossier que votre `package.json`.

### Vérifiez que le serveur charge bien ce fichier

1. Ouvrez `http://localhost:5173` dans le navigateur
2. Appuyez sur F12
3. Allez dans l'onglet **Network** (Réseau)
4. Actualisez la page (F5)
5. Cherchez `ReceptionColis` dans la liste
6. Cliquez dessus et vérifiez le contenu

---

## Alternative : Créer un nouveau composant de test

Si rien ne fonctionne, il se peut que le fichier soit en lecture seule ou qu'il y ait un problème de permissions.

Essayez de créer un nouveau fichier de test pour vérifier que Vite détecte les changements :

```bash
# Créez un fichier test
echo "export const TEST = 'WORKING';" > src/test-reload.js
```

Puis dans ReceptionColis.jsx, ajoutez en haut :
```javascript
import { TEST } from '../test-reload';
console.log('TEST RELOAD:', TEST);
```

Si vous voyez "TEST RELOAD: WORKING" dans la console, alors Vite fonctionne et le problème est ailleurs.
