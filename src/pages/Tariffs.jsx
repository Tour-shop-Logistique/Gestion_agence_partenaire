import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTariffs } from '../contexts/TariffContext';
import DashboardLayout from '../components/DashboardLayout';

const Tariffs = () => {
  const { currentUser, isAdmin } = useAuth();
  const { 
    getTariffsByAgency,
    createTariff,
    updateTariff,
    deleteTariff,
    toggleTariffStatus,
    getWeightRanges,
    formatPrice
  } = useTariffs();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);
  const [formData, setFormData] = useState({
    destination: '',
    weightRange: '',
    price: '',
    deliveryTime: '',
    currency: 'XOF'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tariffs = getTariffsByAgency(currentUser?.id);
  const weightRanges = getWeightRanges();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const tariffData = {
        ...formData,
        price: parseInt(formData.price),
        agencyId: currentUser.id
      };

      if (editingTariff) {
        const result = await updateTariff(editingTariff.id, tariffData);
        setMessage(result.message);
        if (result.success) {
          setEditingTariff(null);
          resetForm();
        }
      } else {
        const result = await createTariff(tariffData);
        setMessage(result.message);
        if (result.success) {
          setShowAddForm(false);
          resetForm();
        }
      }
    } catch (error) {
      setMessage('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tariff) => {
    setEditingTariff(tariff);
    setFormData({
      destination: tariff.destination,
      weightRange: tariff.weightRange,
      price: tariff.price.toString(),
      deliveryTime: tariff.deliveryTime,
      currency: tariff.currency
    });
    setShowAddForm(true);
  };

  const handleDelete = async (tariffId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
      setLoading(true);
      try {
        const result = await deleteTariff(tariffId);
        setMessage(result.message);
      } catch (error) {
        setMessage('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (tariffId) => {
    setLoading(true);
    try {
      const result = await toggleTariffStatus(tariffId);
      setMessage(result.message);
    } catch (error) {
      setMessage('Erreur lors de la modification du statut');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      weightRange: '',
      price: '',
      deliveryTime: '',
      currency: 'XOF'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      {/* Titre de la page */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des tarifs</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin() 
                ? 'Configurez les tarifs d\'expédition pour votre agence'
                : 'Consultez les tarifs d\'expédition disponibles'
              }
            </p>
          </div>
          {isAdmin() && (
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingTariff(null);
                resetForm();
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Ajouter un tarif
            </button>
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

      {/* Add/Edit Form */}
      {showAddForm && isAdmin() && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {editingTariff ? 'Modifier le tarif' : 'Ajouter un nouveau tarif'}
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                    Destination *
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: France, Canada, États-Unis"
                  />
                </div>

                <div>
                  <label htmlFor="weightRange" className="block text-sm font-medium text-gray-700">
                    Plage de poids *
                  </label>
                  <select
                    id="weightRange"
                    name="weightRange"
                    value={formData.weightRange}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner une plage</option>
                    {weightRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                    Délai de livraison *
                  </label>
                  <input
                    type="text"
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: 3-5 jours"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Devise
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="XOF">FCFA (XOF)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar US (USD)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTariff(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : (editingTariff ? 'Mettre à jour' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tarifs List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tarifs d'expédition ({tariffs.length})
          </h3>
        </div>
        <div className="p-6">
          {tariffs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun tarif</h3>
              <p className="text-gray-600 mb-4">
                {isAdmin() 
                  ? 'Commencez par ajouter votre premier tarif d\'expédition.'
                  : 'Aucun tarif disponible pour le moment.'
                }
              </p>
              {isAdmin() && (
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingTariff(null);
                    resetForm();
                  }}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + Ajouter un tarif
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poids
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Délai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    {isAdmin() && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tariffs.map((tariff) => (
                    <tr key={tariff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tariff.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tariff.weightRange}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(tariff.price, tariff.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tariff.deliveryTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tariff.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tariff.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      {isAdmin() && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(tariff)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => handleToggleStatus(tariff.id)}
                              className={`${
                                tariff.isActive 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {tariff.isActive ? '🚫 Désactiver' : '✅ Activer'}
                            </button>
                            <button
                              onClick={() => handleDelete(tariff.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques des tarifs */}
      {tariffs.length > 0 && (
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Statistiques des tarifs</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tariffs.length}</div>
                <div className="text-sm text-gray-600">Total tarifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tariffs.filter(t => t.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Tarifs actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {[...new Set(tariffs.map(t => t.destination))].length}
                </div>
                <div className="text-sm text-gray-600">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPrice(tariffs.reduce((sum, t) => sum + t.price, 0))}
                </div>
                <div className="text-sm text-gray-600">Prix moyen</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Tariffs;
