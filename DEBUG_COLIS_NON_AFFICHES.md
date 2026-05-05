# 🐛 Debug - Colis Non Affichés

Guide de diagnostic pour résoudre le problème des colis qui ne s'affichent pas dans l'onglet "Envoi pour expédition".

---

## 🎯 Problème

**Symptôme** : Plusieurs expéditions avec le statut `recu_agence_depart` ont des colis, mais ces colis ne s'affichent pas dans l'onglet "Envoi pour expédition".

---

## 🔍 Diagnostic Étape par Étape

### Étape 1 : Ouvrir la Console du Navigateur

1. Ouvrir la page **Gestion des Colis**
2. Appuyer sur **F12** pour ouvrir les outils de développement
3. Aller dans l'onglet **Console**

---

### Étape 2 : Vérifier les Logs Automatiques

Au chargement de la page, vous devriez voir :

```javascript
📦 Tous les colis: [...]
📊 Statistiques colis: {
  total: X,
  reçus_depart: X,
  reçus_destination: X,
  expédiés_entrepot: X,
  prêts_envoi: X,
  avec_statut_recu_agence_depart: X  // ← NOUVEAU
}
```

**Vérifications** :
- ✅ `total` > 0 : Il y a des colis dans les expéditions
- ✅ `avec_statut_recu_agence_depart` > 0 : Il y a des colis avec le bon statut

---

### Étape 3 : Cliquer sur l'Onglet "Envoi pour expédition"

Vous devriez voir :

```javascript
🚚 Onglet 'Envoi pour expédition' - Colis reçus à envoyer: {
  total: X,
  expeditions: ['EXP-2024-001', 'EXP-2024-002'],
  details: [
    {
      code: 'COL-001',
      expedition: 'EXP-2024-001',
      status: 'recu_agence_depart',
      is_received_depart: true,
      is_sent: false
    },
    ...
  ]
}
```

**Vérifications** :
- ✅ `total` > 0 : Des colis sont filtrés
- ✅ `expeditions` contient vos références
- ✅ `details` montre les colis avec leurs propriétés

---

## 🔧 Solutions Selon le Diagnostic

### Cas 1 : `total` = 0 dans les statistiques

**Problème** : Aucun colis n'est chargé

**Solution** :
1. Vérifier que les expéditions sont bien chargées
2. Vérifier que les expéditions ont des colis
3. Vérifier la réponse de l'API dans l'onglet **Network**

```javascript
// Dans la console, taper :
expeditions
// Vérifier que chaque expédition a un tableau 'colis'
```

---

### Cas 2 : `avec_statut_recu_agence_depart` = 0

**Problème** : Aucun colis n'a le statut `recu_agence_depart`

**Solution** :
1. Vérifier le statut des expéditions dans la base de données
2. Vérifier que le statut est bien `recu_agence_depart` (pas `reçu_agence_depart` avec accent)

```javascript
// Dans la console, taper :
allColis.map(c => ({ 
  code: c.code_colis, 
  status: c.expedition_status 
}))
// Vérifier les statuts
```

---

### Cas 3 : `total` dans l'onglet = 0 mais `avec_statut_recu_agence_depart` > 0

**Problème** : Les colis ont le bon statut mais sont filtrés par `is_sent`

**Solution** :
1. Vérifier que `is_sent` est bien `false`

```javascript
// Dans la console, taper :
allColis
  .filter(c => c.expedition_status === 'recu_agence_depart')
  .map(c => ({ 
    code: c.code_colis, 
    is_sent: c.is_sent,
    is_expedie_vers_entrepot: c.is_expedie_vers_entrepot
  }))
```

**Si `is_sent` est `true`** :
- Les colis ont déjà été marqués comme envoyés
- Vérifier dans la base de données le champ `is_expedie_vers_entrepot`

---

### Cas 4 : Les colis s'affichent dans les logs mais pas dans l'interface

**Problème** : Problème de rendu React

**Solution** :
1. Vérifier que `filteredColis` contient les colis

```javascript
// Dans la console, taper :
filteredColis
```

