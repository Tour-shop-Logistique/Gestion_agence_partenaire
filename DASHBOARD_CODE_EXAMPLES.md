# 💻 Dashboard - Exemples de Code

## 📦 Ajouter un Nouveau KPI

### Exemple : Ajouter "Colis en retard"

```jsx
// Dans src/components/dashboard/KPISection.jsx

<KPICard
    icon={ExclamationTriangleIcon}
    label="Colis en retard"
    value={operational.colis_en_retard || 0}
    unit="Colis"
    badge="Urgent"
    colorScheme="red"
    link="/colis-en-retard"
    isClickable={true}
    tooltip={
        <>
            <p className="font-semibold mb-1">Colis en retard de livraison</p>
            <p className="text-slate-300 mb-2">Colis qui dépassent le délai de livraison prévu.</p>
            <p className="text-red-300 font-semibold">→ Action : Contacter les clients et expliquer le retard</p>
        </>
    }
/>
```

---

## 🔥 Ajouter une Nouvelle Action Prioritaire

### Exemple : Ajouter "Factures à envoyer"

```jsx
// Dans src/components/dashboard/PriorityActions.jsx

const actions = [
    // ... actions existantes
    {
        id: 'factures',
        title: 'Factures à envoyer',
        subtitle: 'Comptabilité',
        count: financial.factures_en_attente || 0,
        urgent: (financial.factures_en_attente || 0) > 20,
        icon: DocumentTextIcon,
        link: '/factures',
        color: 'blue',
        description: 'Factures clients en attente d\'envoi'
    }
];
```

---

## 📊 Ajouter une Nouvelle Statistique

### Exemple : Ajouter "Clients actifs"

```jsx
// Dans src/components/dashboard/StatsCards.jsx

<div className="flex items-center justify-between group/item hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-xs font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors">
            Clients actifs
        </span>
        <div className="relative group/tooltip">
            <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <div className="absolute left-0 top-5 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 shadow-xl">
                <p className="font-semibold mb-1">Clients actifs ce mois</p>
                <p className="text-slate-300">Nombre de clients ayant effectué au moins une expédition ce mois.</p>
            </div>
        </div>
    </div>
    <span className="text-sm font-bold text-slate-900">{logistics.clients_actifs || 0}</span>
</div>
```

---

## 🔄 Modifier le Flux Logistique

### Exemple : Ajouter une étape "Douane"

```jsx
// Dans src/components/dashboard/LogisticsFlow.jsx

const stages = [
    // ... étapes existantes
    {
        id: 'douane',
        label: 'Douane',
        sublabel: 'Contrôle',
        icon: ShieldCheckIcon,
        count: operational.colis_en_douane || 0,
        color: 'orange',
        description: 'En contrôle douanier'
    }
];
```

---

## 🎨 Créer un Nouveau Schéma de Couleur

### Exemple : Ajouter une couleur "Cyan"

```jsx
// Dans n'importe quel composant avec colorMap

const colorMap = {
    // ... couleurs existantes
    cyan: {
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-600',
        badgeBg: 'bg-cyan-50',
        badgeText: 'text-cyan-600'
    }
};
```

---

## 🔔 Personnaliser l'Alerte

### Exemple : Alerte pour impayés critiques

```jsx
// Dans src/pages/Dashboard.jsx

{financial.statut_paiements?.impaye > 100000 && showImpayesAlert && (
    <div className="bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-2 border-red-300 rounded-xl p-5 flex items-start gap-4 shadow-md">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-red-900 mb-1">
                Impayés critiques : {new Intl.NumberFormat('fr-FR').format(financial.statut_paiements?.impaye)} CFA
            </h3>
            <p className="text-sm text-red-800 mb-3 font-medium">
                Le montant des impayés dépasse le seuil critique. Action immédiate requise.
            </p>
            <button
                onClick={() => navigate('/comptabilite')}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
                Voir la comptabilité
                <ArrowRightIcon className="w-4 h-4" />
            </button>
        </div>
        <button
            onClick={() => setShowImpayesAlert(false)}
            className="flex-shrink-0 p-2 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
        >
            <XMarkIcon className="w-5 h-5" />
        </button>
    </div>
)}
```

