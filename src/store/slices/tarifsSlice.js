import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tarifsApi } from '../../utils/api/tarifs';

// Thunks pour les opérations asynchrones
const groupTarifsByIndice = (flatTarifs) => {
  if (!Array.isArray(flatTarifs)) return [];

  const grouped = {};

  flatTarifs.forEach(item => {
    const idx = item.indice;
    if (!grouped[idx]) {
      grouped[idx] = {
        id: item.id,
        indice: idx,
        created_at: item.created_at,
        updated_at: item.updated_at,
        actif: item.actif,
        prix_zones: []
      };
    }

    // S'assurer que les zones ont la bonne structure
    grouped[idx].prix_zones.push({
      ...item,
      zone_destination_id: item.zone_destination_id || `Z1`,
      nom_zone: item.nom_zone || `Zone ${item.zone_destination_id?.replace('Z', '') || 'Inconnue'}`,
      montant_base: parseFloat(item.montant_base) || 0,
      pourcentage_prestation: parseFloat(item.pourcentage_prestation) || 0,
      montant_prestation: parseFloat(item.montant_prestation) || 0,
      montant_expedition: parseFloat(item.montant_expedition) || 0
    });
  });

  return Object.values(grouped).sort((a, b) => {
    const numA = parseFloat(a.indice) || 0;
    const numB = parseFloat(b.indice) || 0;
    return numA - numB;
  });
};

export const fetchTarifs = createAsyncThunk(
  'tarifs/fetchTarifs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.getTarifsBase();
      if (response.success && response.data) {
        return response.data.tarifs || [];
      }
      return rejectWithValue(response.message || 'Échec du chargement des tarifs');
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors du chargement des tarifs');
    }
  }
);

export const fetchAgencyTarifs = createAsyncThunk(
  'tarifs/fetchAgencyTarifs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.getTarifs();
      if (response.success) {
        return response.data?.tarifs || [];
      }
      return rejectWithValue(response.message || "Erreur lors du chargement des tarifs de l'agence");
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors du chargement des tarifs de l'agence");
    }
  }
);

export const saveTarif = createAsyncThunk(
  'tarifs/saveTarif',
  async (customData, { getState, rejectWithValue }) => {
    const state = getState();
    const { selectedIndex, editingZones, existingTarifs } = state.tarifs;

    // Utiliser les données passées (SaveTarifModal) ou celles du state (TarifConfigModal)
    const dataToSave = customData || {
      indice: selectedIndex,
      prix_zones: editingZones
    };

    if (!dataToSave.indice || dataToSave.indice === 'new') {
      return rejectWithValue('Aucun indice valide sélectionné');
    }

    try {
      const results = [];
      const errors = [];
      const targetIndice = parseFloat(dataToSave.indice);

      // Déterminer s'il s'agit d'un indice déjà configuré par l'agence
      // pour savoir si on fait des updates ou des creates
      const isExistingInAgency = existingTarifs.some(t => parseFloat(t.indice) === targetIndice);

      for (const zone of dataToSave.prix_zones) {
        const percentage = parseFloat(zone.pourcentage_prestation) || 0;

        let response;
        // Si on n'est pas dans une création globale (customData) et que l'indice existe
        // déjà chez l'agence, on fait un UPDATE sur l'ID de la ligne agence.
        if (!customData && isExistingInAgency && zone.id) {
          response = await tarifsApi.updateTarifSimple(zone.id, {
            pourcentage_prestation: percentage
          });
        } else {
          // Sinon c'est un AJOUT (ou un import de modèle).
          // Le body doit contenir tarif_simple_id (ID du modèle de base) et le pourcentage.
          response = await tarifsApi.createTarifSimple({
            tarif_simple_id: zone.id,
            pourcentage_prestation: percentage
          });
        }

        if (response.success) {
          results.push(response.data);
        } else {
          errors.push(`${zone.zone_destination_id}: ${response.message}`);
        }
      }

      if (results.length === 0 && errors.length > 0) {
        return rejectWithValue(errors.join(' | '));
      }

      return {
        success: true,
        data: results[0] || {},
        isNew: !isExistingInAgency,
        message: errors.length > 0
          ? `Sauvegarde partielle (${results.length}/${dataToSave.prix_zones.length} zones).`
          : 'Tarif sauvegardé avec succès'
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la sauvegarde');
    }
  }
);

export const updateSingleTarifZone = createAsyncThunk(
  'tarifs/updateSingleTarifZone',
  async ({ id, pourcentage_prestation }, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.updateTarifSimple(id, {
        pourcentage_prestation
      });

      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la mise à jour de la zone');
    }
  }
);

