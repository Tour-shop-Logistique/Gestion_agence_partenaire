import { useEffect, useRef } from 'react';

const subscribers = new Set();
let version = 0;

// Alimenté par useWebSocket pour CHAQUE événement du canal agence, quel que
// soit son couple model/action (contrairement aux handlers nommés de
// useWebSocket qui ignorent les actions non listées).
export function emitRealtime(payload) {
  version += 1;
  subscribers.forEach((fn) => fn(payload));
}

export function subscribeRealtime(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// Permet à un cache hors Redux de savoir qu'un événement est arrivé depuis
// son dernier chargement.
export const getRealtimeVersion = () => version;

/**
 * Relance `refetch` (regroupé par debounce) à chaque événement temps réel
 * concernant l'un des modèles écoutés.
 */
export function useRealtimeRefetch(refetch, { models = ['Expedition', 'Colis'], debounceMs = 600, enabled = true, match = null } = {}) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  const matchRef = useRef(match);
  matchRef.current = match;
  const modelsKey = models.join(',');

  useEffect(() => {
    if (!enabled) return undefined;
    const watched = modelsKey.split(',');
    let timer = null;

    const unsubscribe = subscribeRealtime((payload) => {
      if (!watched.includes(payload?.model)) return;
      if (matchRef.current && !matchRef.current(payload)) return;
      clearTimeout(timer);
      timer = setTimeout(() => refetchRef.current?.(), debounceMs);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [enabled, modelsKey, debounceMs]);
}
