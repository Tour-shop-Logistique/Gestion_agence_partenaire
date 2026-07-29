import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAdmin } from "../store/slices/authSlice";
import { hasPermission } from "../utils/permissions";

/**
 * Hook de gating au niveau action (ex: "colis.block") — complète le
 * filtrage page-level existant (Sidebar/PageGuard) pour cacher/désactiver
 * des boutons précis selon le rôle de l'agent connecté.
 */
export default function useHasPermission(permissionKey) {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  return hasPermission(currentUser, isAdmin, permissionKey);
}
