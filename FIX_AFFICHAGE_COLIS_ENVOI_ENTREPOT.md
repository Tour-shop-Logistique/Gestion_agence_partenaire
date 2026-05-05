# Fix Affichage Colis pour Envoi vers Entrepôt

**Date**: 2026-05-01  
**Fichier modifié**: `src/pages/Colis.jsx`  
**Statut**: ✅ Corrigé avec logs de debug

---

## 🐛 PROBLÈME

Sur la page **Colis**, l'onglet **"Envoi pour expédition"** n'affichait pas les colis reçus à l'agence de départ qui doivent être envoyés vers l'entrepôt.

### Comportement attendu
L'onglet "Envoi pour expédition" doit afficher :
- Les colis **reçus à l'agence de départ** (`is_received_by_agence_depart === true`)
- Qui **ne sont pas encore expédiés vers l'entrepôt** (`is_expedie_vers_entrepot !== true`)

### Comportement observé
L'onglet affichait TOUS les colis reçus (départ OU destination), ce qui mélangeait les colis de différentes étapes du workflow.

---

## 🔍 ANALYSE

### Code problématique (ligne 72-87)

```javascript
// Calcul de is_received trop large
is_received: item.is_received_by_agence_depart === true || 
             item.is_received_by_agence_destination === true || 
             item.is_received_by_agence === true,

// Filtre trop permissif
const tabColis = useMemo(() => {
    if (activeTab === 'agence') {
        return allColis.filter(c => !c.is_received && c.expedition_status === 'accepted');
    } else {
        // ❌ Affiche TOUS les colis reçus (départ OU destination)
        return allColis.filter(c => c.is_received);
    }
}, [allColis, activeTab]);
```

### Problème identifié
Le flag `is_received` combine 3 états différents :
1. `is_received_by_agence_depart` - Reçu à l'agence de départ
2. `is_received_by_agence_destination` - Reçu à l'agence de destination
3. `is_received_by_agence` - Reçu (générique)

Le filtre de l'onglet "Envoi pour expédition" utilisait `c.is_received`, ce qui incluait les colis reçus à destination, alors qu'ils ne doivent plus être envoyés vers l'entrepôt.

---

## ✅ SOLUTION

### 1. Ajout de flags distincts (ligne 72-77)

```javascript
const allColis = useMemo(() => {
    if (!expeditions) return [];
    const colis = expeditions.flatMap(exp =>
        (exp.colis || []).map(item => ({
            ...item,
            expedition: exp,
            expedition_id: exp.id,
            expedition_status: exp.statut_expedition,
            // ✅ Flags distincts pour chaque étape
            is_received_depart: item.is_received_by_agence_depart === true,
            is_received_destination: item.is_received_by_agence_destination === true,
            is_received: item.is_received_by_agence_depart === true || 
                        item.is_received_by_agence_destination === true || 
                        item.is_received_by_agence === true,
            is_sent: item.is_expedie_vers_entrepot === true
        }))
    );
    
    // 🔍 Logs de debug pour comprendre la structure des données
    console.log("📦 Tous les colis:", colis);
    console.log("📊 Statistiques colis:", {
        total: colis.length,
        reçus_depart: colis.filter(c => c.is_received_depart).length,
        reçus_destination: colis.filter(c => c.is_received_destination).length,
        expédiés_entrepot: colis.filter(c => c.is_sent).length,
        prêts_envoi: colis.filter(c => c.is_received_depart && !c.is_sent).length
    });
    
    return colis;
}, [expeditions]);
```

### 2. Correction du filtre (ligne 95-105)

