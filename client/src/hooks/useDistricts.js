import { useLocation } from '../context/LocationContext';

/**
 * useDistricts hook proxying to global LocationContext.
 * Guarantees cross-tab and cross-page state synchronization.
 */
export default function useDistricts() {
  return useLocation();
}