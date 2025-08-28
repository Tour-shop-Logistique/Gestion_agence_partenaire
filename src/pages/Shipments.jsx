import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestContext';
import DashboardLayout from '../components/DashboardLayout';

const Shipments = () => {
  const { currentUser, isAgent } = useAuth();
  const { 
    getRequestsByAgent, 
    updateRequestStatus,
    getStatusLabel, 
    getStatusColor,
    getStatusIcon,
    getNextStatus
  } = useRequests();

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Obtenir les expéditions de l'agent (demandes acceptées et plus)
  const shipments = getRequestsByAgent(currentUser?.id).filter(
    request => ['accepted', 'pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(request.status)
  );

  // Statistiques des expéditions
  const shipmentStats = {
    total: shipments.length,
    accepted: shipments.filter(s => s.status === 'accepted').length,
    pickupInProgress: shipments.filter(s => s.status === 'pickup_in_progress').length,
    dropoffInProgress: shipments.filter(s => s.status === 'dropoff_in_progress').length,
    collected: shipments.filter(s => s.status === 'collected').length,
    registered: shipments.filter(s => s.status === 'registered').length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    deliveryInProgress: shipments.filter(s => s.status === 'delivery_in_progress').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    totalRevenue: shipments
      .filter(s => s.status === 'delivered')
      .reduce((sum, s) => sum + s.finalPrice, 0)
  };

  const handleUpdateStatus = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateData({ status: '', notes: '' });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateRequestStatus(
        selectedShipment.id, 
        updateData.status, 
        updateData.notes
      );

      if (result.success) {
        setMessage(result.message);
        setShowUpdateModal(false);
        setSelectedShipment(null);
        setUpdateData({ status: '', notes: '' });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
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

  if (!isAgent()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous devez être agent pour accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Titre de la page */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des expéditions</h1>
        <p className="text-gray-600 mt-2">Gérez et suivez vos expéditions en cours</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{shipmentStats.total}</div>
          <div className="text-sm text-gray-600">Total expéditions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{shipmentStats.accepted}</div>
          <div className="text-sm text-gray-600">Acceptées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{shipmentStats.collected}</div>
          <div className="text-sm text-gray-600">Collectées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">{shipmentStats.inTransit}</div>
          <div className="text-sm text-gray-600">En transit</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{shipmentStats.delivered}</div>
          <div className="text-sm text-gray-600">Livrées</div>
        </div>
      </div>

      {/* Liste des expéditions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Mes expéditions ({shipments.length})
          </h3>
        </div>
        <div className="p-6">
          {shipments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune expédition</h3>
              <p className="text-gray-600">Vous n'avez pas encore d'expéditions assignées.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getStatusIcon(shipment.status)}</span>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              Expédition #{shipment.id}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Client: {shipment.clientName}
                            </p>
                          </div>
                          {getUrgentBadge(shipment.isUrgent)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {getStatusLabel(shipment.status)}
                          </span>
                          {shipment.invoiceNumber && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📄 {shipment.invoiceNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Destination</p>
                          <p className="font-medium">{shipment.destination}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Poids & Dimensions</p>
                          <p className="font-medium">{shipment.weight} kg - {shipment.dimensions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Prix</p>
                          <p className="font-medium">{formatPrice(shipment.finalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date d'acceptation</p>
                          <p className="font-medium">{formatDate(shipment.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="text-sm">{shipment.description}</p>
                      </div>

                      {shipment.specialInstructions && (
                        <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800">Instructions spéciales</p>
                          <p className="text-sm text-yellow-700">{shipment.specialInstructions}</p>
                        </div>
                      )}

                      {shipment.notes && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Notes</p>
                          <p className="text-sm text-blue-700">{shipment.notes}</p>
                        </div>
                      )}

                      {/* Timeline du statut */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Progression</p>
                        <div className="flex items-center space-x-1 text-xs">
                          <div className={`w-2 h-2 rounded-full ${['accepted', 'pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Acceptée</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded">
                            <div className={`h-1 rounded ${['pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`} style={{ width: ['pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(shipment.status) ? '100%' : '0%' }}></div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${['pickup_in_progress', 'dropoff_in_progress', 'collected', 'registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Collectée</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded">
                            <div className={`h-1 rounded ${['registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`} style={{ width: ['registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(shipment.status) ? '100%' : '0%' }}></div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${['registered', 'in_transit', 'delivery_in_progress', 'delivered'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">En transit</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded">
                            <div className={`h-1 rounded ${['delivery_in_progress', 'delivered'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`} style={{ width: ['delivery_in_progress', 'delivered'].includes(shipment.status) ? '100%' : '0%' }}></div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${['delivery_in_progress', 'delivered'].includes(shipment.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Livrée</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col space-y-2">
                      {getNextStatus(shipment.status).length > 0 && (
                        <button
                          onClick={() => handleUpdateStatus(shipment)}
                          className="px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                        >
                          {shipment.status === 'accepted' && '🚚 Commencer enlèvement'}
                          {shipment.status === 'pickup_in_progress' && '📦 Marquer comme collectée'}
                          {shipment.status === 'dropoff_in_progress' && '📦 Marquer comme collectée'}
                          {shipment.status === 'collected' && '📋 Enregistrer'}
                          {shipment.status === 'registered' && '✈️ Marquer en transit'}
                          {shipment.status === 'in_transit' && '🚛 Commencer livraison'}
                          {shipment.status === 'delivery_in_progress' && '✅ Marquer comme livrée'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setUpdateData({ status: '', notes: '' });
                          setShowUpdateModal(true);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de mise à jour */}
      {showUpdateModal && selectedShipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Mettre à jour l'expédition #{selectedShipment.id}
              </h3>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nouveau statut
                  </label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner un statut</option>
                    {getNextStatus(selectedShipment.status).map(status => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                    {/* Permettre de revenir en arrière */}
                    {selectedShipment.status === 'pickup_in_progress' && (
                      <option value="accepted">Acceptée</option>
                    )}
                    {selectedShipment.status === 'collected' && (
                      <option value="pickup_in_progress">En cours d'enlèvement</option>
                    )}
                    {selectedShipment.status === 'registered' && (
                      <option value="collected">Collectée</option>
                    )}
                    {selectedShipment.status === 'in_transit' && (
                      <option value="registered">Enregistrée</option>
                    )}
                    {selectedShipment.status === 'delivery_in_progress' && (
                      <option value="in_transit">En transit</option>
                    )}
                    {selectedShipment.status === 'delivered' && (
                      <option value="delivery_in_progress">En cours de livraison</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                    placeholder="Notes sur cette mise à jour..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedShipment(null);
                      setUpdateData({ status: '', notes: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Shipments;
