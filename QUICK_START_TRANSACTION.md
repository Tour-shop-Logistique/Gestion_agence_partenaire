# ⚡ Quick Start - Composant Transaction

## 🚀 Démarrage rapide en 3 étapes

### Étape 1 : Import

```javascript
import { RecordTransactionButton } from '../components/transaction';
```

### Étape 2 : Utilisation

```javascript
<RecordTransactionButton
  expeditionId="7b00cdc1-0194-4a5a-9619-fc3c28936971"
  expeditionReference="EXP-2024-001"
  defaultAmount={15500}
/>
```

### Étape 3 : C'est tout ! 🎉

Le composant gère automatiquement :
- ✅ L'ouverture du modal
- ✅ La validation des données
- ✅ L'appel API
- ✅ Les notifications
- ✅ La fermeture du modal

---

## 📋 Props essentielles

| Prop | Type | Exemple |
|------|------|---------|
| `expeditionId` | string | `"7b00cdc1-0194-4a5a-9619-fc3c28936971"` |
| `expeditionReference` | string | `"EXP-2024-001"` |
| `defaultAmount` | number | `15500` |

---

## 🎨 Personnalisation rapide

### Changer la couleur

```javascript
<RecordTransactionButton
  expeditionId={id}
  variant="success"  // primary, success, warning, danger, secondary, outline
/>
```

### Changer la taille

```javascript
<RecordTransactionButton
  expeditionId={id}
  size="lg"  // sm, md, lg
/>
```

### Changer le texte

```javascript
<RecordTransactionButton
  expeditionId={id}
  label="Encaisser maintenant"
/>
```

---

## 💡 Exemples courants

### Encaisser le montant principal

```javascript
<RecordTransactionButton
  expeditionId={expedition.id}
  expeditionReference={expedition.reference}
  defaultAmount={expedition.montant_expedition}
  defaultType="encaissement"
  defaultObject="montant_expedition"
  variant="success"
  label="Encaisser"
/>
```

### Encaisser les frais annexes

```javascript
<RecordTransactionButton
  expeditionId={expedition.id}
  expeditionReference={expedition.reference}
  defaultAmount={expedition.frais_annexes}
  defaultType="encaissement"
  defaultObject="frais_annexes"
  variant="warning"
  label="Frais annexes"
/>
```

### Rembourser un client

```javascript
<RecordTransactionButton
  expeditionId={expedition.id}
  expeditionReference={expedition.reference}
  defaultAmount={expedition.montant_expedition}
  defaultType="decaissement"
  defaultObject="remboursement"
  variant="danger"
  label="Rembourser"
/>
```

---

## 🔄 Rafraîchir les données après transaction

```javascript
<RecordTransactionButton
  expeditionId={expedition.id}
  expeditionReference={expedition.reference}
  defaultAmount={expedition.montant_expedition}
  onSuccess={(data) => {
    // Rafraîchir les données
    fetchExpeditionDetails(expedition.id);
  }}
/>
```

---

## 📱 Responsive automatique

Le composant s'adapte automatiquement à tous les écrans :
- ✅ Mobile
- ✅ Tablette
- ✅ Desktop

Aucune configuration nécessaire !

---

## 🎯 Modes de paiement disponibles

Le modal propose automatiquement :
- 💵 Espèces (cash)
- 📱 Mobile Money
- 🏦 Virement bancaire
- ❓ Autre

---

## 📊 Objets de paiement disponibles

Le modal propose automatiquement :
- Montant expédition
- Frais annexes
- Frais d'enlèvement
- Frais de livraison
- Remboursement
- Autre

---

## ✅ Validation automatique

Le composant valide automatiquement :
- ✅ Montant > 0
- ✅ Mode de paiement sélectionné
- ✅ Référence obligatoire si non-cash
- ✅ Objet du paiement sélectionné

---

## 🔔 Notifications automatiques

Le composant affiche automatiquement :
- ✅ Toast de succès après enregistrement
- ❌ Toast d'erreur en cas de problème

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **Guide utilisateur** : `GUIDE_COMPOSANT_TRANSACTION.md`
- **Documentation technique** : `COMPOSANT_TRANSACTION_README.md`
- **Page de démonstration** : `src/pages/TransactionDemo.jsx`

---

## 🆘 Problème ?

### Le bouton ne s'affiche pas
- Vérifier l'import : `import { RecordTransactionButton } from '../components/transaction';`
- Vérifier que `expeditionId` est fourni

### L'API ne répond pas
- Vérifier que l'endpoint `/api/agence/record-transaction` est accessible
- Vérifier que le token d'authentification est valide

### Le modal ne se ferme pas
- Vérifier que `onSubmit` ne lance pas d'erreur
- Consulter la console pour les erreurs

---

## 🎉 C'est tout !

Vous êtes prêt à utiliser le composant de transaction dans votre application !

**Version** : 1.0.0  
**Date** : 8 Mai 2026
