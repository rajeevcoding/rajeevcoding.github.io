import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import SectionHeading from '../../components/ui/SectionHeading';
import { subscribeNewsletter, trackEvent } from '../../lib/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError('');
    try {
      await subscribeNewsletter(email);
      trackEvent('newsletter_subscribe', '/newsletter');
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-16">
      <div className="section-container">
        <SectionHeading
          eyebrow="Newsletter"
          title="Stay Updated"
          description="Get occasional updates about new projects, blog posts, and what I'm working on. No spam, unsubscribe anytime."
        />

        <div className="max-w-lg mx-auto">
          {subscribed ? (
            <div className="glass-card p-10 text-center">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">You're in!</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Thanks for subscribing. You'll hear from me soon.
              </p>
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-6">
                <Mail size={28} className="text-brand-600 dark:text-brand-400" />
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-surface-dark-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  required
                />
                <Button type="submit" loading={sending}>
                  Subscribe
                </Button>
              </form>
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                No spam. Unsubscribe at any time.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
