import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestContext';
import { formatPrice } from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import RequestDetailsModal from '../components/RequestDetailsModal';
import ChatModal from '../components/ChatModal';
import InvoiceModal from '../components/InvoiceModal';

const ClientRequests = () => {
  const { currentUser } = useAuth();
  const { 
    getRequestsByAgency, 
    updateRequestStatus, 
    acceptRequest, 
    rejectRequest, 
    updateRequestPrice,
    filterRequests,
    packageStatuses,
    rejectionReasons,
    getRequestStats,
    getRevenueStats
  } = useRequests();

  const [filters, setFilters] = useState({
    status: '',
    destination: '',
    clientName: '',
    isUrgent: ''
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');

  const requests = filterRequests(currentUser?.id, filters);
  const stats = getRequestStats(currentUser?.id);
  const revenueStats = getRevenueStats(currentUser?.id);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAcceptRequest = (requestId) => {
    acceptRequest(requestId);
  };

  const handleRejectRequest = () => {
    if (selectedRequest && rejectReason) {
      rejectRequest(selectedRequest.id, rejectReason, rejectNotes);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectNotes('');
      setSelectedRequest(null);
    }
  };

  const handleUpdatePrice = () => {
    if (selectedRequest && newPrice) {
      updateRequestPrice(selectedRequest.id, parseInt(newPrice), priceReason);
      setShowPriceModal(false);
      setNewPrice('');
      setPriceReason('');
      setSelectedRequest(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Acceptée':
        return 'bg-green-100 text-green-800';
      case 'Refusée':
        return 'bg-red-100 text-red-800';
      case 'En cours d\'enlèvement':
      case 'En cours de dépôt':
      case 'Collecté':
      case 'Enregistré':
        return 'bg-blue-100 text-blue-800';
      case 'En transit':
        return 'bg-purple-100 text-purple-800';
      case 'En cours de livraison':
        return 'bg-indigo-100 text-indigo-800';
      case 'Livré':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En attente':
        return '⏳';
      case 'Acceptée':
        return '✅';
      case 'Refusée':
        return '❌';
      case 'En cours d\'enlèvement':
        return '🚚';
      case 'En cours de dépôt':
        return '📦';
      case 'Collecté':
        return '📥';
      case 'Enregistré':
        return '📋';
      case 'En transit':
        return '✈️';
      case 'En cours de livraison':
        return '🚛';
      case 'Livré':
        return '🎉';
      default:
        return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-yellow-600 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Demandes Client</h1>
              <p className="text-orange-100 text-sm sm:text-base">
                Gérez les demandes d'exportation de vos clients
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-orange-100">Total: {stats.total}</p>
                <p className="text-sm text-orange-100">En attente: {stats.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total demandes</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">En attente</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Acceptées</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(revenueStats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Chiffre d'affaires</div>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Statut"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: 'Tous les statuts' },
                ...packageStatuses.map(status => ({ value: status, label: status }))
              ]}
            />
            <Input
              label="Destination"
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              placeholder="Rechercher par destination..."
            />
            <Input
              label="Client"
              value={filters.clientName}
              onChange={(e) => handleFilterChange('clientName', e.target.value)}
              placeholder="Rechercher par nom..."
            />
            <Select
              label="Urgence"
              value={filters.isUrgent}
              onChange={(e) => handleFilterChange('isUrgent', e.target.value)}
              options={[
                { value: '', label: 'Toutes' },
                { value: 'true', label: 'Urgentes' },
                { value: 'false', label: 'Normales' }
              ]}
            />
          </div>
        </Card>

        {/* Liste des demandes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Demandes ({requests.length})
            </h3>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune demande trouvée
              </h3>
              <p className="text-gray-600">
                Aucune demande ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {request.clientName}
                        </h4>
                        {request.isUrgent && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🔥 Urgent
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)} {request.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>📍 {request.destination}</div>
                        <div>⚖️ {request.packageDetails.weight}</div>
                        <div>💰 {formatPrice(request.finalPrice)}</div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-2">
                        📅 {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                      >
                        👁️ Détails
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowChatModal(true);
                        }}
                      >
                        💬 Chat
                      </Button>

                      {request.status === 'En attente' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            ✅ Accepter
                          </Button>
                          
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                          >
                            ❌ Refuser
                          </Button>
                        </>
                      )}

                      {['Acceptée', 'En cours d\'enlèvement'].includes(request.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setNewPrice(request.finalPrice.toString());
                            setShowPriceModal(true);
                          }}
                        >
                          💰 Ajuster prix
                        </Button>
                      )}

                      {['Acceptée', 'En cours d\'enlèvement', 'Collecté'].includes(request.status) && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowInvoiceModal(true);
                          }}
                        >
                          📄 Facture
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
          onStatusUpdate={(newStatus) => {
            updateRequestStatus(selectedRequest.id, newStatus);
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Modal de chat */}
      {showChatModal && selectedRequest && (
        <ChatModal
          request={selectedRequest}
          onClose={() => {
            setShowChatModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Modal de facture */}
      {showInvoiceModal && selectedRequest && (
        <InvoiceModal
          request={selectedRequest}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Modal de refus */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Refuser la demande
            </h3>
            
            <div className="space-y-4">
              <Select
                label="Motif de refus"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                options={[
                  { value: '', label: 'Sélectionner un motif' },
                  ...rejectionReasons.map(reason => ({ value: reason, label: reason }))
                ]}
                required
              />
              
              <Input
                label="Notes supplémentaires"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Détails supplémentaires..."
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="danger"
                onClick={handleRejectRequest}
                disabled={!rejectReason}
              >
                Refuser
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectNotes('');
                  setSelectedRequest(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajustement de prix */}
      {showPriceModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajuster le prix
            </h3>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Prix actuel: <span className="font-semibold">{formatPrice(selectedRequest.finalPrice)}</span>
              </div>
              
              <Input
                label="Nouveau prix (FCFA)"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Entrez le nouveau prix"
                required
              />
              
              <Input
                label="Raison de l'ajustement"
                value={priceReason}
                onChange={(e) => setPriceReason(e.target.value)}
                placeholder="Ex: Poids réel différent, frais supplémentaires..."
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="primary"
                onClick={handleUpdatePrice}
                disabled={!newPrice}
              >
                Mettre à jour
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPriceModal(false);
                  setNewPrice('');
                  setPriceReason('');
                  setSelectedRequest(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientRequests;
