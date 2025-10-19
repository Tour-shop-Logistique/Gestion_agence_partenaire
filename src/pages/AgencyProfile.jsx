import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import logo from '../assets/logo_blanc_shop.jpg';
import { apiService } from '../utils/api';

const AgencyProfile = () => {
  const { currentUser, isAdmin, agencyData, getAgencyShow } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(!agencyData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [agency, setAgency] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    ville: '',
    pays: 'Côte d\'Ivoire',
    telephone: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
    businessHours: '',
    description: '',
    commune: '',
    services: [],
    horaires: [
      { jour: 'lundi', ouverture: '08:00', fermeture: '18:00', ferme: false },
      { jour: 'mardi', ouverture: '08:00', fermeture: '18:00', ferme: false },
      { jour: 'mercredi', ouverture: '08:00', fermeture: '18:00', ferme: false },
      { jour: 'jeudi', ouverture: '08:00', fermeture: '18:00', ferme: false },
      { jour: 'vendredi', ouverture: '08:00', fermeture: '18:00', ferme: false },
      { jour: 'samedi', ouverture: '08:00', fermeture: '12:00', ferme: false },
    ]
  });

  // Charger et mettre à jour les données du formulaire quand les données de l'agence changent
  useEffect(() => {
    console.log('agencyData mis à jour:', agencyData);
    
    // S'assurer que le mode édition est désactivé au chargement
    setIsEditing(true);
    console.log('isEditing mis à jour:', isEditing);
    
    const updateFormData = () => {
      if (!agencyData) return;
      
      console.log('Mise à jour du formulaire avec les données de l\'agence:', agencyData);
      setLoading(false);
      
      // Créer un nouvel objet formData avec les valeurs par défaut
      const newFormData = {
        name: '',
        address: '',
        ville: '',
        pays: 'Côte d\'Ivoire',
        telephone: '',
        email: '',
        website: '',
        description: '',
        commune: '',
        latitude: '',
        longitude: '',
        services: [],
        horaires: [
          { jour: 'lundi', ouverture: '08:00', fermeture: '18:00', ferme: false },
          { jour: 'mardi', ouverture: '08:00', fermeture: '18:00', ferme: false },
          { jour: 'mercredi', ouverture: '08:00', fermeture: '18:00', ferme: false },
          { jour: 'jeudi', ouverture: '08:00', fermeture: '18:00', ferme: false },
          { jour: 'vendredi', ouverture: '08:00', fermeture: '18:00', ferme: false },
          { jour: 'samedi', ouverture: '08:00', fermeture: '12:00', ferme: false }
        ]
      };
      
      // Mettre à jour avec les données de l'agence
      if (agencyData.nom_agence) newFormData.name = agencyData.nom_agence;
      if (agencyData.adresse) newFormData.address = agencyData.adresse;
      if (agencyData.ville) newFormData.ville = agencyData.ville;
      if (agencyData.pays) newFormData.pays = agencyData.pays;
      if (agencyData.telephone) newFormData.telephone = agencyData.telephone;
      if (agencyData.email) newFormData.email = agencyData.email;
      if (agencyData.website) newFormData.website = agencyData.website;
      if (agencyData.description) newFormData.description = agencyData.description;
      if (agencyData.commune) newFormData.commune = agencyData.commune;
      
      // Gérer les coordonnées GPS
      if (agencyData.latitude !== undefined && agencyData.latitude !== null) {
        newFormData.latitude = String(agencyData.latitude);
      }
      if (agencyData.longitude !== undefined && agencyData.longitude !== null) {
        newFormData.longitude = String(agencyData.longitude);
      }
      
      // Gérer les services
      if (Array.isArray(agencyData.services) && agencyData.services.length > 0) {
        newFormData.services = [...agencyData.services];
      }
      
      // Gérer les horaires
      if (Array.isArray(agencyData.horaires) && agencyData.horaires.length > 0) {
        // Créer un objet pour faciliter la recherche par jour
        const horairesMap = {};
        agencyData.horaires.forEach(h => {
          if (h.jour) horairesMap[h.jour] = h;
        });
        
        // Mettre à jour les horaires existants avec les données de l'API
        newFormData.horaires = newFormData.horaires.map(horaire => {
          const updatedHoraire = horairesMap[horaire.jour];
          if (updatedHoraire) {
            return {
              ...horaire,
              ouverture: updatedHoraire.ouverture || horaire.ouverture,
              fermeture: updatedHoraire.fermeture || horaire.fermeture,
              ferme: updatedHoraire.ferme !== undefined ? updatedHoraire.ferme : horaire.ferme
            };
          }
          return horaire;
        });
      }
      
      console.log('Nouvelles données du formulaire:', newFormData);
      setFormData(newFormData);
      
      // Autoriser l'édition uniquement si admin
      setIsEditing(isAdmin && typeof isAdmin === 'function' ? isAdmin() : false);
    };
    
    const fetchAgencyData = async () => {
      if (!currentUser) return;
      
      try {
        console.log('Chargement des données de l\'agence depuis l\'API...');
        const data = await getAgencyShow();
        console.log('Données récupérées de l\'API:', data);
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'agence:', error);
        setMessage({ 
          type: 'error', 
          text: 'Erreur lors du chargement des données de l\'agence' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (agencyData && Object.keys(agencyData).length > 0) {
      updateFormData();
    } else if (currentUser) {
      fetchAgencyData();
    }
  }, [agencyData, currentUser, isAdmin, getAgencyShow]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleHoraireChange = (index, field, value) => {
    const newHoraires = [...formData.horaires];
    newHoraires[index] = { ...newHoraires[index], [field]: value };
    setFormData(prev => ({ ...prev, horaires: newHoraires }));
  };




  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setMessage({ type: 'info', text: 'Récupération de votre position...' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setMessage({ type: 'success', text: 'Localisation récupérée avec succès !' });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setMessage({ 
            type: 'error', 
            text: 'Impossible de récupérer la localisation. Veuillez activer la géolocalisation dans les paramètres de votre navigateur.' 
          });
        }
      );
    } else {
      setMessage({ 
        type: 'error', 
        text: 'La géolocalisation n\'est pas supportée par votre navigateur.' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Empêcher toute sauvegarde par un non-admin
    if (!(isAdmin && typeof isAdmin === 'function' && isAdmin())) {
      setMessage({ type: 'error', text: 'Vous n\'avez pas les droits pour modifier le profil agence.' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Construire la structure horaires par défaut si aucune structure détaillée
      const defaultHoraires = [
        { jour: 'lundi',     ouverture: '08:00', fermeture: '18:00', ferme: false },
        { jour: 'mardi',     ouverture: '08:00', fermeture: '18:00', ferme: false },
        { jour: 'mercredi',  ouverture: '08:00', fermeture: '18:00', ferme: false },
        { jour: 'jeudi',     ouverture: '08:00', fermeture: '18:00', ferme: false },
        { jour: 'vendredi',  ouverture: '08:00', fermeture: '18:00', ferme: false },
        { jour: 'samedi',    ouverture: '08:00', fermeture: '12:00', ferme: false },
      ];

      // Préparer le payload exact attendu par /api/agence/setup
      const agencyPayload = {
        nom_agence: formData.name,
        telephone: formData.telephone,
        description: formData.description,
        adresse: formData.address,
        ville: formData.ville,
        commune: formData.commune,
        pays: formData.pays,
        latitude: formData.latitude === '' ? null : parseFloat(formData.latitude),
        longitude: formData.longitude === '' ? null : parseFloat(formData.longitude),
        horaires: Array.isArray(formData.horaires) && formData.horaires.length ? formData.horaires : defaultHoraires,
      };

      // Si une agence existe déjà, effectuer une mise à jour, sinon configuration initiale
      const shouldUpdate = !!(agency && (agency.id || agency.agence_id || agency.code || agency.nom_agence));
      const result = shouldUpdate
        ? await apiService.updateAgency(agencyPayload)
        : await apiService.setupAgency(agencyPayload);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || (shouldUpdate ? 'Agence mise à jour avec succès !' : 'Agence configurée avec succès !') });
        setIsEditing(false);
        if (result.data?.agence) {
          setAgency(result.data.agence);
        }
      } else {
        throw new Error(result.message || 'Erreur lors de la configuration de l\'agence');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }
  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler les modifications
      setIsEditing(false);
    } else {
      // Préparer les données du formulaire pour l'édition
      setFormData({
        name: agency?.nom_agence || agency?.name || '',
        telephone: agency?.telephone || '',
        email: agency?.email || '',
        description: agency?.description || '',
        address: agency?.adresse || agency?.address || '',
        ville: agency?.ville || '',
        commune: agency?.commune || '',
        pays: agency?.pays || 'Côte d\'Ivoire',
        latitude: agency?.latitude?.toString() || '',
        longitude: agency?.longitude?.toString() || '',
        horaires: Array.isArray(agency?.horaires) && agency.horaires.length > 0 
          ? [...agency.horaires]
          : [
              { jour: 'lundi', ouverture: '08:00', fermeture: '18:00', ferme: false },
              { jour: 'mardi', ouverture: '08:00', fermeture: '18:00', ferme: false },
              { jour: 'mercredi', ouverture: '08:00', fermeture: '18:00', ferme: false },
              { jour: 'jeudi', ouverture: '08:00', fermeture: '18:00', ferme: false },
              { jour: 'vendredi', ouverture: '08:00', fermeture: '18:00', ferme: false },
              { jour: 'samedi', ouverture: '08:00', fermeture: '12:00', ferme: false },
            ],
      });
      setIsEditing(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profil de l'agence</h1>
          {isAdmin && (
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isEditing 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isEditing ? 'Annuler' : 'Modifier le profil'}
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          {/* En-tête avec logo */}
          <div className="bg-gradient-to-r from-secondary-700 to-secondary-900 px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <img 
                  src={logo} 
                  alt="Logo TousShop" 
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <h1 className="text-2xl font-bold text-white">
                  Profil de l'Agence
                </h1>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`mx-6 mt-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'agence *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
                  disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commune *
                </label>
                <input
                  type="text"
                  name="commune"
                  value={formData.commune}
                  onChange={handleInputChange}
                  disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  name="pays"
                  value={formData.pays}
                  onChange={handleInputChange}
                  disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Localisation GPS
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                    className="text-xs bg-primary-100 text-primary-800 px-3 py-1.5 rounded-md hover:bg-primary-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Utiliser ma position actuelle</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                      placeholder="Ex: 5.3541"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                      placeholder="Ex: -4.0083"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>
            </div>

            {/* Horaires d'ouverture */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Horaires d'ouverture</h3>
              <div className="space-y-4">
                {formData.horaires.map((horaire, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-2 font-medium text-gray-700">
                      {horaire.jour.charAt(0).toUpperCase() + horaire.jour.slice(1)}
                    </div>
                    <div className="col-span-5 sm:col-span-4">
                      <label className="block text-xs text-gray-500 mb-1">Ouverture</label>
                      <input
                        type="time"
                        value={horaire.ouverture}
                        onChange={(e) => handleHoraireChange(index, 'ouverture', e.target.value)}
                        disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-4">
                      <label className="block text-xs text-gray-500 mb-1">Fermeture</label>
                      <input
                        type="time"
                        value={horaire.fermeture}
                        onChange={(e) => handleHoraireChange(index, 'fermeture', e.target.value)}
                        disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2 flex justify-center">
                      <div className="flex items-center h-5">
                        <input
                          id={`closed-${index}`}
                          name={`closed-${index}`}
                          type="checkbox"
                          checked={horaire.ferme}
                          onChange={(e) => handleHoraireChange(index, 'ferme', e.target.checked)}
                          disabled={!(typeof isAdmin === "function" ? isAdmin() : isAdmin) || !isEditing}

                          className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`closed-${index}`} className="ml-2 block text-sm text-gray-700">
                          Fermé
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 disabled:opacity-50 transition-colors duration-200"
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgencyProfile;
