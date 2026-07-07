import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WelcomeModal from '../blog/WelcomeModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import usePageView from '../../hooks/usePageView';

export default function Layout() {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  // Track unique page views for all public pages
  usePageView();

  useEffect(() => {
    if (loading || !user) {
      setShowWelcome(false);
      return;
    }

    supabase
      .from('profiles')
      .select('has_onboarded')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data && !data.has_onboarded) {
          setShowWelcome(true);
        }
      })
      .catch(() => {});
  }, [user, loading]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showWelcome && (
        <WelcomeModal onComplete={() => setShowWelcome(false)} />
      )}
    </div>
  );
}
