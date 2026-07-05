import { useState } from 'react';
import { Sparkles, Mail } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { subscribeNewsletter } from '../../lib/api';

export default function WelcomeModal({ onComplete }) {
  const { getUserDisplayName } = useAuth();
  const [subscribeChecked, setSubscribeChecked] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to newsletter if checked
      if (subscribeChecked && user.email) {
        await subscribeNewsletter(user.email).catch(() => {});
      }

      // Mark as onboarded
      await supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', user.id);

      onComplete();
    } catch (err) {
      console.error('Onboarding error:', err);
      onComplete(); // Don't block the user
    } finally {
      setSaving(false);
    }
  };

  const displayName = getUserDisplayName();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-surface-dark-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header accent */}
        <div className="h-2 bg-aurora" />

        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-5">
            <Sparkles size={24} className="text-brand-600 dark:text-brand-400" />
          </div>

          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Welcome{displayName ? `, ${displayName}` : ''}!
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Thanks for signing in. You can now like posts and join discussions.
          </p>

          {/* Newsletter opt-in */}
          <label className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-700 cursor-pointer text-left">
            <input
              type="checkbox"
              checked={subscribeChecked}
              onChange={(e) => setSubscribeChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                <Mail size={14} className="text-brand-500" /> Subscribe to newsletter
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">
                Get occasional updates about new posts and projects. No spam.
              </span>
            </div>
          </label>

          {/* T&C note */}
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            By continuing, you agree to the{' '}
            <a href="/terms" className="text-brand-600 dark:text-brand-400 hover:underline">
              Terms &amp; Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-brand-600 dark:text-brand-400 hover:underline">
              Privacy Policy
            </a>.
          </p>

          <Button onClick={handleContinue} loading={saving} className="w-full mt-6">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
