import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestContext';
import DashboardLayout from '../components/DashboardLayout';

const Requests = () => {
  const { currentUser, isAdmin, isAgent } = useAuth();
  const { 
    getRequestsByAgency, 
    getRequestsByAgent, 
    getRequestStats,
    getNewRequests,
    acceptRequest, 
    rejectRequest, 
    updateRequestStatus,
    adjustPrice,
    getStatusLabel, 
    getStatusColor,
    getStatusIcon,
    getNextStatus,
    generateInvoice,
    getUnreadNotifications
  } = useRequests();

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({ notes: '', rejectionReason: '' });
  const [priceData, setPriceData] = useState({ newPrice: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtenir les demandes selon le rôle
  const getRequests = () => {
    if (isAdmin()) {
      return getRequestsByAgency(currentUser?.id);
    } else {
      return getRequestsByAgent(currentUser?.id);
    }
  };

  const requests = getRequests();
  const newRequests = getNewRequests(currentUser?.id);
  const stats = getRequestStats(currentUser?.id);

  // Mettre à jour le compteur de notifications
  useEffect(() => {
    setUnreadCount(getUnreadNotifications().length);
  }, [getUnreadNotifications]);

  // Filtrer les demandes par statut
  const filteredRequests = selectedStatus === 'all' 
    ? requests 
    : requests.filter(request => request.status === selectedStatus);

  const handleAction = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setActionData({ notes: '', rejectionReason: '' });
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;
      
      if (actionType === 'accept') {
        result = await acceptRequest(selectedRequest.id, currentUser.id, actionData.notes);
      } else if (actionType === 'reject') {
        result = await rejectRequest(selectedRequest.id, currentUser.id, actionData.rejectionReason);
      } else if (actionType === 'updateStatus') {
        result = await updateRequestStatus(selectedRequest.id, actionData.status, actionData.notes);
      }

      if (result.success) {
        setMessage(result.message);
        setShowActionModal(false);
        setSelectedRequest(null);
        setActionData({ notes: '', rejectionReason: '' });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceAdjustment = (request) => {
    setSelectedRequest(request);
    setPriceData({ newPrice: request.finalPrice.toString(), reason: '' });
    setShowPriceModal(true);
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await adjustPrice(
        selectedRequest.id, 
        parseInt(priceData.newPrice), 
        priceData.reason
      );

      if (result.success) {
        setMessage(result.message);
        setShowPriceModal(false);
        setSelectedRequest(null);
        setPriceData({ newPrice: '', reason: '' });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (request) => {
    setSelectedRequest(request);
    setShowInvoiceModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgentBadge = (isUrgent) => {
    if (!isUrgent) return null;
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
        🔥 Urgent
      </span>
    );
  };

  return (
    <DashboardLayout>
      {/* Titre de la page */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demandes clients</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin() 
                ? 'Gérez toutes les demandes de votre agence'
                : 'Gérez vos demandes assignées'
              }
            </p>
          </div>
          {newRequests.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                🔔 {newRequests.length} nouvelle{newRequests.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('succès') 
            ? 'bg-green-50 border border-green-200 text-green-600' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.accepted}</div>
          <div className="text-sm text-gray-600">Acceptées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">{stats.inTransit}</div>
          <div className="text-sm text-gray-600">En transit</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          <div className="text-sm text-gray-600">Livrées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{formatPrice(stats.totalRevenue)}</div>
          <div className="text-sm text-gray-600">Revenus</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Filtrer les demandes</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accepted">Acceptées</option>
                <option value="rejected">Refusées</option>
                <option value="pickup_in_progress">En cours d'enlèvement</option>
                <option value="dropoff_in_progress">En cours de dépôt</option>
                <option value="collected">Collectées</option>
                <option value="registered">Enregistrées</option>
                <option value="in_transit">En transit</option>
                <option value="delivery_in_progress">En cours de livraison</option>
                <option value="delivered">Livrées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Demandes ({filteredRequests.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'Aucune demande trouvée'
                  : `Aucune demande avec le statut "${getStatusLabel(selectedStatus)}"`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">
                            Demande #{request.id} - {request.clientName}
                          </h4>
                          {getUrgentBadge(request.isUrgent)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)} {getStatusLabel(request.status)}
                          </span>
                          {request.invoiceNumber && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📄 {request.invoiceNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Destination</p>
                          <p className="font-medium">{request.destination}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Poids & Dimensions</p>
                          <p className="font-medium">{request.weight} kg - {request.dimensions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Prix</p>
                          <p className="font-medium">
                            {formatPrice(request.finalPrice)}
                            {request.finalPrice !== request.originalPrice && (
                              <span className="text-xs text-gray-500 ml-1">
                                (ajusté de {formatPrice(request.originalPrice)})
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="text-sm">{request.description}</p>
                      </div>

                      {request.specialInstructions && (
                        <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800">Instructions spéciales</p>
                          <p className="text-sm text-yellow-700">{request.specialInstructions}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Client</p>
                          <p>{request.clientName}</p>
                          <p className="text-gray-500">{request.clientEmail}</p>
                          <p className="text-gray-500">{request.clientPhone}</p>
                        </div>
                        {request.notes && (
                          <div>
                            <p className="text-gray-600">Notes</p>
                            <p className="text-gray-700">{request.notes}</p>
                          </div>
                        )}
                      </div>

                      {request.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800">Motif du refus</p>
                          <p className="text-sm text-red-700">{request.rejectionReason}</p>
                        </div>
                      )}

                      {/* Timeline du statut */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Progression</p>
                        <div className="flex items-center space-x-1 text-xs">
                          <div className={`w-2 h-2 rounded-full ${['accepted', 'pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Acceptée</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded">
                            <div className={`h-1 rounded ${['pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status) ? 'bg-green-500' : 'bg-gray-300'}`} style={{ width: ['pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status) ? '100%' : '0%' }}></div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${['pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Collectée</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded">
                            <div className={`h-1 rounded ${['registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status) ? 'bg-green-500' : 'bg-gray-300'}`} style={{ width: ['registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status) ? '100%' : '0%' }}></div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${['registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">En transit</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded">
                            <div className={`h-1 rounded ${['delivery_in_progress', 'delivered'].includes(request.status) ? 'bg-green-500' : 'bg-gray-300'}`} style={{ width: ['delivery_in_progress', 'delivered'].includes(request.status) ? '100%' : '0%' }}></div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${['delivery_in_progress', 'delivered'].includes(request.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Livrée</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col space-y-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(request, 'accept')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            ✅ Accepter
                          </button>
                          <button
                            onClick={() => handleAction(request, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            ❌ Refuser
                          </button>
                        </>
                      )}

                      {getNextStatus(request.status).length > 0 && (
                        <button
                          onClick={() => handleAction(request, 'updateStatus')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          🔄 Mettre à jour
                        </button>
                      )}

                      {request.status !== 'pending' && request.status !== 'rejected' && (
                        <button
                          onClick={() => handlePriceAdjustment(request)}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          💰 Ajuster prix
                        </button>
                      )}

                      {request.invoiceNumber && (
                        <button
                          onClick={() => handleViewInvoice(request)}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                        >
                          📄 Facture
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('view');
                          setShowActionModal(true);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        👁️ Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'action */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === 'accept' && 'Accepter la demande'}
                {actionType === 'reject' && 'Refuser la demande'}
                {actionType === 'updateStatus' && 'Mettre à jour le statut'}
                {actionType === 'view' && 'Détails de la demande'}
              </h3>

              {actionType === 'view' ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Client</p>
                    <p className="text-sm text-gray-900">{selectedRequest.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Destination</p>
                    <p className="text-sm text-gray-900">{selectedRequest.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-900">{selectedRequest.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Prix</p>
                    <p className="text-sm text-gray-900">{formatPrice(selectedRequest.finalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Statut</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleActionSubmit} className="space-y-4">
                  {actionType === 'accept' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notes (optionnel)
                      </label>
                      <textarea
                        value={actionData.notes}
                        onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        rows="3"
                        placeholder="Notes sur cette demande..."
                      />
                    </div>
                  )}

                  {actionType === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Motif du refus *
                      </label>
                      <textarea
                        value={actionData.rejectionReason}
                        onChange={(e) => setActionData({ ...actionData, rejectionReason: e.target.value })}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        rows="3"
                        placeholder="Expliquez pourquoi cette demande est refusée..."
                      />
                    </div>
                  )}

                  {actionType === 'updateStatus' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nouveau statut
                      </label>
                      <select
                        value={actionData.status || ''}
                        onChange={(e) => setActionData({ ...actionData, status: e.target.value })}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Sélectionner un statut</option>
                        {getNextStatus(selectedRequest.status).map(status => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(actionType === 'accept' || actionType === 'updateStatus') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notes (optionnel)
                      </label>
                      <textarea
                        value={actionData.notes}
                        onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        rows="2"
                        placeholder="Notes sur cette mise à jour..."
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionModal(false);
                        setSelectedRequest(null);
                        setActionData({ notes: '', rejectionReason: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    {actionType !== 'view' && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                      >
                        {loading ? 'Enregistrement...' : 'Confirmer'}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajustement de prix */}
      {showPriceModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ajuster le prix - Demande #{selectedRequest.id}
              </h3>

              <form onSubmit={handlePriceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prix actuel
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatPrice(selectedRequest.finalPrice)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nouveau prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={priceData.newPrice}
                    onChange={(e) => setPriceData({ ...priceData, newPrice: e.target.value })}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nouveau prix"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Raison de l'ajustement (optionnel)
                  </label>
                  <textarea
                    value={priceData.reason}
                    onChange={(e) => setPriceData({ ...priceData, reason: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                    placeholder="Ex: Poids réel différent, dimensions supplémentaires..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPriceModal(false);
                      setSelectedRequest(null);
                      setPriceData({ newPrice: '', reason: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {loading ? 'Ajustement...' : 'Ajuster le prix'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de facture */}
      {showInvoiceModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Facture - {selectedRequest.invoiceNumber}
                </h3>
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const invoice = generateInvoice(selectedRequest.id);
                if (!invoice) return <p>Erreur lors de la génération de la facture</p>;

                return (
                  <div className="space-y-6">
                    {/* En-tête */}
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-lg font-bold">Agence Partenaire</h4>
                        <p className="text-sm text-gray-600">Facture #{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">Date: {formatDate(invoice.date)}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="font-medium">Client</h4>
                        <p className="text-sm">{invoice.client.name}</p>
                        <p className="text-sm text-gray-600">{invoice.client.email}</p>
                        <p className="text-sm text-gray-600">{invoice.client.phone}</p>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium mb-3">Détails de l'expédition</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Description</p>
                            <p className="font-medium">{invoice.items[0].description}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Destination</p>
                            <p className="font-medium">{invoice.items[0].destination}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Poids</p>
                            <p className="font-medium">{invoice.items[0].weight} kg</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dimensions</p>
                            <p className="font-medium">{invoice.items[0].dimensions}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions spéciales */}
                    {invoice.specialInstructions && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Instructions spéciales</h4>
                        <p className="text-sm text-yellow-700">{invoice.specialInstructions}</p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(invoice.total)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          // Ici on pourrait ajouter la logique d'envoi par email
                          alert('Fonctionnalité d\'envoi en cours de développement');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        📧 Envoyer par email
                      </button>
                      <button
                        onClick={() => {
                          // Ici on pourrait ajouter la logique de téléchargement PDF
                          alert('Fonctionnalité de téléchargement en cours de développement');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        📄 Télécharger PDF
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Requests;
