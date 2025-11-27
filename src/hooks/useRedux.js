
import { useDispatch, useSelector } from 'react-redux';

/**
 * Hook personnalisé pour simplifier l'utilisation de Redux
 */
export const useRedux = () => {
  const dispatch = useDispatch();
  
  return {
    dispatch,
    useSelector,
  };
};

/**
 * Hook pour l'authentification
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  
  return {
    ...auth,
    dispatch,
  };
};

/**
 * Hook pour l'agence
 * Note: Utiliser plutôt le hook dédié useAgency.js pour plus de fonctionnalités
 */
export const useAgency = () => {
  const dispatch = useDispatch();
  const agency = useSelector((state) => state.agency);
  
  return {
    ...agency,
    dispatch,
  };
};

/**
 * Hook pour les tarifs
 */
export const useTarifs = () => {
  const dispatch = useDispatch();
  const tarifs = useSelector((state) => state.tarifs);
  
  return {
    ...tarifs,
    dispatch,
  };
};
