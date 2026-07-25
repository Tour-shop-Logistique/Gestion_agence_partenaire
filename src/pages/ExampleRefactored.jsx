/**
 * EXEMPLE DE PAGE REFACTORISÉE
 * Montre l'application du Design System
 */
import React, { useState } from "react";
import { 
  Button, 
  Card, 
  Input, 
  Badge, 
  Table, 
  TableHeader, 
  TableHeaderCell,
  TableBody, 
  TableRow, 
  TableCell,
  TableEmpty,
  TableLoading,
  KPI,
  PageHeader 
} from '../components/ui';
import { 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  TruckIcon,
  BanknotesIcon,
  CheckCircleIcon,
  InboxIcon
} from "@heroicons/react/24/outline";

const ExampleRefactored = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Données d'exemple
  const data = [
    { id: 1, reference: "EXP001", client: "Client A", montant: 15000, statut: "paye" },
    { id: 2, reference: "EXP002", client: "Client B", montant: 25000, statut: "en_attente" },
    { id: 3, reference: "EXP003", client: "Client C", montant: 35000, statut: "paye" }
  ];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  };
  
  const getStatusBadge = (status) => {
    const variants = {
      paye: 'success',
      en_attente: 'warning',
      refuse: 'danger'
    };
    
    const labels = {
      paye: 'Payé',
      en_attente: 'En attente',
      refuse: 'Refusé'
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };
  
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };
  
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      
      {/* Header */}
      <PageHeader 
        title="Expéditions"
        subtitle="Gérez et suivez toutes vos expéditions"
        actions={
          <>
            <Button 
              variant="secondary" 
              icon={ArrowPathIcon}
              onClick={handleRefresh}
              loading={loading}
            >
              Actualiser
            </Button>
            <Button variant="primary" icon={PlusIcon}>
              Nouvelle expédition
            </Button>
          </>
        }
      />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI 
          label="Total Expéditions"
          value="1,234"
          subtitle="Ce mois"
          icon={TruckIcon}
          variant="default"
        />
        <KPI 
          label="Montant Total"
          value="2,450,000 CFA"
          subtitle="Chiffre d'affaires"
          icon={BanknotesIcon}
          variant="primary"
        />
        <KPI 
          label="Payées"
          value="1,100"
          subtitle="89% du total"
          icon={CheckCircleIcon}
          variant="success"
          trend={12.5}
        />
        <KPI 
          label="En attente"
          value="134"
          subtitle="11% du total"
          icon={InboxIcon}
          variant="warning"
        />
      </div>
      
      {/* Filtres */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input 
            placeholder="Rechercher par référence, client..."
            icon={MagnifyingGlassIcon}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">Filtrer</Button>
            <Button variant="ghost" size="sm">Réinitialiser</Button>
          </div>
        </div>
      </Card>
      
      {/* Tableau */}
      <Card padding={false}>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>Référence</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell align="right">Montant</TableHeaderCell>
              <TableHeaderCell align="center">Statut</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableLoading rows={5} cols={5} />
            ) : data.length > 0 ? (
              data.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-semibold text-slate-900">{item.reference}</span>
                  </TableCell>
                  <TableCell>{item.client}</TableCell>
                  <TableCell align="right">
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(item.montant)} CFA
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    {getStatusBadge(item.statut)}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">Voir</Button>
                      <Button variant="secondary" size="sm">Imprimer</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmpty 
                message="Aucune expédition trouvée" 
                icon={InboxIcon} 
              />
            )}
          </TableBody>
        </Table>
      </Card>
      
    </div>
  );
};

export default ExampleRefactored;