```javascript
const tabColis = useMemo(() => {
    if (activeTab === 'agence') {
        // Onglet "En agence" : colis NON reçus avec statut "accepted"
        const filtered = allColis.filter(c => !c.is_received && c.expedition_status === 'accepted');
        console.log("🏢 Onglet 'En agence' - Colis filtrés:", filtered.length);
        return filtered;
    } else {
        // ✅ Onglet "Envoi pour expédition" : colis reçus au départ ET pas encore expédiés
        const filtered = allColis.filter(c => c.is_received_depart && !c.is_sent);
        console.log("🚚 Onglet 'Envoi pour expédition' - Colis filtrés:", filtered.length, filtered);
        return filtered;
    }
}, [allColis, activeTab]);
```

---

## 🧪 TESTS À EFFECTUER

### 1. Ouvrir la console (F12)
Appuyez sur **F12** pour ouvrir la console du navigateur.

### 2. Naviguer vers la page Colis
Allez sur la page **Gestion des Colis**.

### 3. Vérifier les logs
Dans la console, vous devriez voir :
```
📦 Tous les colis: [...]
📊 Statistiques colis: {
  total: X,
  reçus_depart: Y,
  reçus_destination: Z,
  expédiés_entrepot: W,
  prêts_envoi: V
}
```

### 4. Tester l'onglet "En agence"
- Cliquer sur l'onglet **"En agence"**
- Vérifier le log : `🏢 Onglet 'En agence' - Colis filtrés: X`
- **Attendu** : Affiche les colis NON reçus avec statut "accepted"

### 5. Tester l'onglet "Envoi pour expédition"
- Cliquer sur l'onglet **"Envoi pour expédition"**
- Vérifier le log : `🚚 Onglet 'Envoi pour expédition' - Colis filtrés: X [...]`
- **Attendu** : Affiche les colis reçus à l'agence de départ ET pas encore expédiés vers l'entrepôt

### 6. Vérifier l'affichage
- Les colis doivent s'afficher dans le tableau/cartes
- Les colis déjà expédiés vers l'entrepôt ne doivent PAS apparaître
- Les colis reçus à destination ne doivent PAS apparaître

### 7. Tester l'action "Envoyer à l'entrepôt"
- Sélectionner un ou plusieurs colis
- Cliquer sur **"Envoyer à l'entrepôt"**
- Vérifier que les colis disparaissent de l'onglet après l'envoi

---

## 📊 WORKFLOW DES COLIS

```
1. Expédition créée
   └─> Colis créés (is_received_by_agence_depart = false)

2. Onglet "En agence" 
   └─> Affiche les colis avec statut "accepted" non reçus
   └─> Action : "Confirmer la réception"
   └─> is_received_by_agence_depart = true

3. Onglet "Envoi pour expédition"
   └─> Affiche les colis reçus au départ ET pas encore expédiés
   └─> Action : "Envoyer à l'entrepôt"
   └─> is_expedie_vers_entrepot = true

4. Colis en transit vers entrepôt
   └─> is_expedie_vers_entrepot = true
   └─> is_received_by_agence_destination = false

5. Colis reçu à destination
   └─> is_received_by_agence_destination = true
```

---

## 🔄 PROCHAINES ÉTAPES

1. **Tester** : Ouvrir la console et vérifier les logs
2. **Analyser** : Vérifier que les statistiques correspondent à la réalité
3. **Valider** : Tester le workflow complet (réception → envoi entrepôt)
4. **Nettoyer** : Une fois validé, retirer les console.log si souhaité

---

## 📝 NOTES

- Les console.log ont été ajoutés pour faciliter le debug
- Les flags `is_received_depart` et `is_received_destination` permettent de distinguer les étapes
- Le filtre de l'onglet "Envoi pour expédition" utilise maintenant `is_received_depart && !is_sent`
- Cette correction respecte le workflow métier des colis

---

## ✅ RÉSULTAT ATTENDU

Après cette correction, l'onglet **"Envoi pour expédition"** doit afficher uniquement les colis qui :
- ✅ Ont été reçus à l'agence de départ
- ✅ N'ont pas encore été expédiés vers l'entrepôt
- ❌ Ne sont pas reçus à destination (ceux-là sont dans un autre workflow)
