import { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import SectionHeading from '../../components/ui/SectionHeading';
import { submitContact, trackEvent } from '../../lib/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [honeypot, setHoneypot] = useState(''); // anti-spam
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // bot detected
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setSending(true);
    setError('');
    try {
      await submitContact(form);
      trackEvent('contact_submit', '/contact');
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inputClasses =
    'w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all';

  return (
    <section className="py-16">
      <div className="section-container">
        <SectionHeading
          eyebrow="Contact"
          title="Get in Touch"
          description="Have a question or want to work together? Drop me a message."
        />

        <div className="max-w-2xl mx-auto">
          {sent ? (
            <div className="glass-card p-10 text-center">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Message Sent!</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Thanks for reaching out. I'll get back to you as soon as possible.
              </p>
              <Button className="mt-6" variant="secondary" onClick={() => setSent(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <div className="glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute opacity-0 h-0 w-0 pointer-events-none"
                />

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Your message..."
                    className={inputClasses + ' resize-none'}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" loading={sending} className="w-full sm:w-auto">
                  <Send size={16} /> Send Message
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