export const deleteTarifSimple = createAsyncThunk(
  'tarifs/deleteTarifSimple',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.deleteTarif(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la suppression du tarif');
    }
  }
);

export const toggleTarifSimpleStatus = createAsyncThunk(
  'tarifs/toggleTarifSimpleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.toggleTarifStatus(id);
      if (response.success) {
        return { id, actif: response.data?.actif };
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors du changement de statut');
    }
  }
);


// Base groupage
export const fetchTarifsGroupage = createAsyncThunk(
  'tarifs/fetchTarifsGroupage',
  async (_, { rejectWithValue }) => {
    try {
      const res = await tarifsApi.getTarifsGroupageBase();
      console.log('res Groupage base ', res);
      if (res.success) return res.data.tarifs || [];
      return rejectWithValue(res.message);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// Groupe agence
export const fetchTarifGroupageAgence = createAsyncThunk(
  'tarifs/fetchTarifGroupageAgence',
  async (_, { rejectWithValue }) => {
    try {
      const res = await tarifsApi.getTarifsGroupage();
      console.log('res Groupage agence ', res);
      if (res.success) return res.data.tarifs || [];
      return rejectWithValue(res.message);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// Créer un nouveau tarif groupage
export const createTarifGroupage = createAsyncThunk(
  'tarifs/createTarifGroupage',
  async (tarifData, { rejectWithValue }) => {
    try {
      console.log(tarifData, "🛜🛜")
      const response = await tarifsApi.createTarifGroupage(tarifData);
      console.log('reponse create Groupage agence ', response);
      if (response.success) return response.data.tarifs || [];
      return rejectWithValue(response.message);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateTarifGroupage = createAsyncThunk(
  'tarifs/updateTarifGroupage',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.updateTarifGroupage(id, data);

      if (response.success) {
        return response.data;
      }

      return rejectWithValue(response.message);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteTarifGroupage = createAsyncThunk(
  'tarifs/deleteTarifGroupage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.deleteTarifGroupage(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.message);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const toggleTarifGroupageStatus = createAsyncThunk(
  'tarifs/toggleTarifGroupageStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tarifsApi.toggleTarifGroupageStatus(id);
      if (response.success) {
        return { id, actif: response.data?.actif };
      }
      return rejectWithValue(response.message);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);



// Helpers pour le LocalStorage
const saveTarifsToCache = (data) => {
  try {
    const currentCache = JSON.parse(localStorage.getItem('tarifs_cache') || '{}');
    const newCache = { ...currentCache, ...data };
    localStorage.setItem('tarifs_cache', JSON.stringify(newCache));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde du cache tarifs:', e);
  }
};

const loadTarifsFromCache = () => {
  try {
    const data = localStorage.getItem('tarifs_cache');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

// État initial
const cachedData = loadTarifsFromCache();

const initialState = {
  tarifs: cachedData.tarifs || [], // tarifs standards (groupés)
  flatTarifs: cachedData.flatTarifs || [], // tarifs standards (liste plate)
  existingTarifs: cachedData.existingTarifs || [], // tarifs personnalisés de l'agence (groupés par indice)

  flatExistingTarifs: cachedData.flatExistingTarifs || [], // tarifs personnalisés de l'agence (liste plate)
  groupageTarifs: cachedData.groupageTarifs || [], // tarifs groupage

  existingGroupageTarifs: cachedData.existingGroupageTarifs || [], // tarifs groupage de l'agence
  loading: false,
  error: null,
  message: '',
  selectedIndex: null,
  editingZones: [],
  isSaving: false,
  newTarif: {
    indice: '',
    actif: true,
    prix_zones: Array.from({ length: 8 }, (_, i) => ({
      zone_destination_id: `Z${i + 1}`,
      nom_zone: `Zone ${i + 1}`,
      montant_base: 0,
      pourcentage_prestation: 0,
      montant_prestation: 0,
      montant_expedition: 0
    }))
  }
};

// Slice
const tarifsSlice = createSlice({
  name: 'tarifs',
  initialState,
  reducers: {
    selectIndex: (state, action) => {
      const index = action.payload;

      // Normaliser l'index
      const normalizeIndex = (idx) => {
        if (idx === 'new') return 'new';
        const num = typeof idx === 'string' ? parseFloat(idx) : idx;
        return isNaN(num) ? idx : num;
      };

      const normalizedIndex = normalizeIndex(index);

      if (normalizedIndex === 'new') {
        state.selectedIndex = 'new';
        state.editingZones = JSON.parse(JSON.stringify(state.newTarif.prix_zones));
        state.error = null;
        return;
      }

      // Fonction de comparaison d'indices
      const compareIndices = (a, b) => {
        const numA = typeof a === 'string' ? parseFloat(a) : a;
        const numB = typeof b === 'string' ? parseFloat(b) : b;

        if (isNaN(numA) || isNaN(numB)) return a === b;
        return Math.abs(numA - numB) < 0.0001;
      };

      // 1. D'abord chercher dans les tarifs de l'agence (priorité)
      const existingAgencyTarif = state.existingTarifs.find(t => compareIndices(t.indice, normalizedIndex));

      if (existingAgencyTarif) {
        state.selectedIndex = existingAgencyTarif.indice;
        state.editingZones = JSON.parse(JSON.stringify(existingAgencyTarif.prix_zones || []));
        state.error = null;
        return;
      }

      // 2. Sinon chercher dans les tarifs de base
      const selectedTarif = state.tarifs.find(t => compareIndices(t.indice, normalizedIndex));

      if (selectedTarif) {
        state.selectedIndex = selectedTarif.indice;
        state.editingZones = JSON.parse(JSON.stringify(selectedTarif.prix_zones || []));
        state.error = null;
      } else {
        state.error = `Aucune donnée disponible pour l'indice ${index}`;

        // Trouver l'index disponible le plus proche (parmi les bases ou agence ?)
        // On cherche généralement dans les bases pour proposer un modèle
        const availableIndices = [...new Set(state.tarifs.map(t => t.indice))]
          .sort((a, b) => {
            const numA = parseFloat(a) || 0;
            const numB = parseFloat(b) || 0;
            return numA - numB;
          });

        if (availableIndices.length > 0) {
          const currentNum = parseFloat(normalizedIndex) || 0;
          const closestIndex = availableIndices.reduce((prev, curr) => {
            const prevDiff = Math.abs((parseFloat(prev) || 0) - currentNum);
            const currDiff = Math.abs((parseFloat(curr) || 0) - currentNum);
            return currDiff < prevDiff ? curr : prev;
          });

          const closestTarif = state.tarifs.find(t => compareIndices(t.indice, closestIndex));
          if (closestTarif) {
            state.selectedIndex = closestTarif.indice;
            state.editingZones = JSON.parse(JSON.stringify(closestTarif.prix_zones || []));
            state.error = `Indice ${index} non trouvé. Affichage de l'indice ${closestTarif.indice} à la place.`;
          }
        }
      }
    },

    updateZonePercentage: (state, action) => {
      const { zoneId, percentage } = action.payload;
      state.editingZones = state.editingZones.map(zone => {
        if (zone.zone_destination_id === zoneId) {
          const pourcentage_prestation = parseFloat(percentage) || 0;
          const montant_prestation = Math.round((zone.montant_base * pourcentage_prestation) / 100);
          return {
            ...zone,
            pourcentage_prestation,
            montant_prestation,
            montant_expedition: zone.montant_base + montant_prestation
          };
        }
        return zone;
      });
    },

    updateNewTarifZones: (state, action) => {
      state.newTarif.prix_zones = action.payload;
    },

    clearMessage: (state) => {
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Gestion de fetchTarifs
      .addCase(fetchTarifs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTarifs.fulfilled, (state, action) => {
        state.loading = false;

        // Traiter et grouper les tarifs par indice
        const groupedTarifs = groupTarifsByIndice(action.payload);
        state.tarifs = groupedTarifs;
        state.flatTarifs = action.payload;

        // Sauvegarder dans le cache
        saveTarifsToCache({
          tarifs: groupedTarifs,
          flatTarifs: action.payload
        });


        // Sélectionner le premier index par défaut si aucun n'est sélectionné
        if (state.tarifs.length > 0 && state.selectedIndex === null) {
          state.selectedIndex = state.tarifs[0].indice;
          state.editingZones = JSON.parse(JSON.stringify(state.tarifs[0].prix_zones));
        }
      })
      .addCase(fetchTarifs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Gestion de fetchAgencyTarifs
      .addCase(fetchAgencyTarifs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAgencyTarifs.fulfilled, (state, action) => {
        state.loading = false;

        // Grouper les tarifs agence par indice
        const groupedAgencyTarifs = groupTarifsByIndice(action.payload);
        state.existingTarifs = groupedAgencyTarifs;
        state.flatExistingTarifs = action.payload;

        // Sauvegarder dans le cache
        saveTarifsToCache({
          existingTarifs: groupedAgencyTarifs,
          flatExistingTarifs: action.payload
        });


        // Si aucun tarif n'est sélectionné, sélectionner le premier
        if (state.existingTarifs.length > 0 && state.selectedIndex === null) {
          state.selectedIndex = state.existingTarifs[0].indice;
          state.editingZones = JSON.parse(JSON.stringify(state.existingTarifs[0].prix_zones || []));
        }
      })
      .addCase(fetchAgencyTarifs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Gestion de saveTarif
      .addCase(saveTarif.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveTarif.fulfilled, (state, action) => {
        state.isSaving = false;
        state.message = action.payload.message;

        // Si c'est un nouveau tarif, l'ajouter à la liste des tarifs existants
        if (action.payload.isNew) {
          state.existingTarifs.push({
            ...action.payload.data,
            indice: action.payload.data.indice || state.selectedIndex,
            prix_zones: state.editingZones
          });

          // Mettre à jour l'indice sélectionné avec celui du nouveau tarif
          state.selectedIndex = action.payload.data.indice || state.selectedIndex;
        } else {
          // Mettre à jour le tarif existant dans la liste
          state.existingTarifs = state.existingTarifs.map(tarif => {
            if (tarif.indice === state.selectedIndex) {
              return {
                ...tarif,
                prix_zones: state.editingZones
              };
            }
            return tarif;
          });
        }
        saveTarifsToCache({ existingTarifs: state.existingTarifs });
      })
      .addCase(saveTarif.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Gestion de updateSingleTarifZone
      .addCase(updateSingleTarifZone.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSingleTarifZone.fulfilled, (state, action) => {
        state.isSaving = false;
        state.message = 'Zone mise à jour avec succès';

        const updatedZone = action.payload;
        if (updatedZone && updatedZone.id) {
          state.existingTarifs = state.existingTarifs.map(tarif => {
            const zoneIndex = tarif.prix_zones?.findIndex(z => z.id === updatedZone.id);
            if (zoneIndex !== -1 && tarif.prix_zones) {
              const newZones = [...tarif.prix_zones];
              newZones[zoneIndex] = {
                ...newZones[zoneIndex],
                ...updatedZone,
                pourcentage_prestation: parseFloat(updatedZone.pourcentage_prestation),
                montant_prestation: parseFloat(updatedZone.montant_prestation),
                montant_expedition: parseFloat(updatedZone.montant_expedition)
              };
              return { ...tarif, prix_zones: newZones };
            }
            return tarif;
          });

          // Si on est en train d'éditer ce tarif, mettre à jour editingZones aussi
          const currentEditingTarif = state.existingTarifs.find(t => t.indice === state.selectedIndex);
          if (currentEditingTarif) {
            // Check if the updated zone belongs to current editing selection
            const isRelevant = currentEditingTarif.prix_zones.some(z => z.id === updatedZone.id);
            if (isRelevant) {
              state.editingZones = JSON.parse(JSON.stringify(currentEditingTarif.prix_zones));
            }
          }
          saveTarifsToCache({ existingTarifs: state.existingTarifs });
        }
      })
      .addCase(updateSingleTarifZone.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Gestion de deleteTarifSimple
      .addCase(deleteTarifSimple.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteTarifSimple.fulfilled, (state, action) => {
        state.isSaving = false;
        state.message = 'Tarif supprimé avec succès';
        // Supprimer le tarif de la liste existante
        // Note: Comme les tarifs sont groupés par indice, si on supprime un tarif (une ligne spécifique d'un indice),
        // on doit vérifier si l'indice a encore d'autres tarifs ou s'il faut le retirer.
        // Mais ici l'ID passé semble être l'ID d'un tarif simple (une ligne de la table tarifs_simples).
        // Cependant, l'affichage est groupé. Il faut voir comment l'API de suppression fonctionne.
        // Si l'API supprime une entrée de la table, on doit la retirer de notre structure groupée.

        // L'action renvoie l'ID supprimé.
        // On doit parcourir existingTarifs (qui sont des groupes) et retirer l'élément correspondant dans prix_zones ou supprimer le groupe si c'était le représentatif ?
        // Attendons, existingTarifs est un tableau de groupes : { indice, id, prix_zones: [...] }
        // Si l'ID supprimé est "id" du groupe (le tarif représentatif), ça peut être délicat.
        // Mais généralement "delete-tarif-simple/{id}" supprime un enregistrement spécifique.
        // Si "id" correspond à l'ID d'un des éléments dans prix_zones.

        // Simplification : On recharge souvent après suppression, mais pour l'UI optimiste :
        // On va essayer de le retirer de prix_zones de tous les groupes
        state.existingTarifs = state.existingTarifs.map(group => ({
          ...group,
          prix_zones: group.prix_zones.filter(z => z.id !== action.payload)
        })).filter(group => group.prix_zones.length > 0); // Si plus de zones, on vire le groupe
        saveTarifsToCache({ existingTarifs: state.existingTarifs });

      })
      .addCase(deleteTarifSimple.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Gestion de toggleTarifSimpleStatus
      // Gestion optimiste de toggleTarifSimpleStatus
      .addCase(toggleTarifSimpleStatus.pending, (state, action) => {
        state.error = null;
        const id = action.meta.arg;
        state.existingTarifs = state.existingTarifs.map(group => {
          if (group.id === id) return { ...group, actif: !group.actif };
          const zoneIndex = group.prix_zones.findIndex(z => z.id === id);
          if (zoneIndex !== -1) {
            const newZones = [...group.prix_zones];
            newZones[zoneIndex] = { ...newZones[zoneIndex], actif: !newZones[zoneIndex].actif };
            return { ...group, prix_zones: newZones };
          }
          return group;
        });
      })
      .addCase(toggleTarifSimpleStatus.fulfilled, (state, action) => {
        state.isSaving = false;
        const { id, actif } = action.payload;
        state.existingTarifs = state.existingTarifs.map(group => {
          if (group.id === id) return { ...group, actif: actif ?? group.actif };
          const zoneIndex = group.prix_zones.findIndex(z => z.id === id);
          if (zoneIndex !== -1) {
            const newZones = [...group.prix_zones];
            newZones[zoneIndex] = { ...newZones[zoneIndex], actif: actif ?? newZones[zoneIndex].actif };
            return { ...group, prix_zones: newZones };
          }
          return group;
        });
        state.message = 'Statut modifié avec succès';
        saveTarifsToCache({ existingTarifs: state.existingTarifs });
      })
      .addCase(toggleTarifSimpleStatus.rejected, (state, action) => {
        state.isSaving = false;
        const id = action.meta.arg;
        state.existingTarifs = state.existingTarifs.map(group => {
          if (group.id === id) return { ...group, actif: !group.actif };
          const zoneIndex = group.prix_zones.findIndex(z => z.id === id);
          if (zoneIndex !== -1) {
            const newZones = [...group.prix_zones];
            newZones[zoneIndex] = { ...newZones[zoneIndex], actif: !newZones[zoneIndex].actif };
            return { ...group, prix_zones: newZones };
          }
          return group;
        });
        state.error = action.payload || "Une erreur est survenue";
        state.message = "Désolé, impossible de modifier le statut. Veuillez réessayer.";
      })


    builder
      // === Base groupage ===
      .addCase(fetchTarifsGroupage.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTarifsGroupage.fulfilled, (state, action) => {
        state.loading = false;
        state.groupageTarifs = action.payload;
        saveTarifsToCache({ groupageTarifs: action.payload });
      })
      .addCase(fetchTarifsGroupage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === Groupage agence ===
      .addCase(fetchTarifGroupageAgence.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTarifGroupageAgence.fulfilled, (state, action) => {
        state.loading = false;
        state.existingGroupageTarifs = action.payload;
        saveTarifsToCache({ existingGroupageTarifs: action.payload });
      })
      .addCase(fetchTarifGroupageAgence.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === Create Groupage ===
      .addCase(createTarifGroupage.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createTarifGroupage.fulfilled, (state, action) => {
        state.isSaving = false;
        state.message = 'Tarif groupage ajouté avec succès';
        // L'API renvoie souvent la liste complète ou l'objet créé
        if (Array.isArray(action.payload)) {
          state.existingGroupageTarifs = action.payload;
        }
        saveTarifsToCache({ existingGroupageTarifs: state.existingGroupageTarifs });
      })
      .addCase(createTarifGroupage.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // === Update Groupage ===
      .addCase(updateTarifGroupage.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateTarifGroupage.fulfilled, (state, action) => {
        state.isSaving = false;
        state.message = 'Tarif groupage mis à jour avec succès';
        // Si l'action renvoie l'objet mis à jour, on peut mettre à jour la liste locale
        if (action.payload && action.payload.id) {
          state.existingGroupageTarifs = state.existingGroupageTarifs.map(t =>
            t.id === action.payload.id ? action.payload : t
          );
        }
        saveTarifsToCache({ existingGroupageTarifs: state.existingGroupageTarifs });
      })
      .addCase(updateTarifGroupage.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // === Delete Groupage ===
      .addCase(deleteTarifGroupage.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteTarifGroupage.fulfilled, (state, action) => {
        state.isSaving = false;
        state.message = 'Tarif groupage supprimé avec succès';
        state.existingGroupageTarifs = state.existingGroupageTarifs.filter(t => t.id !== action.payload);
        saveTarifsToCache({ existingGroupageTarifs: state.existingGroupageTarifs });
      })
      .addCase(deleteTarifGroupage.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // === Toggle Status Groupage (Optimistic Update) ===
      .addCase(toggleTarifGroupageStatus.pending, (state, action) => {
        state.error = null;
        const id = action.meta.arg;
        // Mise à jour optimiste : on inverse le statut immédiatement
        state.existingGroupageTarifs = state.existingGroupageTarifs.map(t =>
          t.id === id ? { ...t, actif: !t.actif } : t
        );
      })
      .addCase(toggleTarifGroupageStatus.fulfilled, (state, action) => {
        const { id, actif } = action.payload;
        // On s'assure d'avoir la valeur réelle du serveur (même si normalement c'est déjà bon)
        state.existingGroupageTarifs = state.existingGroupageTarifs.map(t =>
          t.id === id ? { ...t, actif: actif ?? t.actif } : t
        );
        state.message = 'Statut du tarif groupage modifié avec succès';
        saveTarifsToCache({ existingGroupageTarifs: state.existingGroupageTarifs });
      })
      .addCase(toggleTarifGroupageStatus.rejected, (state, action) => {
        const id = action.meta.arg;
        // En cas d'échec, on remet le statut comme il était (on ré-inverse)
        state.existingGroupageTarifs = state.existingGroupageTarifs.map(t =>
          t.id === id ? { ...t, actif: !t.actif } : t
        );
        state.error = action.payload || "Une erreur est survenue";
        state.message = "Désolé, impossible de modifier le statut. Veuillez réessayer.";
      });

  }


});

// Exporter les actions
export const {
  selectIndex,
  updateZonePercentage,
  updateNewTarifZones,
  clearMessage
} = tarifsSlice.actions;

// Sélecteurs
export const selectTarifsState = (state) => state.tarifs;
export const selectExistingTarifs = (state) => state.tarifs.existingTarifs;
export const selectSelectedIndex = (state) => state.tarifs.selectedIndex;
export const selectEditingZones = (state) => state.tarifs.editingZones;
export const selectIsSaving = (state) => state.tarifs.isSaving;
export const selectLoading = (state) => state.tarifs.loading;
export const selectError = (state) => state.tarifs.error;
export const selectMessage = (state) => state.tarifs.message;

// Sélecteur pour obtenir le tarif actuel
export const selectCurrentTarif = (state) => {
  const { selectedIndex, existingTarifs, tarifs } = state.tarifs;

  if (!selectedIndex) return null;

  // Fonction de comparaison d'indices
  const compareIndices = (a, b) => {
    if (a === 'new' || b === 'new') return a === b;

    const numA = typeof a === 'string' ? parseFloat(a) : a;
    const numB = typeof b === 'string' ? parseFloat(b) : b;

    if (isNaN(numA) || isNaN(numB)) return a === b;
    return Math.abs(numA - numB) < 0.0001;
  };

  // Chercher d'abord dans les tarifs existants
  const existingTarif = existingTarifs.find(t => compareIndices(t.indice, selectedIndex));
  if (existingTarif) return existingTarif;

  // Sinon chercher dans les tarifs standards
  return tarifs.find(t => compareIndices(t.indice, selectedIndex)) || null;
};

// Sélecteur pour obtenir les indices disponibles
export const selectAvailableIndices = (state) => {
  const { tarifs } = state.tarifs;

  if (!tarifs || !Array.isArray(tarifs)) return [];

  return tarifs
    .filter(tarif => tarif?.indice)
    .map(tarif => ({
      value: tarif.indice,
      label: `Indice ${tarif.indice}`
    }));
};

export default tarifsSlice.reducer;