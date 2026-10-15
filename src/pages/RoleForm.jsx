import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyIcon } from "@heroicons/react/24/outline";
import Spinner from "../components/common/Spinner";
import { toast } from "../utils/toast";
import { fetchRoles, createRole, updateRole, selectRoles } from "../store/slices/rolesSlice";
import { fetchAvailablePermissions, selectAvailablePermissions, selectPermissionsHasLoaded } from "../store/slices/permissionsSlice";
import PermissionMatrix from "../components/roles/PermissionMatrix";
import PageHeader from "../components/ui/PageHeader";

/**
 * Page dédiée (plutôt qu'un modal, voir Agents.jsx historique) pour créer ou
 * modifier un rôle : la liste de permissions (PermissionMatrix, un
 * accordéon par ressource) grandit avec chaque section dépliée et chaque
 * sélection, ce qu'une hauteur de modal contrainte (max-h/overflow) gérait
 * mal - la page utilise tout l'espace disponible et son propre scroll
 * naturel, sans ce problème.
 */
const RoleForm = () => {
    const navigate = useNavigate();
    const { roleId } = useParams();
    const dispatch = useDispatch();
    const roles = useSelector(selectRoles);
    const availablePermissions = useSelector(selectAvailablePermissions);
    const permissionsHasLoaded = useSelector(selectPermissionsHasLoaded);

    const editingRole = roleId ? roles.find((r) => r.id === roleId) : null;
    const isEditing = Boolean(roleId);

    const [formData, setFormData] = useState({ nom: "", description: "", permissions: [] });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!permissionsHasLoaded) {
            dispatch(fetchAvailablePermissions());
        }
    }, [dispatch, permissionsHasLoaded]);

    useEffect(() => {
        if (isEditing && roles.length === 0) {
            dispatch(fetchRoles());
        }
    }, [dispatch, isEditing, roles.length]);

    useEffect(() => {
        if (editingRole) {
            setFormData({
                nom: editingRole.nom || "",
                description: editingRole.description || "",
                permissions: editingRole.permissions || [],
            });
        }
    }, [editingRole]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nom.trim()) {
            toast.error("Le nom du rôle est requis");
            return;
        }
        if (formData.permissions.length === 0) {
            toast.error("Sélectionnez au moins une permission");
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                const result = await dispatch(updateRole({ id: roleId, data: formData }));
                if (result.error) throw new Error(result.payload || "Erreur lors de la modification du rôle");
                toast.success("Rôle mis à jour avec succès");
            } else {
                const result = await dispatch(createRole(formData));
                if (result.error) throw new Error(result.payload || "Erreur lors de la création du rôle");
                toast.success("Rôle créé avec succès");
            }
            navigate("/agents");
        } catch (error) {
            toast.error(error.message || "Une erreur est survenue");
        } finally {
            setSaving(false);
        }
    };

    if (isEditing && !editingRole && roles.length > 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
                Rôle introuvable.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <PageHeader
                icon={
                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <KeyIcon className="w-4 h-4 text-blue-600" />
                    </span>
                }
                onBack={() => navigate("/agents")}
                title={isEditing ? `Modifier ${editingRole?.nom || ""}` : "Nouveau rôle"}
                subtitle="Définissez les pages accessibles pour ce rôle"
            />

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="role_nom" className="block text-sm font-medium text-gray-700">
                            Nom du rôle <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="role_nom"
                            value={formData.nom}
                            onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
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
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Description facultative du rôle..."
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Permissions <span className="text-red-500">*</span>
                    </label>
                    <PermissionMatrix
                        resources={availablePermissions}
                        value={formData.permissions}
                        onChange={(next) => setFormData((p) => ({ ...p, permissions: next }))}
                    />
                </div>

                {/* Barre d'actions collée en bas de viewport (pas du formulaire,
                    qui peut dépasser l'écran avec de nombreuses permissions) */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 -mx-3 sm:-mx-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/agents")}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        {saving ? (
                            <span className="flex items-center">
                                <Spinner size="sm" color="white" className="-ml-1 mr-2" />
                                Enregistrement...
                            </span>
                        ) : isEditing ? (
                            "Mettre à jour le rôle"
                        ) : (
                            "Enregistrer le rôle"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoleForm;