---

## 📈 Ajouter un Graphique

### Exemple : Graphique d'évolution du CA

```jsx
// Installation
// npm install recharts

// Dans un nouveau composant src/components/dashboard/RevenueChart.jsx

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-emerald-600">📈</span>
                    Évolution du chiffre d'affaires
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">7 derniers jours</p>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="montant" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;

// Utilisation dans Dashboard.jsx
import RevenueChart from "../components/dashboard/RevenueChart";

// Dans le JSX
<RevenueChart data={financial.evolution_ca_7j || []} />
```

---

## 🔍 Ajouter des Filtres

### Exemple : Filtre de période

```jsx
// Dans src/pages/Dashboard.jsx

const [period, setPeriod] = useState('today'); // 'today', 'week', 'month'

// Dans le JSX
<div className="flex items-center gap-2">
    <button
        onClick={() => setPeriod('today')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            period === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
    >
        Aujourd'hui
    </button>
    <button
        onClick={() => setPeriod('week')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            period === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
    >
        7 jours
    </button>
    <button
        onClick={() => setPeriod('month')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            period === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
    >
        30 jours
    </button>
</div>

// Modifier le useEffect
useEffect(() => {
    fetchDashboard({ period });
    // ...
}, [period]);
```

---

## 🎯 Ajouter une Action Rapide

### Exemple : Bouton "Exporter PDF"

```jsx
// Dans src/pages/Dashboard.jsx

const handleExportPDF = () => {
    // Logique d'export
    console.log('Export PDF du dashboard');
};

// Dans le header
<button 
    onClick={handleExportPDF}
    className="p-3 bg-white border-2 border-slate-200 rounded-xl text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm"
    title="Exporter en PDF"
>
    <DocumentArrowDownIcon className="w-5 h-5" />
</button>
```

---

## 🔔 Ajouter une Notification

### Exemple : Toast de succès

```jsx
// Installation
// npm install react-hot-toast

// Dans src/pages/Dashboard.jsx
import toast from 'react-hot-toast';

// Après une action
const handleRefresh = async () => {
    await fetchDashboard(true);
    toast.success('Dashboard actualisé !', {
        icon: '✅',
        style: {
            borderRadius: '10px',
            background: '#10b981',
            color: '#fff',
        },
    });
};
```

---

## 📱 Personnaliser le Responsive

### Exemple : Masquer une section sur mobile

```jsx
// Dans n'importe quel composant

<div className="hidden md:block">
    {/* Contenu visible uniquement sur tablet et desktop */}
    <LogisticsFlow operational={operational} />
</div>

<div className="block md:hidden">
    {/* Contenu visible uniquement sur mobile */}
    <LogisticsFlowMobile operational={operational} />
</div>
```

---

## 🎨 Créer un Composant Réutilisable

### Exemple : Badge de statut

```jsx
// Dans src/components/ui/StatusBadge.jsx

import React from "react";

const StatusBadge = ({ status, label }) => {
    const colorMap = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        error: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${colorMap[status]}`}>
            {label}
        </span>
    );
};

export default StatusBadge;

// Utilisation
<StatusBadge status="success" label="Livré" />
<StatusBadge status="warning" label="En attente" />
<StatusBadge status="error" label="Retard" />
```

---

## 🔄 Ajouter un Refresh Automatique

### Exemple : Actualisation toutes les 30 secondes

```jsx
// Dans src/pages/Dashboard.jsx

useEffect(() => {
    // Refresh initial
    fetchDashboard();
    
    // Refresh automatique toutes les 30 secondes
    const interval = setInterval(() => {
        fetchDashboard();
    }, 30000);
    
    // Cleanup
    return () => clearInterval(interval);
}, []);
```

---

## 🎭 Ajouter une Animation

### Exemple : Compteur animé

```jsx
// Installation
// npm install react-countup

// Dans un composant KPI
import CountUp from 'react-countup';

