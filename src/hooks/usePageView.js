import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trackUniqueView } from '../lib/api';

/**
 * Hook to track unique page views.
 * Call this in any public page component.
 * Automatically skips admin views.
 */
export default function usePageView() {
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    trackUniqueView({
      page: location.pathname,
      userId: user?.id,
      isAdmin,
    });
  }, [location.pathname, loading]);
}
