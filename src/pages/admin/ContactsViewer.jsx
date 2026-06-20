import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, ExternalLink } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { getContacts, markContactRead } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { formatFullDate } from '../../lib/utils';

export default function ContactsViewer() {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread
  const [loading, setLoading] = useState(true);

  const load = () => getContacts().then(setContacts).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openMessage = async (contact) => {
    setSelected(contact);
    if (!contact.is_read) {
      await markContactRead(contact.id);
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, is_read: true } : c)));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    await supabase.from('contacts').delete().eq('id', id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = filter === 'unread' ? contacts.filter((c) => !c.is_read) : contacts;
  const unreadCount = contacts.filter((c) => !c.is_read).length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Messages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {contacts.length} total · {unreadCount} unread
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>All</Button>
          <Button size="sm" variant={filter === 'unread' ? 'primary' : 'ghost'} onClick={() => setFilter('unread')}>
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card p-5 animate-pulse h-16" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => openMessage(c)}
              className={`glass-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all ${
                !c.is_read ? 'border-l-4 border-l-brand-500' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {c.is_read ? <MailOpen size={18} className="text-slate-400" /> : <Mail size={18} className="text-brand-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${!c.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {c.name}
                  </span>
                  <span className="text-xs text-slate-400 truncate">({c.email})</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {c.subject ? `${c.subject} — ` : ''}{c.message}
                </p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatFullDate(c.created_at)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
          </p>
        </div>
      )}

      {/* Message detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Message" wide>
        {selected && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">From:</span>
                <p className="font-medium text-slate-900 dark:text-white">{selected.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="font-medium text-slate-900 dark:text-white">
                  <a href={`mailto:${selected.email}`} className="text-brand-600 dark:text-brand-400 hover:underline">
                    {selected.email} <ExternalLink size={12} className="inline" />
                  </a>
                </p>
              </div>
              <div>
                <span className="text-slate-400">Subject:</span>
                <p className="font-medium text-slate-900 dark:text-white">{selected.subject || '(none)'}</p>
              </div>
              <div>
                <span className="text-slate-400">Date:</span>
                <p className="font-medium text-slate-900 dark:text-white">{formatFullDate(selected.created_at)}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-dark text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selected.message}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || ''}`}>
                <Button size="sm">Reply via Email</Button>
              </a>
              <Button size="sm" variant="danger" onClick={() => { handleDelete(selected.id); setSelected(null); }}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