<h3 className="text-2xl font-bold text-slate-900">
    <CountUp 
        end={financial.chiffre_affaires_mois || 0} 
        duration={1.5}
        separator=" "
    />
</h3>
```

---

## 🔐 Ajouter des Permissions

### Exemple : Masquer les KPI financiers pour certains rôles

```jsx
// Dans src/pages/Dashboard.jsx

const { currentUser } = useAuth();
const canViewFinancials = currentUser?.role === 'admin' || currentUser?.role === 'manager';

// Dans le JSX
{canViewFinancials && (
    <div>
        <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="text-emerald-600">💰</span>
                Performance financière
            </h2>
        </div>
        {/* KPI financiers */}
    </div>
)}
```

---

## 📊 Ajouter un Indicateur de Tendance

### Exemple : Flèche de tendance sur les KPI

```jsx
// Dans src/components/dashboard/KPISection.jsx

const KPICard = ({ 
    // ... props existantes
    trend = null, // { value: 12, direction: 'up' }
}) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            {/* ... contenu existant */}
            
            {trend && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                    trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                    {trend.direction === 'up' ? (
                        <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                    )}
                    <span>{trend.value}%</span>
                    <span className="text-slate-400">vs hier</span>
                </div>
            )}
        </div>
    );
};

// Utilisation
<KPICard
    icon={CurrencyDollarIcon}
    label="Chiffre d'affaires"
    value={financial.chiffre_affaires_mois || 0}
    unit="CFA"
    badge="Ce mois"
    colorScheme="emerald"
    trend={{ value: 12, direction: 'up' }}
/>
```

---

## 🎯 Ajouter un Mode Sombre

### Exemple : Toggle dark mode

```jsx
// Dans src/pages/Dashboard.jsx

const [darkMode, setDarkMode] = useState(false);

// Dans le header
<button 
    onClick={() => setDarkMode(!darkMode)}
    className="p-3 bg-white border-2 border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm"
    title="Mode sombre"
>
    {darkMode ? (
        <SunIcon className="w-5 h-5" />
    ) : (
        <MoonIcon className="w-5 h-5" />
    )}
</button>

// Appliquer les classes dark:
<div className={darkMode ? 'dark' : ''}>
    <div className="bg-white dark:bg-slate-900 ...">
        {/* Contenu */}
    </div>
</div>
```

---

## 🔍 Ajouter une Recherche

### Exemple : Recherche d'expéditions

```jsx
// Dans src/components/dashboard/RecentExpeditions.jsx

const [searchTerm, setSearchTerm] = useState('');

const filteredExpeditions = expeditions.filter(exp =>
    exp.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.pays_destination.toLowerCase().includes(searchTerm.toLowerCase())
);

// Dans le JSX
<div className="px-6 py-4 border-b border-slate-100">
    <input
        type="text"
        placeholder="Rechercher une expédition..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
</div>

{filteredExpeditions.map(expedition => (
    // ... affichage
))}
```

---

## 📝 Bonnes Pratiques

### 1. Nommage des Composants

```jsx
// ✅ Bon
<PriorityActions />
<SmartSummary />
<KPISection />

// ❌ Mauvais
<Actions />
<Summary />
<KPI />
```

### 2. Props Explicites

```jsx
// ✅ Bon
<KPICard
    icon={CurrencyDollarIcon}
    label="Chiffre d'affaires"
    value={1250000}
    unit="CFA"
    badge="Ce mois"
    colorScheme="emerald"
/>

// ❌ Mauvais
<KPICard
    data={{
        icon: CurrencyDollarIcon,
        label: "Chiffre d'affaires",
        // ...
    }}
/>
```

### 3. Gestion des États

```jsx
// ✅ Bon
const [showAlert, setShowAlert] = useState(true);

// ❌ Mauvais
let showAlert = true;
```

### 4. Formatage des Données

```jsx
// ✅ Bon
{new Intl.NumberFormat('fr-FR').format(value)}

// ❌ Mauvais
{value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
```

---

**Exemples de code complets pour personnaliser le Dashboard ! 💻**
