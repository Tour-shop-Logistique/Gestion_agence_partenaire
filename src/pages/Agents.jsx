import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { apiService } from '../utils/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Agents = () => {
  const { currentUser, agents, createAgent, updateAgent, deleteAgent, getAgentsByAgency, isAdmin } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    phone: '',
    password: '',
    role: 'agent'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [apiAgents, setApiAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [updatingAgent, setUpdatingAgent] = useState(null);

  const userAgents = getAgentsByAgency(currentUser?.id);
  const displayedAgents = (apiAgents && apiAgents.length) ? apiAgents : userAgents;

  // Toggle agent active status
  const toggleAgentStatus = async (agent) => {
    if (!agent?.id) return;
    
    setUpdatingAgent(agent.id);
    const newStatus = !agent.actif;
    
    try {
      const response = await apiService.request(
        `/agence/edit-user/${agent.id}`.replace(':user', agent.id),
        {
          method: 'PUT',
          body: JSON.stringify({ active: newStatus })
        }
      );

      if (response.success) {
        const updatedAgents = apiAgents.map(a => 
          a.id === agent.id ? { ...a, actif: newStatus } : a
        );
        setApiAgents(updatedAgents);
        setMessage(`Agent ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      setMessage(`Erreur: ${error.message}`);
    } finally {
      setUpdatingAgent(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const normalizeApiUsers = (data) => {
    const list = data?.users || data?.data || data;
    if (!Array.isArray(list)) return [];
    return list.map((u) => ({
      id: u.id || u.user_id || u._id || Math.random().toString(36).slice(2),
      name: u.name || [u.nom, u.prenoms].filter(Boolean).join(' ').trim() || u.email || 'Utilisateur',
      email: u.email || '',
      phone: u.telephone || u.phone || '',
      role: u.role || (u.is_agence_admin ? 'admin' : 'agent'),
      actif: typeof u.actif === 'boolean' ? u.actif : !!u.active,
      createdAt: u.created_at || u.createdAt || Date.now(),
    }));
  };

  const fetchAgentsFromApi = async () => {
    if (!(isAdmin && typeof isAdmin === 'function' && isAdmin())) return;
    setLoadingAgents(true);
    try {
      const res = await apiService.getAgencyUsers();
      if (res?.success && res.data) {
        setApiAgents(normalizeApiUsers(res.data));
      }
    } catch (e) {
      setMessage(e.message || 'Impossible de récupérer la liste des agents');
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    fetchAgentsFromApi();
  }, [isAdmin]);

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
      if (editingAgent) {
        const payload = {
          nom: (formData.nom || '').trim(),
          prenoms: (formData.prenoms || '').trim(),
          telephone: formData.phone || '',
          email: formData.email || '',
          ...(formData.password ? { password: formData.password } : {}),
        };
        const apiRes = await apiService.updateAgencyUser(editingAgent.id, payload);
        if (apiRes.success) {
          setMessage('Agent mis à jour avec succès');
          await fetchAgentsFromApi();
          closeModal();
        } else {
          throw new Error(apiRes.message || 'Erreur lors de la mise à jour');
        }
      } else {
        const payload = {
          nom: (formData.nom || '').trim(),
          prenoms: (formData.prenoms || '').trim(),
          telephone: formData.phone || '',
          email: formData.email || '',
          password: formData.password || '123456',
          password_confirmation: formData.password || '123456',
          role: formData.role || 'agent'
        };

        const apiRes = await apiService.createAgencyUser(payload);
        if (apiRes.success) {
          setMessage('Agent créé avec succès');
          await fetchAgentsFromApi();
          closeModal();
        } else {
          throw new Error(apiRes.message || 'Erreur lors de la création');
        }
      }
    } catch (error) {
      setMessage(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    const [nom, ...prenomsParts] = (agent.name || '').trim().split(' ');
    setFormData({
      nom: nom || '',
      prenoms: prenomsParts.join(' ').trim(),
      email: agent.email,
      phone: agent.phone,
      role: agent.role || 'agent',
      password: ''
    });
    openAddModal();
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      setLoading(true);
      try {
        const result = await deleteAgent(agentId);
        setMessage(result.message);
        await fetchAgentsFromApi();
      } catch (error) {
        setMessage('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenoms: '',
      email: '',
      phone: '',
      role: 'agent',
      password: ''
    });
  };

  const openAddModal = () => {
    setShowAddForm(true);
    setEditingAgent(null);
    resetForm();
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowAddForm(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const getStatusBadge = (agent) => {
    if (updatingAgent === agent.id) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-500 text-xs">Mise à jour...</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          agent.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {agent.actif ? 'Actif' : 'Inactif'}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={agent.actif} 
            onChange={() => toggleAgentStatus(agent)}
            className="sr-only peer"
            disabled={updatingAgent === agent.id}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    );
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'agent': 
      default: return 'Agent';
    }
  };

  if (!isAdmin()) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des agents</h1>
            <p className="text-gray-600 mt-2">Administrez votre équipe d'agents</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Ajouter un agent
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('succès') 
            ? 'bg-green-50 border border-green-200 text-green-600' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={closeModal}
            ></div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block w-full max-w-xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingAgent ? 'Modifier l\'agent' : 'Ajouter un nouvel agent'}
                    </h3>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={closeModal}
                    >
                      <span className="sr-only">Fermer</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                        Nom *
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Dupont"
                      />
                    </div>
                    <div>
                      <label htmlFor="prenoms" className="block text-sm font-medium text-gray-700">
                        Prénom(s) *
                      </label>
                      <input
                        type="text"
                        id="prenoms"
                        name="prenoms"
                        value={formData.prenoms}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Jean"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="jean.dupont@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="0612345678"
                      />
                    </div>
                  </div>

                 

                  {!editingAgent && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!editingAgent}
                        minLength={6}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                       
                      />
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : editingAgent ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Liste des agents ({displayedAgents.length})
          </h3>
        </div>
        <div className="p-6">
          {loadingAgents ? (
            <div className="text-center py-8 text-gray-600">Chargement des agents...</div>
          ) : displayedAgents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun agent</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter votre premier agent.</p>
              <button
                onClick={openAddModal}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Ajouter un agent
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'ajout
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {agent.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {agent.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {agent.email}
                            </div>
                            {agent.phone && (
                              <div className="text-sm text-gray-500">
                                {agent.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getRoleLabel(agent.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(agent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(agent.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(agent)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(agent.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Agents;