2. Rafraîchir la page (Ctrl+F5)
3. Vider le cache du navigateur

---

## 🔍 Commandes de Debug Utiles

### Voir tous les colis

```javascript
allColis
```

### Voir les colis avec statut `recu_agence_depart`

```javascript
allColis.filter(c => c.expedition_status === 'recu_agence_depart')
```

### Voir les colis prêts à être envoyés

```javascript
allColis.filter(c => 
  c.expedition_status === 'recu_agence_depart' && !c.is_sent
)
```

### Voir les statuts de toutes les expéditions

```javascript
expeditions.map(e => ({ 
  ref: e.reference, 
  status: e.statut_expedition,
  nb_colis: e.colis?.length || 0
}))
```

### Voir les détails d'une expédition spécifique

```javascript
expeditions.find(e => e.reference === 'EXP-2024-001')
```

---

## 🛠️ Corrections Apportées

### Modification 1 : Détection Automatique de `is_received_depart`

**Avant** :
```javascript
is_received_depart: item.is_received_by_agence_depart === true
```

**Après** :
```javascript
is_received_depart: item.is_received_by_agence_depart === true || 
                    exp.statut_expedition === 'recu_agence_depart'
```

**Explication** : Si l'expédition a le statut `recu_agence_depart`, on considère automatiquement que les colis sont reçus, même si le flag individuel n'est pas défini.

---

### Modification 2 : Simplification du Filtre

**Avant** :
```javascript
c.expedition_status === 'recu_agence_depart' && 
c.is_received_depart && 
!c.is_sent
```

**Après** :
```javascript
c.expedition_status === 'recu_agence_depart' && !c.is_sent
```

**Explication** : On se base principalement sur le statut de l'expédition, pas sur les flags individuels des colis.

---

### Modification 3 : Logs Détaillés

**Ajout** :
```javascript
details: filtered.map(c => ({
    code: c.code_colis,
    expedition: c.expedition?.reference,
    status: c.expedition_status,
    is_received_depart: c.is_received_depart,
    is_sent: c.is_sent
}))
```

**Explication** : Affiche les détails de chaque colis filtré pour faciliter le debugging.

---

## ✅ Checklist de Vérification

Après les modifications, vérifier :

- [ ] Les logs s'affichent correctement dans la console
- [ ] `avec_statut_recu_agence_depart` > 0
- [ ] L'onglet "Envoi pour expédition" affiche des colis
- [ ] Les colis affichés correspondent aux expéditions avec statut `recu_agence_depart`
- [ ] La sélection des colis fonctionne
- [ ] L'envoi vers l'entrepôt fonctionne

---

## 🆘 Si le Problème Persiste

### Vérifier la Base de Données

1. **Statut des expéditions** :
   ```sql
   SELECT reference, statut_expedition, COUNT(colis.id) as nb_colis
   FROM expeditions
   LEFT JOIN colis ON colis.expedition_id = expeditions.id
   WHERE statut_expedition = 'recu_agence_depart'
   GROUP BY expeditions.id;
   ```

2. **Flags des colis** :
   ```sql
   SELECT code_colis, is_expedie_vers_entrepot, is_received_by_agence_depart
   FROM colis
   WHERE expedition_id IN (
     SELECT id FROM expeditions WHERE statut_expedition = 'recu_agence_depart'
   );
   ```

---

### Vérifier l'API

1. Ouvrir l'onglet **Network** dans les outils de développement
2. Filtrer par **XHR** ou **Fetch**
3. Chercher la requête qui charge les expéditions
4. Vérifier la réponse JSON :
   - Les expéditions ont-elles des colis ?
   - Les statuts sont-ils corrects ?
   - Les flags sont-ils définis ?

---

### Forcer le Rechargement

```javascript
// Dans la console, taper :
fetchColisData(true)
```

---

## 📞 Support

Si le problème persiste après toutes ces vérifications :

1. Copier les logs de la console
2. Copier la réponse de l'API (onglet Network)
3. Vérifier les données en base de données
4. Partager ces informations pour un diagnostic approfondi

---

**Version** : 1.0.0
**Dernière mise à jour** : Mai 2026
