import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MegaphoneIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  TagIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import {
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  selectPromotions,
  selectPromotionsStatus,
} from "../store/slices/promotionsSlice";
import { showToast } from "../utils/toast";

const emptyForm = { titre: "", description: "", badge: "", date_debut: "", date_fin: "" };

const isEnCours = (promo) => {
  if (!promo.actif) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (promo.date_debut && promo.date_debut > today) return false;
  if (promo.date_fin && promo.date_fin < today) return false;
  return true;
};

const Promotions = () => {
  const dispatch = useDispatch();
  const promotions = useSelector(selectPromotions);
  const status = useSelector(selectPromotionsStatus);
  const isSaving = useSelector((state) => state.promotions.isSaving);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchPromotions());
  }, [dispatch]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (promo) => {
    setEditingId(promo.id);
    setForm({
      titre: promo.titre || "",
      description: promo.description || "",
      badge: promo.badge || "",
      date_debut: promo.date_debut || "",
      date_fin: promo.date_fin || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      showToast("Le titre est obligatoire.", "error");
      return;
    }

    const payload = {
      titre: form.titre.trim(),
      description: form.description.trim() || null,
      badge: form.badge.trim() || null,
      date_debut: form.date_debut || null,
      date_fin: form.date_fin || null,
    };

    try {
      if (editingId) {
        await dispatch(updatePromotion({ id: editingId, data: payload })).unwrap();
        showToast("Promotion mise à jour.", "success");
      } else {
        await dispatch(createPromotion(payload)).unwrap();
        showToast("Promotion créée.", "success");
      }
      closeModal();
    } catch (err) {
      showToast(err || "Erreur lors de l'enregistrement", "error");
    }
  };

  const toggleActive = async (promo) => {
    try {
      await dispatch(updatePromotion({ id: promo.id, data: { actif: !promo.actif } })).unwrap();
    } catch (err) {
      showToast(err || "Erreur lors de la mise à jour", "error");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deletePromotion(toDelete.id)).unwrap();
      showToast("Promotion supprimée.", "success");
      setToDelete(null);
    } catch (err) {
      showToast(err || "Erreur lors de la suppression", "error");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 px-3 sm:px-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1 sm:mb-2">
            Promotions
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-lg">
            Mettez en avant vos offres spéciales auprès des clients
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvelle promotion
        </button>
      </div>

      {status === "loading" && promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500 mb-3" size={32} />
          <p className="text-sm text-slate-500">Chargement des promotions...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
            <MegaphoneIcon className="w-7 h-7 text-indigo-300" />
          </div>
          <p className="text-sm font-bold text-slate-700">Aucune promotion pour l'instant</p>
          <p className="text-xs text-slate-400 mt-1">Créez une offre pour attirer l'attention des clients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => {
            const enCours = isEnCours(promo);
            return (
              <div
                key={promo.id}
                className={`rounded-2xl border p-5 transition-all ${
                  enCours ? "border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white" : "border-slate-200 bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${enCours ? "bg-indigo-600" : "bg-slate-300"}`}>
                      <TagIcon className="w-4 h-4 text-white" />
                    </div>
                    {promo.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                        {promo.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${enCours ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {enCours ? "En cours" : promo.actif ? "Hors période" : "Désactivée"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{promo.titre}</h3>
                {promo.description && (
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">{promo.description}</p>
                )}

                {(promo.date_debut || promo.date_fin) && (
                  <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    {promo.date_debut ? format(new Date(promo.date_debut), "dd MMM yyyy", { locale: fr }) : "…"}
                    {" → "}
                    {promo.date_fin ? format(new Date(promo.date_fin), "dd MMM yyyy", { locale: fr }) : "sans fin"}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => toggleActive(promo)}
                    className={`text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      promo.actif ? "text-slate-400 hover:text-slate-600" : "text-indigo-600 hover:text-indigo-700"
                    }`}
                  >
                    {promo.actif ? "Désactiver" : "Activer"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(promo)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setToDelete(promo)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal création/édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeModal} />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "Modifier la promotion" : "Nouvelle promotion"}
              </h2>
              <button type="button" onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Titre</label>
                <input
                  value={form.titre}
                  onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))}
                  placeholder="Ex : -10% sur le groupage ce mois-ci"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Badge (optionnel)</label>
                <input
                  value={form.badge}
                  onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                  placeholder="Ex : PROMO, NOUVEAU"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Détail de l'offre..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Début</label>
                  <input
                    type="date"
                    value={form.date_debut}
                    onChange={(e) => setForm((p) => ({ ...p, date_debut: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Fin</label>
                  <input
                    type="date"
                    value={form.date_fin}
                    onChange={(e) => setForm((p) => ({ ...p, date_fin: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Laissez les dates vides pour une promotion sans limite de temps.</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white transition-colors uppercase tracking-widest"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation suppression */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900">Supprimer la promotion</h3>
            <p className="text-sm text-slate-500 mt-2">
              La promotion « {toDelete.titre} » sera définitivement supprimée.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors uppercase tracking-widest"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
