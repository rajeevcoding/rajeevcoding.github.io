import { useEffect, useState } from 'react';
import { Users, Send, Plus, Trash2, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/FormFields';
import Modal from '../../components/ui/Modal';
import { getSubscribers, getCampaigns } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { formatFullDate } from '../../lib/utils';

export default function NewsletterManager() {
  const [tab, setTab] = useState('subscribers'); // subscribers | campaigns
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [composing, setComposing] = useState(null);
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSubscribers().catch(() => []),
      getCampaigns().catch(() => []),
    ]).then(([subs, camps]) => {
      setSubscribers(subs);
      setCampaigns(camps);
    }).finally(() => setLoading(false));
  }, []);

  const activeCount = subscribers.filter((s) => s.is_active).length;

  const handleRemoveSubscriber = async (id) => {
    if (!confirm('Remove this subscriber?')) return;
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  const openCompose = () => setComposing({ subject: '', content: '' });

  const handleSaveDraft = async () => {
    if (!composing.subject) return;
    const { error } = await supabase.from('newsletter_campaigns').insert({
      subject: composing.subject,
      content: composing.content,
      status: 'draft',
    });
    if (!error) {
      const updated = await getCampaigns().catch(() => []);
      setCampaigns(updated);
      setComposing(null);
    }
  };

  const handleSendCampaign = async () => {
    if (!composing.subject || activeCount === 0) return;
    setSending(true);
    try {
      // Call Supabase edge function to send
      const { error } = await supabase.functions.invoke('send-newsletter', {
        body: { subject: composing.subject, content: composing.content },
      });
      if (error) throw error;
      const updated = await getCampaigns().catch(() => []);
      setCampaigns(updated);
      setComposing(null);
    } catch (err) {
      console.error('Send failed:', err);
      alert('Failed to send. Make sure the send-newsletter edge function is deployed and RESEND_API_KEY is set.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Newsletter</h1>
        <Button onClick={openCompose}><Plus size={16} /> New Campaign</Button>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">{activeCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Active Subscribers</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">{subscribers.length - activeCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Unsubscribed</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">{campaigns.filter(c => c.status === 'sent').length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Campaigns Sent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {['subscribers', 'campaigns'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white dark:bg-surface-dark-card shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card p-5 animate-pulse h-12" />)}</div>
      ) : tab === 'subscribers' ? (
        subscribers.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Subscribed</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {s.is_active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatFullDate(s.subscribed_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleRemoveSubscriber(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">No subscribers yet</div>
        )
      ) : (
        campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="glass-card p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{c.subject}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : c.status === 'sending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                    }`}>{c.status}</span>
                    {c.sent_at && <span>Sent {formatFullDate(c.sent_at)}</span>}
                    {c.sent_count > 0 && <span>To {c.sent_count} subscribers</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-slate-500 dark:text-slate-400">No campaigns yet</div>
        )
      )}

      {/* Compose modal */}
      <Modal open={!!composing} onClose={() => setComposing(null)} title="Compose Campaign" wide>
        {composing && (
          <div className="space-y-4">
            <Input label="Subject *" value={composing.subject} onChange={(e) => setComposing({ ...composing, subject: e.target.value })} placeholder="Newsletter subject line" />

            {preview ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{composing.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <Textarea label="Content (Markdown)" value={composing.content} onChange={(e) => setComposing({ ...composing, content: e.target.value })} rows={12} placeholder="Write your newsletter..." />
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
                <Eye size={14} /> {preview ? 'Edit' : 'Preview'}
              </Button>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleSaveDraft}>Save Draft</Button>
                <Button onClick={handleSendCampaign} loading={sending}>
                  <Send size={14} /> Send to {activeCount} subscribers
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
