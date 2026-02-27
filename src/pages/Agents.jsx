import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import DashboardLayout from "../components/DashboardLayout";
import AgentCardMobile from "../components/AgentCardMobile";
import AgentCardDesktop from "../components/AgentCardDesktop";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "../utils/toast";

const Agents = () => {
  const { isAdmin } = useAuth();
  const {
    users: agencyUsers,
    fetchUsers,
    createUser,
    editUser,
    deleteUser,
    toggleUserStatus,
    usersStatus: usersStatus,
  } = useAgency();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    email: "",
    phone: "",
    password: "",
    type: "agence",
  });
  const [loading, setLoading] = useState(false);
  const [updatingAgent, setUpdatingAgent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  // Toggle agent active status
  const handleToggleStatus = async (agent) => {
    if (!agent?.id) return;

    setUpdatingAgent(agent.id);

    try {
      const result = await toggleUserStatus(agent.id);
      if (result.payload.success) {
        toast.success(`Agent ${!agent.actif ? "activé" : "désactivé"} avec succès`);
      } else {
        throw new Error(
          result.error || "Erreur lors de la mise à jour du statut"
        );
      }
    } catch (error) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setUpdatingAgent(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (editingAgent) {
        const payload = {
          nom: (formData.nom || "").trim(),
          prenoms: (formData.prenoms || "").trim(),
          telephone: formData.phone || "",
          email: formData.email || "",
          type: formData.type || "agence",
          ...(formData.password ? { password: formData.password } : {}),
        };

        const result = await editUser(editingAgent.id, payload);

        if (result.payload.success) {
          await fetchUsers();
          toast.success("Agent mis à jour avec succès");
          closeModal();
        } else {
          closeModal();
          throw new Error(result.error || "Erreur lors de la mise à jour");
        }
      } else {
        const payload = {
          nom: (formData.nom || "").trim(),
          prenoms: (formData.prenoms || "").trim(),
          telephone: formData.phone || "",
          email: formData.email || "",
          password: formData.password || "123456",
          password_confirmation: formData.password || "123456",
          type: formData.type || "agence",
        };

        const result = await createUser(payload);

        if (result.payload.success) {
          await fetchUsers();
          toast.success("Agent créé avec succès");
          closeModal();
        } else {
          closeModal();
          throw new Error(result.error || "Erreur lors de la création");
        }
      }
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agent) => {
    console.log("Editing agent:", agent); // Debug log
    setEditingAgent(agent);
    setFormData({
      nom: agent.nom || "",
      prenoms: agent.prenoms || "",
      email: agent.email || "",
      phone: agent.telephone || "",
      type: agent.type || "agence",
      password: "",
    });
    setShowAddForm(true);
    document.body.style.overflow = "hidden";
  };

  const handleDelete = (agent) => {
    // Récupérer les informations complètes de l'agent depuis la liste
    const fullAgentInfo = agencyUsers.find((u) => u.id === agent.id);
    setAgentToDelete(fullAgentInfo || agent);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    setLoading(true);

    try {
      const result = await deleteUser(agentToDelete.id);

      if (result.payload.success) {
        toast.success(result.message || "Agent supprimé avec succès");
        setShowDeleteModal(false);
        await fetchUsers();
      } else {
        throw new Error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
      setAgentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAgentToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenoms: "",
      email: "",
      phone: "",
      type: "agence",
      password: "",
    });
  };

  const openAddModal = () => {
    setShowAddForm(true);
    setEditingAgent(null);
    resetForm();
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowAddForm(false);
    setEditingAgent(null);
    resetForm();
    document.body.style.overflow = "auto";
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
      toast.info("Liste des agents actualisée");
    } catch (error) {
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Gestion des agents
            </h1>
            <p className="text-gray-600 mt-1 text-md">
              Administrez votre équipe d'agents
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center disabled:opacity-50 transition-colors"
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
                    className="w-4 h-4 mr-2"
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
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Ajouter un agent
            </button>
          </div>
        </div>
      </div>

      {/* Section statistiques améliorée - mobile-first */}
      {agencyUsers && agencyUsers.length > 0 && (
        <div className="mb-6 sm:mb-8">
          {/* Résumé rapide - responsive */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm sm:text-md text-gray-600 font-medium">
                    Total: {agencyUsers.length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm sm:text-md text-gray-600 font-medium">
                    Actifs: {agencyUsers.filter((a) => a.actif).length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm sm:text-md text-gray-600 font-medium">
                    Inactifs: {agencyUsers.filter((a) => !a.actif).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Liste des agents - Design responsive : lignes sur desktop, cards sur mobile */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
        {usersStatus === "loading" && (!agencyUsers || agencyUsers.length === 0) ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        ) : agencyUsers && agencyUsers.length > 0 ? (
          <>
            <AgentCardDesktop
              agencyUsers={agencyUsers}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleToggleStatus={handleToggleStatus}
              updatingAgent={updatingAgent}
              loading={loading}
            />
            <AgentCardMobile
              agents={agencyUsers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              updatingAgent={updatingAgent}
              loading={loading}
            />
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Aucun agent trouvé
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Commencez par ajouter des agents à votre équipe pour gérer
              efficacement vos opérations et améliorer votre service client.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Ajouter un agent
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay avec blur - mobile-first */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            ></div>

            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block w-full max-w-2xl mx-4 sm:mx-auto transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">
              <form onSubmit={handleSubmit}>
                {/* Header avec gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {editingAgent
                            ? `Modifier ${editingAgent.nom} ${editingAgent.prenoms}`
                            : "Ajouter un nouvel agent"}
                        </h3>
                        <p className="text-blue-100 text-xs">
                          {editingAgent
                            ? "Mettez à jour les informations de cet agent"
                            : "Créez un nouveau compte agent"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-1.5 bg-white/20 text-white hover:bg-white/30 transition-colors"
                      onClick={closeModal}
                    >
                      <span className="sr-only">Fermer</span>
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Body du formulaire */}
                <div className="px-6 py-4 space-y-4">
                  {/* Section informations personnelles */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      <h4 className="text-lg font-medium text-gray-900">
                        Informations personnelles
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="nom"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Entrez le nom"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="prenoms"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Prénoms <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="prenoms"
                          name="prenoms"
                          value={formData.prenoms}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                          placeholder="Entrez les prénoms"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section coordonnées */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                      <h4 className="text-lg font-medium text-gray-900">
                        Coordonnées
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="agent@email.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="+225 01 02 03 04 05"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section rôle et sécurité */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                      <h4 className="text-lg font-medium text-gray-900">
                        Sécurité
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {/* <div className="space-y-2">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                        >
                          <option value="agence">🏢 Agence</option>
                          <option value="manager">👔 Manager</option>
                          <option value="admin">👑 Administrateur</option>
                        </select>
                      </div> */}

                      <div className="space-y-2">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {editingAgent
                            ? "Nouveau mot de passe (optionnel)"
                            : "Mot de passe"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!editingAgent}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            placeholder={
                              editingAgent
                                ? "Laisser vide pour ne pas changer"
                                : "••••••••"
                            }
                          />
                        </div>
                        {!editingAgent && (
                          <p className="text-xs text-gray-500">
                            Minimum 6 caractères
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer avec boutons */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={() => console.log("Button clicked")}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {loading ? (
                      <span className="flex items-center">
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
                        Enregistrement...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        {editingAgent ? (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
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
                            Mettre à jour l'agent
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Enregistrer l'agent
                          </>
                        )}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={cancelDelete}
            ></div>
            <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transition-all font-sans">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                Supprimer l'agent ?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-bold text-gray-900">
                  {agentToDelete?.nom} {agentToDelete?.prenoms}
                </span>{" "}
                ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Agents;
