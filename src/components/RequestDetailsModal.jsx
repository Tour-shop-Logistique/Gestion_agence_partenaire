import React, { useState } from 'react';
import { formatPrice } from '../utils/api';
import Button from './Button';
import Select from './Select';
import { packageStatuses } from '../data/mockData';

const RequestDetailsModal = ({ request, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.notes || '');

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

  const handleStatusUpdate = () => {
    if (newStatus !== request.status) {
      onStatusUpdate(newStatus, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de la demande
              </h2>
              <p className="text-gray-600 mt-1">
                Demande #{request.id} - {request.clientName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations client */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👤 Informations client
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Nom:</span>
                    <span className="ml-2 text-gray-900">{request.clientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{request.clientEmail}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Téléphone:</span>
                    <span className="ml-2 text-gray-900">{request.clientPhone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📦 Détails du colis
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Poids:</span>
                    <span className="ml-2 text-gray-900">{request.packageDetails.weight}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <span className="ml-2 text-gray-900">{request.packageDetails.dimensions}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <span className="ml-2 text-gray-900">{request.packageDetails.description}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Valeur déclarée:</span>
                    <span className="ml-2 text-gray-900">
                      {formatPrice(request.packageDetails.declaredValue, request.packageDetails.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations expédition */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚚 Informations d'expédition
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Destination:</span>
                    <span className="ml-2 text-gray-900">{request.destination}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date de demande:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Livraison estimée:</span>
                    <span className="ml-2 text-gray-900">{request.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Prix original:</span>
                    <span className="ml-2 text-gray-900">{formatPrice(request.originalPrice)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Prix final:</span>
                    <span className="ml-2 text-gray-900 font-semibold text-green-600">
                      {formatPrice(request.finalPrice)}
                    </span>
                  </div>
                  {request.isUrgent && (
                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg">
                      🔥 Demande urgente
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📝 Statut et notes
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut actuel
                    </label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)} {request.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau statut
                    </label>
                    <Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      options={packageStatuses.map(status => ({ value: status, label: status }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ajoutez des notes sur cette demande..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des modifications */}
          {request.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Historique
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line">{request.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={newStatus === request.status && notes === (request.notes || '')}
            >
              Mettre à jour le statut
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
