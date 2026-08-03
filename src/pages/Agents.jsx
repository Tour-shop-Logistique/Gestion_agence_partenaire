import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { useAgency } from "../hooks/useAgency";
import AgentCardMobile from "../components/AgentCardMobile";
import AgentCardDesktop from "../components/AgentCardDesktop";
import { XMarkIcon, KeyIcon, UserGroupIcon, TrashIcon, PencilSquareIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Spinner from "../components/common/Spinner";
import { toast } from "../utils/toast";
import { fetchRoles, createRole, updateRole, deleteRole, selectRoles, selectRolesStatus } from "../store/slices/rolesSlice";
import { fetchAvailablePermissions, selectAvailablePermissions, selectPermissionsHasLoaded } from "../store/slices/permissionsSlice";
import PermissionMatrix from "../components/roles/PermissionMatrix";

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

  const dispatch = useDispatch();
  const roles = useSelector(selectRoles);
  const rolesStatus = useSelector(selectRolesStatus);
  const availablePermissions = useSelector(selectAvailablePermissions);
  const permissionsHasLoaded = useSelector(selectPermissionsHasLoaded);

  const [activeTab, setActiveTab] = useState("agents");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    email: "",
    phone: "",
    password: "",
    type: "agence",
    role_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [updatingAgent, setUpdatingAgent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  // Gestion des rôles
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ nom: "", description: "", permissions: [] });
  const [savingRole, setSavingRole] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deletingRole, setDeletingRole] = useState(false);
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [expandedRoleSearch, setExpandedRoleSearch] = useState("");
  const [updatingRoleAgent, setUpdatingRoleAgent] = useState(null);
  const [addAgentsRole, setAddAgentsRole] = useState(null);
  const [addAgentsSelection, setAddAgentsSelection] = useState([]);
  const [addAgentsSearch, setAddAgentsSearch] = useState("");
  const [isSubmittingAddAgents, setIsSubmittingAddAgents] = useState(false);

  useEffect(() => {
    if (rolesStatus === "idle") {
      dispatch(fetchRoles());
    }
  }, [dispatch, rolesStatus]);

  useEffect(() => {
    if (!permissionsHasLoaded) {
      dispatch(fetchAvailablePermissions());
    }
  }, [dispatch, permissionsHasLoaded]);

  const openAddRoleModal = () => {
    setEditingRole(null);
    setRoleFormData({ nom: "", description: "", permissions: [] });
    setShowRoleForm(true);
    document.body.style.overflow = "hidden";
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setRoleFormData({ nom: role.nom || "", description: role.description || "", permissions: role.permissions || [] });
    setShowRoleForm(true);
    document.body.style.overflow = "hidden";
  };

  const closeRoleModal = () => {
    setShowRoleForm(false);
    setEditingRole(null);
    setRoleFormData({ nom: "", description: "", permissions: [] });
    document.body.style.overflow = "auto";
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (!roleFormData.nom.trim()) {
      toast.error("Le nom du rôle est requis");
      return;
    }
    if (roleFormData.permissions.length === 0) {
      toast.error("Sélectionnez au moins une permission");
      return;
    }

    setSavingRole(true);
    try {
      if (editingRole) {
        const result = await dispatch(updateRole({ id: editingRole.id, data: roleFormData }));
        if (result.error) throw new Error(result.payload || "Erreur lors de la modification du rôle");
        toast.success("Rôle mis à jour avec succès");
      } else {
        const result = await dispatch(createRole(roleFormData));
        if (result.error) throw new Error(result.payload || "Erreur lors de la création du rôle");
        toast.success("Rôle créé avec succès");
      }
      closeRoleModal();
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setSavingRole(false);
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    setDeletingRole(true);
    try {
      const result = await dispatch(deleteRole(roleToDelete.id));
      if (result.error) throw new Error(result.payload || "Erreur lors de la suppression du rôle");
      toast.success("Rôle supprimé avec succès");
      setRoleToDelete(null);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setDeletingRole(false);
    }
  };

  // Retrait immédiat depuis la carte dépliée d'un rôle (décocher un agent
  // déjà assigné le remet sans rôle - accès complet par défaut).
  const removeAgentFromRole = async (agent, role) => {
    setUpdatingRoleAgent(agent.id);
    try {
      const result = await editUser(agent.id, { role_id: null });
      if (!result.payload.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour de l'agent");
      }
      await fetchUsers();
      dispatch(fetchRoles());
      toast.success(`${agent.nom} ${agent.prenoms} retiré du rôle ${role.nom}.`);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la mise à jour de l'agent");
    } finally {
      setUpdatingRoleAgent(null);
    }
  };

  // ── Modal "Ajouter des agents" à un rôle ──
  const openAddAgentsModal = (role) => {
    setAddAgentsRole(role);
    setAddAgentsSelection([]);
    setAddAgentsSearch("");
  };

  const closeAddAgentsModal = () => {
    setAddAgentsRole(null);
    setAddAgentsSelection([]);
    setAddAgentsSearch("");
  };

  const toggleAddAgentsSelection = (agentId) => {
    setAddAgentsSelection((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const handleConfirmAddAgents = async () => {
    if (!addAgentsRole || addAgentsSelection.length === 0) return;
    setIsSubmittingAddAgents(true);
    try {
      const results = await Promise.all(
        addAgentsSelection.map((agentId) => editUser(agentId, { role_id: addAgentsRole.id }))
      );
      const failed = results.find((r) => !r.payload.success);
      if (failed) {
        throw new Error(failed.error || "Erreur lors de l'assignation des agents");
      }
      await fetchUsers();
      dispatch(fetchRoles());
      toast.success(
        `${addAgentsSelection.length} agent${addAgentsSelection.length > 1 ? "s" : ""} assigné${addAgentsSelection.length > 1 ? "s" : ""} au rôle ${addAgentsRole.nom}.`
      );
      closeAddAgentsModal();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'assignation des agents");
    } finally {
      setIsSubmittingAddAgents(false);
    }
  };

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

    try {
      if (editingAgent) {
        const payload = {
          nom: (formData.nom || "").trim(),
          prenoms: (formData.prenoms || "").trim(),
          telephone: formData.phone || "",
          email: formData.email || "",
          type: formData.type || "agence",
          role_id: formData.role_id || null,
          ...(formData.password ? { password: formData.password } : {}),
        };

        const result = await editUser(editingAgent.id, payload);

        if (result.payload.success) {
          await fetchUsers();
          dispatch(fetchRoles());
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
          role_id: formData.role_id || null,
        };

        const result = await createUser(payload);

        if (result.payload.success) {
          await fetchUsers();
          dispatch(fetchRoles());
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
    setEditingAgent(agent);
    setFormData({
      nom: agent.nom || "",
      prenoms: agent.prenoms || "",
      email: agent.email || "",
      phone: agent.telephone || "",
      type: agent.type || "agence",
      password: "",
      role_id: agent.role_id || "",
    });
    setShowAddForm(true);
    document.body.style.overflow = "hidden";
  };

  const handleDelete = (agent) => {
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
      role_id: "",
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Accès refusé
        </h1>
        <p className="text-gray-600">
          Vous devez être administrateur pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 sm:mb-6 px-3 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
              {activeTab === "agents" ? "Gestion des agents" : "Rôles & Permissions"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {activeTab === "agents"
                ? "Administrez votre équipe d'agents"
                : "Définissez les pages accessibles pour chaque rôle"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {activeTab === "agents" && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {refreshing ? (
                  <>
                    <Spinner size="sm" color="current" className="sm:mr-2" />
                    <span className="hidden sm:inline">Actualisation...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-2"
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
                    <span className="hidden sm:inline">Actualiser</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={activeTab === "agents" ? openAddModal : openAddRoleModal}
              className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-colors"
            >
              <svg
                className="w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-2"
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
              <span className="hidden sm:inline">
                {activeTab === "agents" ? "Ajouter un agent" : "Nouveau rôle"}
              </span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Onglets Agents / Rôles */}
        <div className="mt-4 flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1.5 w-fit shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("agents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "agents" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <UserGroupIcon className="w-3.5 h-3.5" />
            Agents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "roles" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <KeyIcon className="w-3.5 h-3.5" />
            Rôles
          </button>
        </div>
      </div>

      {/* Section statistiques - Responsive */}
      {activeTab === "agents" && agencyUsers && agencyUsers.length > 0 && (
        <div className="mb-4 sm:mb-6 px-3 sm:px-0">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  Total: {agencyUsers.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  Actifs: {agencyUsers.filter((a) => a.actif).length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  Inactifs: {agencyUsers.filter((a) => !a.actif).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Liste des agents - Design responsive */}
      {activeTab === "agents" && (
      <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden mx-3 sm:mx-0">
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
      )}

      {/* Liste des rôles - Design responsive */}
      {activeTab === "roles" && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden mx-3 sm:mx-0">
          {rolesStatus === "loading" && roles.length === 0 ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 bg-gray-50 rounded-lg" />
                ))}
              </div>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                <KeyIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun rôle créé</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                Créez un rôle pour restreindre l'accès de certains agents à des pages précises.
              </p>
              <button
                onClick={openAddRoleModal}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nouveau rôle
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {roles.map((role) => {
                const isExpanded = expandedRoleId === role.id;
                const roleAgents = (agencyUsers || []).filter((a) => a.role_id === role.id);
                const visibleRoleAgents = roleAgents.filter((a) => {
                  const term = expandedRoleSearch.trim().toLowerCase();
                  if (!term) return true;
                  return `${a.nom} ${a.prenoms} ${a.email}`.toLowerCase().includes(term);
                });

                return (
                  <div key={role.id}>
                    <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedRoleId(isExpanded ? null : role.id);
                          setExpandedRoleSearch("");
                        }}
                        className="min-w-0 flex-1 text-left flex items-start gap-3"
                      >
                        <ChevronDownIcon
                          className={`w-4 h-4 shrink-0 mt-1 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{role.nom}</p>
                            <span className="text-xs font-bold text-gray-400">
                              {roleAgents.length} agent{roleAgents.length > 1 ? "s" : ""}
                            </span>
                          </div>
                          {role.description && <p className="text-sm text-gray-500 mt-0.5">{role.description}</p>}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(
                              (role.permissions || []).reduce((acc, key) => {
                                const [resourceKey] = key.split(".");
                                const resource = availablePermissions.find((r) => r.key === resourceKey);
                                const label = resource?.label || resourceKey;
                                acc[label] = (acc[label] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([label, count]) => (
                              <span key={label} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600">
                                {label} ({count})
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditRoleModal(role)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRoleToDelete(role)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 pl-11 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                              type="text"
                              value={expandedRoleSearch}
                              onChange={(e) => setExpandedRoleSearch(e.target.value)}
                              placeholder="Rechercher parmi les agents de ce rôle..."
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => openAddAgentsModal(role)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Ajouter
                          </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100 bg-white">
                          {visibleRoleAgents.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">
                              {roleAgents.length === 0 ? "Aucun agent assigné à ce rôle." : "Aucun agent trouvé."}
                            </p>
                          )}
                          {visibleRoleAgents.map((agent) => {
                            const isUpdating = updatingRoleAgent === agent.id;
                            return (
                              <label
                                key={agent.id}
                                className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {isUpdating ? (
                                    <Spinner size="sm" className="shrink-0" />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked
                                      onChange={() => removeAgentFromRole(agent, role)}
                                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{agent.nom} {agent.prenoms}</p>
                                    <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

                  {/* Section rôle */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                      <h4 className="text-lg font-medium text-gray-900">Rôle</h4>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
                        Rôle attribué
                      </label>
                      <select
                        id="role_id"
                        name="role_id"
                        value={formData.role_id || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                      >
                        <option value="">Accès complet (aucun rôle)</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.nom}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Sans rôle, l'agent a accès à toutes les pages.</p>
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
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Spinner size="sm" color="white" className="-ml-1 mr-2" />
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
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Supprimer l'agent ?
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-bold text-gray-900">
                  {agentToDelete?.nom} {agentToDelete?.prenoms}
                </span>{" "}
                ? Cette action est irréversible.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout / Edition Rôle */}
      {showRoleForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={closeRoleModal}
            ></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block w-full max-w-2xl mx-4 sm:mx-auto transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">
              <form onSubmit={handleSubmitRole}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <KeyIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {editingRole ? `Modifier ${editingRole.nom}` : "Nouveau rôle"}
                        </h3>
                        <p className="text-blue-100 text-xs">
                          Définissez les pages accessibles pour ce rôle
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-1.5 bg-white/20 text-white hover:bg-white/30 transition-colors"
                      onClick={closeRoleModal}
                    >
                      <span className="sr-only">Fermer</span>
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="role_nom" className="block text-sm font-medium text-gray-700">
                      Nom du rôle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="role_nom"
                      value={roleFormData.nom}
                      onChange={(e) => setRoleFormData((p) => ({ ...p, nom: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Ex: Comptable"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role_description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="role_description"
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Description facultative du rôle..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Permissions <span className="text-red-500">*</span>
                    </label>
                    <PermissionMatrix
                      resources={availablePermissions}
                      value={roleFormData.permissions}
                      onChange={(next) => setRoleFormData((p) => ({ ...p, permissions: next }))}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
                  <button
                    type="button"
                    onClick={closeRoleModal}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingRole}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {savingRole ? (
                      <span className="flex items-center">
                        <Spinner size="sm" color="white" className="-ml-1 mr-2" />
                        Enregistrement...
                      </span>
                    ) : editingRole ? (
                      "Mettre à jour le rôle"
                    ) : (
                      "Enregistrer le rôle"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {roleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setRoleToDelete(null)}
            ></div>
            <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transition-all font-sans">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Supprimer le rôle ?
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-bold text-gray-900">{roleToDelete?.nom}</span>{" "}
                ? Les agents concernés retrouveront un accès complet.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setRoleToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteRole}
                  disabled={deletingRole}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletingRole ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter des agents à un rôle */}
      {addAgentsRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={closeAddAgentsModal}
            ></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block w-full max-w-lg mx-4 sm:mx-auto transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Ajouter des agents au rôle {addAgentsRole.nom}
                    </h3>
                    <p className="text-blue-100 text-xs">Cochez les agents à assigner à ce rôle</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-1.5 bg-white/20 text-white hover:bg-white/30 transition-colors"
                    onClick={closeAddAgentsModal}
                  >
                    <span className="sr-only">Fermer</span>
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    value={addAgentsSearch}
                    onChange={(e) => setAddAgentsSearch(e.target.value)}
                    placeholder="Rechercher un agent..."
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {(agencyUsers || [])
                    .filter((a) => a.role_id !== addAgentsRole.id)
                    .filter((a) => {
                      const term = addAgentsSearch.trim().toLowerCase();
                      if (!term) return true;
                      return `${a.nom} ${a.prenoms} ${a.email}`.toLowerCase().includes(term);
                    })
                    .map((agent) => {
                      const checked = addAgentsSelection.includes(agent.id);
                      return (
                        <label
                          key={agent.id}
                          className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAddAgentsSelection(agent.id)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{agent.nom} {agent.prenoms}</p>
                              <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                            </div>
                          </div>
                          {agent.role_id && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                              {agent.custom_role?.nom || "Autre rôle"}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  {(agencyUsers || []).filter((a) => a.role_id !== addAgentsRole.id).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Tous les agents sont déjà assignés à ce rôle.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
                <button
                  type="button"
                  onClick={closeAddAgentsModal}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddAgents}
                  disabled={isSubmittingAddAgents || addAgentsSelection.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmittingAddAgents
                    ? "Assignation..."
                    : `Assigner${addAgentsSelection.length > 0 ? ` (${addAgentsSelection.length})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Agents;
