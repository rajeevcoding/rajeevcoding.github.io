import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WelcomeModal from '../blog/WelcomeModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Layout() {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setShowWelcome(false);
      return;
    }

    // Check if this user has completed onboarding
    supabase
      .from('profiles')
      .select('has_onboarded')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        // Show modal if user exists but hasn't onboarded
        // (admin email/password users are already onboarded via the dashboard)
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
