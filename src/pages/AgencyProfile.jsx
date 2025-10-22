import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../components/DashboardLayout";
import { useAgency } from "../hooks/useAgency";
import { selectIsAdmin } from "../store/slices/authSlice";
import logo from "../assets/logo_transparent.png";

const AgencyProfile = () => {
  const {
    data: agencyData,
    status,
    error: agencyError,
    loading,
    fetchAgencyData,
    updateAgencyData,
    setupAgency,
  } = useAgency();

  const isAdmin = useSelector(selectIsAdmin);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    ville: "",
    pays: "Côte d'Ivoire",
    telephone: "",
    email: "",
    website: "",
    latitude: "",
    longitude: "",
    businessHours: "",
    description: "",
    commune: "",
    services: [],
    horaires: [
      { jour: "lundi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      { jour: "mardi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      {
        jour: "mercredi",
        ouverture: "08:00",
        fermeture: "18:00",
        ferme: false,
      },
      { jour: "jeudi", ouverture: "08:00", fermeture: "18:00", ferme: false },
      {
        jour: "vendredi",
        ouverture: "08:00",
        fermeture: "18:00",
        ferme: false,
      },
      { jour: "samedi", ouverture: "08:00", fermeture: "12:00", ferme: false },
    ],
  });

  // État pour stocker les données originales avant modification
  const [originalFormData, setOriginalFormData] = useState(null);


  // Mettre à jour le formulaire quand les données de l'agence changent
  useEffect(() => {
    if (agencyData && agencyData.agence) {
      const agence = agencyData.agence;
      const newFormData = { ...formData };

      if (agence.nom_agence) newFormData.name = agence.nom_agence;
      if (agence.adresse) newFormData.address = agence.adresse;
      if (agence.ville) newFormData.ville = agence.ville;
      if (agence.pays) newFormData.pays = agence.pays;
      if (agence.telephone) newFormData.telephone = agence.telephone;
      if (agence.email) newFormData.email = agence.email;
      if (agence.website) newFormData.website = agence.website;
      if (agence.description) newFormData.description = agence.description;
      if (agence.commune) newFormData.commune = agence.commune;

      // Gérer les coordonnées GPS
      if (agence.latitude !== undefined && agence.latitude !== null) {
        newFormData.latitude = String(agence.latitude);
      }
      if (agence.longitude !== undefined && agence.longitude !== null) {
        newFormData.longitude = String(agence.longitude);
      }

      // Gérer les horaires selon la structure API
      if (Array.isArray(agence.horaires) && agence.horaires.length > 0) {
        const horairesMap = {};
        agence.horaires.forEach((h) => {
          if (h.jour) horairesMap[h.jour] = h;
        });

        newFormData.horaires = newFormData.horaires.map((horaire) => {
          const updatedHoraire = horairesMap[horaire.jour];
          if (updatedHoraire) {
            return {
              ...horaire,
              ouverture: updatedHoraire.ouverture || horaire.ouverture,
              fermeture: updatedHoraire.fermeture || horaire.fermeture,
              ferme:
                updatedHoraire.ferme !== undefined
                  ? updatedHoraire.ferme
                  : horaire.ferme,
            };
          }
          return horaire;
        });
      }

      setFormData(newFormData);

      // Sauvegarder les données originales pour l'annulation
      if (!originalFormData && agencyData?.agence) {
        setOriginalFormData({ ...newFormData });
      }
    }
  }, [agencyData, originalFormData]);

  // Afficher les erreurs du hook
  useEffect(() => {
    if (agencyError) {
      setMessage({ type: "error", text: agencyError });
    }
  }, [agencyError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHoraireChange = (index, field, value) => {
    const newHoraires = [...formData.horaires];
    newHoraires[index] = { ...newHoraires[index], [field]: value };
    setFormData((prev) => ({ ...prev, horaires: newHoraires }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setMessage({ type: "info", text: "Récupération de votre position..." });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          setMessage({
            type: "success",
            text: "Localisation récupérée avec succès !",
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setMessage({
            type: "error",
            text: "Impossible de récupérer la localisation. Veuillez activer la géolocalisation dans les paramètres de votre navigateur.",
          });
        }
      );
    } else {
      setMessage({
        type: "error",
        text: "La géolocalisation n'est pas supportée par votre navigateur.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    // Empêcher toute sauvegarde par un non-admin
    if (!isAdmin) {
      setMessage({
        type: "error",
        text: "Vous n'avez pas les droits pour modifier le profil agence.",
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    console.log("Saving state set to true");

    try {
      // Construire la structure horaires par défaut si aucune structure détaillée
      const defaultHoraires = [
        { jour: "lundi", ouverture: "08:00", fermeture: "18:00", ferme: false },
        { jour: "mardi", ouverture: "08:00", fermeture: "18:00", ferme: false },
        {
          jour: "mercredi",
          ouverture: "08:00",
          fermeture: "18:00",
          ferme: false,
        },
        { jour: "jeudi", ouverture: "08:00", fermeture: "18:00", ferme: false },
        {
          jour: "vendredi",
          ouverture: "08:00",
          fermeture: "18:00",
          ferme: false,
        },
        {
          jour: "samedi",
          ouverture: "08:00",
          fermeture: "12:00",
          ferme: false,
        },
      ];

      // Préparer le payload
      const agencyPayload = {
        nom_agence: formData.name,
        telephone: formData.telephone,
        description: formData.description,
        adresse: formData.address,
        ville: formData.ville,
        commune: formData.commune,
        pays: formData.pays,
        latitude:
          formData.latitude === "" ? null : parseFloat(formData.latitude),
        longitude:
          formData.longitude === "" ? null : parseFloat(formData.longitude),
        horaires:
          Array.isArray(formData.horaires) && formData.horaires.length
            ? formData.horaires
            : defaultHoraires,
      };

      // Utiliser le hook pour mettre à jour l'agence
      // Si une agence existe déjà (avec un ID), effectuer une mise à jour, sinon configuration initiale
      const hasAgencyId = !!(
        agencyData?.agence?.id ||
        agencyData?.id ||
        agencyData?.agence_id
      );

      const result = hasAgencyId
        ? await updateAgencyData(agencyPayload)
        : await setupAgency(agencyPayload);

      if (result.type?.includes("fulfilled") || result.success) {
        setMessage({
          type: "success",
          text: hasAgencyId ? "Agence mise à jour avec succès !" : "Agence créée avec succès !",
        });
        setIsEditing(false);

        // Mettre à jour les données locales avec la réponse de l'API
        if (result.agence) {
          // Créer la structure attendue par le composant
          const updatedAgencyData = {
            agence: result.agence
          };

          // Mettre à jour le state local avec les nouvelles données
          setFormData(prevFormData => ({
            ...prevFormData,
            name: result.agence.nom_agence || prevFormData.name,
            address: result.agence.adresse || prevFormData.address,
            ville: result.agence.ville || prevFormData.ville,
            commune: result.agence.commune || prevFormData.commune,
            pays: result.agence.pays || prevFormData.pays,
            telephone: result.agence.telephone || prevFormData.telephone,
            description: result.agence.description || prevFormData.description,
            latitude: result.agence.latitude ? String(result.agence.latitude) : prevFormData.latitude,
            longitude: result.agence.longitude ? String(result.agence.longitude) : prevFormData.longitude,
            horaires: Array.isArray(result.agence.horaires) && result.agence.horaires.length > 0
              ? result.agence.horaires
              : prevFormData.horaires
          }));
        } else {
          // Recharger les données de l'agence si pas de données dans la réponse
          await fetchAgencyData();
        }
      } else {
        throw new Error(
          result.error?.message || result.message || "Erreur lors de la sauvegarde de l'agence"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: error.message || "Erreur lors de la sauvegarde",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler les modifications - restaurer les données originales
      if (originalFormData) {
        setFormData({ ...originalFormData });
      }
      setIsEditing(false);
      setMessage({ type: "", text: "" });
    } else {
      // Sauvegarder l'état actuel comme données originales avant modification
      setOriginalFormData({ ...formData });
      setIsEditing(true);
    }
  };

  // Ne pas afficher de loader au chargement initial, seulement au niveau du bouton d'actualisation

  return (
    <DashboardLayout>
      {/* Header avec titre et bouton d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Profil de l'agence
          </h1>
          <p className="text-gray-600  mt-1 sm:mt-2 text-md">
            Gérez les informations de votre agence
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center space-x-4">
            <button
              onClick={async () => {
                setRefreshing(true);
                try {
                  await fetchAgencyData();
                  setMessage({
                    type: "success",
                    text: "Données actualisées avec succès !",
                  });
                  setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                } catch (error) {
                  setMessage({
                    type: "error",
                    text: "Erreur lors de l'actualisation",
                  });
                  setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                } finally {
                  setRefreshing(false);
                }
              }}
              disabled={refreshing}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50"
              title="Actualiser les informations de l'agence"
            >
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Actualisation...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Actualiser
                </>
              )}
            </button>
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 ${
                isEditing
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              }`}
            >
              {isEditing ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Annuler
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Modifier le profil
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Message de notification */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {message.type === "success" && (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {message.type === "error" && (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {message.type === "info" && (
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Carte principale avec formulaire */}
      
        <form onSubmit={handleSubmit} className="p-4 space-y-2">
          {/* Section Informations générales */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-md overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Informations générales
            </h3>
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
                  disabled={!isAdmin || !isEditing}
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
                  disabled={!isAdmin || !isEditing}
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
                  disabled={!isAdmin || !isEditing}
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
                  disabled={!isAdmin || !isEditing}
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
                  disabled={!isAdmin || !isEditing}
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
                  disabled={!isAdmin || !isEditing}
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
                    disabled={!isAdmin || !isEditing}
                    className="text-xs bg-primary-100 text-primary-800 px-3 py-1.5 rounded-md hover:bg-primary-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Utiliser ma position actuelle</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      disabled={!isAdmin || !isEditing}
                      placeholder="Ex: 5.3541"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      disabled={!isAdmin || !isEditing}
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
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isAdmin || !isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:bg-gray-100 transition-colors"
                />
              </div>
            </div>
          </div>
          <div className="pb-4"/>

          {/* Section Horaires d'ouverture */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-md overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Horaires d'ouverture
            </h3>
            <div className="space-y-4">
              {formData.horaires.map((horaire, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="font-medium text-gray-900 flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          horaire.ferme ? "bg-red-500" : "bg-green-500"
                        }`}
                      ></div>
                      {horaire.jour.charAt(0).toUpperCase() +
                        horaire.jour.slice(1)}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs text-gray-500 font-medium">
                        Ouverture
                      </label>
                      <input
                        type="time"
                        value={horaire.ouverture}
                        onChange={(e) =>
                          handleHoraireChange(
                            index,
                            "ouverture",
                            e.target.value
                          )
                        }
                        disabled={!isAdmin || !isEditing || horaire.ferme}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-colors text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs text-gray-500 font-medium">
                        Fermeture
                      </label>
                      <input
                        type="time"
                        value={horaire.fermeture}
                        onChange={(e) =>
                          handleHoraireChange(
                            index,
                            "fermeture",
                            e.target.value
                          )
                        }
                        disabled={!isAdmin || !isEditing || horaire.ferme}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-colors text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={horaire.ferme}
                          onChange={(e) =>
                            handleHoraireChange(
                              index,
                              "ferme",
                              e.target.checked
                            )
                          }
                          disabled={!isAdmin || !isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 font-medium">
                          Fermé
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-0.5 mr-2 h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      
    </DashboardLayout>
  );
};

export default AgencyProfile;
