import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, FolderKanban, Briefcase, MessageSquare,
  Mail, TrendingUp, Plus, Eye, ArrowUpRight,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { getContacts, getBlogPosts, getProjects, getExperiences, getSubscribers, getAnalytics } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0, posts: 0, experiences: 0,
    contacts: 0, unreadContacts: 0, subscribers: 0, pageViews: 0,
  });
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    Promise.all([
      getProjects(false).catch(() => []),
      getBlogPosts(false).catch(() => []),
      getExperiences(false).catch(() => []),
      getContacts().catch(() => []),
      getSubscribers().catch(() => []),
      getAnalytics().catch(() => []),
    ]).then(([projects, posts, experiences, contacts, subscribers, analytics]) => {
      setStats({
        projects: projects.length,
        posts: posts.length,
        experiences: experiences.length,
        contacts: contacts.length,
        unreadContacts: contacts.filter((c) => !c.is_read).length,
        subscribers: subscribers.filter((s) => s.is_active).length,
        pageViews: analytics.filter((e) => e.event_type === 'page_view').length,
      });
      setRecentContacts(contacts.slice(0, 5));
    });
  }, []);

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FolderKanban, color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-900/40', to: '/admin/projects' },
    { label: 'Blog Posts', value: stats.posts, icon: FileText, color: 'text-accent-violet', bg: 'bg-violet-100 dark:bg-violet-900/40', to: '/admin/blog' },
    { label: 'Experiences', value: stats.experiences, icon: Briefcase, color: 'text-accent-teal', bg: 'bg-teal-100 dark:bg-teal-900/40', to: '/admin/experiences' },
    { label: 'Messages', value: stats.contacts, icon: MessageSquare, color: 'text-accent-pink', bg: 'bg-pink-100 dark:bg-pink-900/40', to: '/admin/contacts', badge: stats.unreadContacts },
    { label: 'Subscribers', value: stats.subscribers, icon: Mail, color: 'text-accent-amber', bg: 'bg-amber-100 dark:bg-amber-900/40', to: '/admin/newsletter' },
    { label: 'Page Views', value: stats.pageViews, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', to: '/admin/analytics' },
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of your portfolio</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/blog/new"><Button size="sm"><Plus size={16} /> New Post</Button></Link>
          <Link to="/admin/projects/new"><Button size="sm" variant="secondary"><Plus size={16} /> New Project</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} to={s.to} className="glass-card p-5 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              {s.value}
              {s.badge > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-accent-pink text-white">{s.badge} new</span>}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent messages */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">Recent Messages</h2>
          <Link to="/admin/contacts" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all</Link>
        </div>
        {recentContacts.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentContacts.map((c) => (
              <div key={c.id} className="px-6 py-3 flex items-center gap-4">
                {!c.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name} — {c.subject || 'No subject'}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.message}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">No messages yet</div>
        )}
      </div>
    </div>
  );
}
