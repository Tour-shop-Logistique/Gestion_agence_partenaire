import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tarifsApi } from '../../utils/api/tarifs';

// Thunks pour les opérations asynchrones
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
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { selectedIndex, editingZones, tarifs } = state.tarifs;

    if (selectedIndex === null) {
      return rejectWithValue('Aucun tarif sélectionné');
    }

    try {
      // Préparer les données à sauvegarder
      const dataToSave = {
        indice: selectedIndex === 'new'
          ? Math.max(0, ...tarifs.map(t => t.indice)) + 1
          : selectedIndex,
        actif: true,
        prix_zones: editingZones.map(zone => ({
          zone_destination_id: zone.zone_destination_id,
          nom_zone: zone.nom_zone,
          montant_base: parseFloat(zone.montant_base) || 0,
          pourcentage_prestation: parseFloat(zone.pourcentage_prestation) || 0,
          montant_prestation: Math.round((parseFloat(zone.montant_base) * parseFloat(zone.pourcentage_prestation || 0)) / 100),
          montant_expedition: Math.round(parseFloat(zone.montant_base) +
            (parseFloat(zone.montant_base) * parseFloat(zone.pourcentage_prestation || 0)) / 100)
        }))
      };

      // Vérifier si on crée un nouveau tarif ou on en met un à jour un existant
      const isNewTarif = selectedIndex === 'new';

      let response;
      if (isNewTarif) {
        response = await tarifsApi.createTarifSimple(dataToSave);
      } else {
        response = await tarifsApi.updateTarifSimple(selectedIndex, dataToSave);
      }

      if (response.success) {
        return {
          data: response.data,
          isNew: isNewTarif,
          message: isNewTarif ? 'Tarif créé avec succès' : 'Tarif mis à jour avec succès'
        };
      }

      return rejectWithValue(response.message || 'Erreur lors de la sauvegarde du tarif');
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la sauvegarde');
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



// État initial
const initialState = {
  tarifs: [], // tarifs standards
  existingTarifs: [], // tarifs personnalisés de l'agence
  groupageTarifs: [], // tarifs groupage
  existingGroupageTarifs: [], // tarifs groupage de l'agence
  loading: false,
  error: null,
  message: '',
  selectedIndex: null,
  editingZones: [],
  isSaving: false,
  newTarif: {
    indice: '',
    actif: true,
    prix_zones: [
      { zone_destination_id: 1, nom_zone: 'Zone 1', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 },
      { zone_destination_id: 2, nom_zone: 'Zone 2', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 },
      { zone_destination_id: 3, nom_zone: 'Zone 3', montant_base: 0, pourcentage_prestation: 0, montant_prestation: 0, montant_expedition: 0 }
    ]
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

      // Trouver le tarif avec l'index sélectionné
      const selectedTarif = state.tarifs.find(t => compareIndices(t.indice, normalizedIndex));

      if (selectedTarif) {
        state.selectedIndex = selectedTarif.indice;
        state.editingZones = JSON.parse(JSON.stringify(selectedTarif.prix_zones || []));
        state.error = null;
      } else {
        state.error = `Aucune donnée disponible pour l'indice ${index}`;

        // Trouver l'index disponible le plus proche
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

        // Traiter les tarifs
        state.tarifs = action.payload.map(tarif => ({
          ...tarif,
          prix_zones: (tarif.prix_zones || []).map(zone => ({
            zone_destination_id: zone.zone_destination_id || `z1`,
            nom_zone: zone.nom_zone || `Zone ${zone.zone_destination_id || 'Inconnue'}`,
            montant_base: parseFloat(zone.montant_base) || 0,
            pourcentage_prestation: parseFloat(zone.pourcentage_prestation) || 0,
            montant_prestation: parseFloat(zone.montant_prestation) || 0,
            montant_expedition: parseFloat(zone.montant_expedition) || 0
          }))
        }));

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
        state.existingTarifs = action.payload;

        // Si aucun tarif n'est sélectionné, sélectionner le premier
        if (action.payload.length > 0 && state.selectedIndex === null) {
          state.selectedIndex = action.payload[0].indice;
          state.editingZones = JSON.parse(JSON.stringify(action.payload[0].prix_zones || []));
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
      })
      .addCase(saveTarif.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });


    builder
      // === Base groupage ===
      .addCase(fetchTarifsGroupage.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTarifsGroupage.fulfilled, (state, action) => {
        state.loading = false;
        state.groupageTarifs = action.payload;
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
      })
      .addCase(deleteTarifGroupage.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
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