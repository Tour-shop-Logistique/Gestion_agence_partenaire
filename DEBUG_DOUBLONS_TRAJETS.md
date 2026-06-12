# 🔍 Debug des doublons de trajets

## 🎯 Problème rapporté

"abidjan-paris" apparaît **deux fois** dans le dropdown "Trajet disponible".

## 🛠️ Logs de debug ajoutés

Des logs très détaillés ont été ajoutés pour tracer exactement ce qui se passe :

### Dans la console, vous verrez maintenant :

```
🛣️ DEBUG DEDUPLICATION - Début
Type actuel: "groupage_dhd_aerien"
Tarifs par type: [15 tarifs...]

📍 Tarif ID abc123: ligne="abidjan-paris" → clé="abidjan-paris"
  ✅ Nouveau trajet ajouté: "abidjan-paris"

📍 Tarif ID def456: ligne="abidjan-paris" → clé="abidjan-paris"
  ⚠️ Doublon ignoré: "abidjan-paris" (déjà vu comme "abidjan-paris")

📍 Tarif ID xyz789: ligne="Abidjan-Paris" → clé="abidjan-paris"
  ⚠️ Doublon ignoré: "Abidjan-Paris" (déjà vu comme "abidjan-paris")

🛣️ Trajets disponibles: {
  total: 15,
  uniques: 5,
  doublons_elimines: 10
}

📊 Détail des doublons éliminés: {
  "abidjan-paris": ["def456", "xyz789"],
  "abidjan-marseille": ["ghi012"]
}

🛣️ DEBUG DEDUPLICATION - Fin
```

## 📋 Procédure de diagnostic

### Étape 1 : Reproduire le problème
1. Rafraîchir la page (Ctrl+F5)
2. Ouvrir la console (F12)
3. Sélectionner **GROUPAGE_DHD_AERIEN** (ou le type concerné)
4. Observer les logs `🛣️ DEBUG DEDUPLICATION`

### Étape 2 : Analyser les logs

Chercher dans les logs les lignes concernant "abidjan-paris" :

```
📍 Tarif ID xxx: ligne="..." → clé="..."
```

#### Cas A : Les clés sont identiques mais toujours 2 fois dans le dropdown
```
📍 Tarif ID 1: ligne="abidjan-paris" → clé="abidjan-paris"
  ✅ Nouveau trajet ajouté: "abidjan-paris"

📍 Tarif ID 2: ligne="abidjan-paris" → clé="abidjan-paris"
  ⚠️ Doublon ignoré: "abidjan-paris"
```

→ **La déduplication fonctionne**, mais le dropdown montre quand même 2 fois ?
→ Problème dans le rendu du dropdown (voir Cas A ci-dessous)

#### Cas B : Les clés sont différentes
```
📍 Tarif ID 1: ligne="abidjan-paris" → clé="abidjan-paris"
  ✅ Nouveau trajet ajouté: "abidjan-paris"

📍 Tarif ID 2: ligne="Abidjan - Paris" → clé="abidjan - paris"
  ✅ Nouveau trajet ajouté: "Abidjan - Paris"
```

→ **Les lignes ont un format différent** (espaces, casse, tirets)
→ Solution : Normaliser davantage (voir Cas B ci-dessous)

#### Cas C : Pays différent (pour DHD)
```
📍 Tarif ID 1: ligne="abidjan-paris" pays="France" → clé="abidjan-paris"
  ✅ Nouveau trajet ajouté

📍 Tarif ID 2: ligne="abidjan-paris" pays="Côte d'Ivoire" → clé="abidjan-paris"
  ⚠️ Doublon ignoré
```

→ **Normal** : DHD ne prend que la ligne, pas le pays
→ Si vous voulez différencier par pays, voir Solution C

## 🔧 Solutions selon les cas

### Solution A : Vérifier le rendu du dropdown

Si les logs montrent que le doublon est bien ignoré mais qu'il apparaît quand même dans le dropdown, le problème est dans le code JSX du select.

**Vérifier dans le code :**
```jsx
<select>
  <option value="">Sélectionner un trajet</option>
  {availableRoutes.map(r => (
    <option key={r.id} value={r.id}>  {/* ← key doit être unique */}
      {r.ligne}
    </option>
  ))}
</select>
```

**Copier les logs complets et me les envoyer**

### Solution B : Normalisation plus aggressive

Si les lignes ont des formats légèrement différents :
- "abidjan-paris"
- "Abidjan - Paris" (avec espaces autour du tiret)
- "abidjan paris" (sans tiret)

**Modifier la normalisation :**

```javascript
// Au lieu de :
key = (tarif.ligne || "").toLowerCase().trim();

// Utiliser :
key = (tarif.ligne || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')      // Supprimer TOUS les espaces
    .replace(/[-_]/g, '');    // Supprimer tirets et underscores
```

Cela donnerait :
- "abidjan-paris" → "abidjanparis"
- "Abidjan - Paris" → "abidjanparis"
- "abidjan paris" → "abidjanparis"

→ Tous sont considérés comme identiques

### Solution C : Différencier par pays (si nécessaire)

Si vous voulez que "abidjan-paris (France)" et "abidjan-paris (Côte d'Ivoire)" soient **deux trajets différents** :

```javascript
if (currentType.includes('dhd')) {
    // Clé = ligne + pays
    key = `${(tarif.ligne || "").toLowerCase().trim()}|${(tarif.pays || "").toLowerCase().trim()}`;
}
```

## 🧪 Test immédiat

1. **Rafraîchir la page** (Ctrl+F5)
2. **Ouvrir la console** (F12)
3. **Sélectionner le type d'expédition** concerné
4. **Chercher dans les logs** :
   ```
   📍 Tarif ID xxx: ligne="abidjan-paris"
   ```
5. **Copier TOUS les logs** entre `🛣️ DEBUG DEDUPLICATION - Début` et `🛣️ DEBUG DEDUPLICATION - Fin`
6. **Me les envoyer**

## 📊 Informations à fournir

Pour que je puisse vous aider :

### 1. Les logs complets
Copier tout le bloc de debug :
```
🛣️ DEBUG DEDUPLICATION - Début
...
🛣️ DEBUG DEDUPLICATION - Fin
```

### 2. Capture du dropdown
Screenshot montrant les deux "abidjan-paris" dans le dropdown

### 3. Questions
- Les deux "abidjan-paris" sont-ils exactement identiques visuellement ?
- Ou ont-ils une différence (espaces, casse, pays affiché, etc.) ?

## 💡 Hypothèses probables

### Hypothèse 1 : Différence de format invisible
Les deux lignes semblent identiques mais ont :
- Des espaces différents : "abidjan-paris" vs "abidjan -paris" (espace avant le tiret)
- Des tirets différents : "abidjan-paris" vs "abidjan–paris" (tiret court vs long)
- Des caractères invisibles

### Hypothèse 2 : Pays différent
Si le dropdown affiche aussi le pays :
- "abidjan-paris (France)"
- "abidjan-paris (Côte d'Ivoire)"

→ Ce sont techniquement deux trajets différents

### Hypothèse 3 : Erreur de clé dans le map
Le `key={r.id}` dans le `map` n'est pas unique, causant un bug de rendu React

## 🎯 Action immédiate

**Envoyez-moi les logs de la console** avec :
```
🛣️ DEBUG DEDUPLICATION - Début
[tous les logs...]
🛣️ DEBUG DEDUPLICATION - Fin
```

Les logs me diront exactement pourquoi il y a deux "abidjan-paris" ! 🔍
