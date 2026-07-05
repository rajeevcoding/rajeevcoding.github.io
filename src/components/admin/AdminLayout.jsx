import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FolderKanban, Briefcase, MessageSquare,
  Mail, BarChart3, User, LogOut, Menu, X, Home, MessageCircle, Users,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../layout/ThemeToggle';

const navItems = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/profile',     icon: User,            label: 'Profile' },
  { to: '/admin/experiences', icon: Briefcase,       label: 'Experiences' },
  { to: '/admin/projects',    icon: FolderKanban,    label: 'Projects' },
  { to: '/admin/blog',        icon: FileText,        label: 'Blog Posts' },
  { to: '/admin/comments',    icon: MessageCircle,   label: 'Comments' },
  { to: '/admin/contacts',    icon: MessageSquare,   label: 'Messages' },
  { to: '/admin/newsletter',  icon: Mail,            label: 'Newsletter' },
  { to: '/admin/users',       icon: Users,           label: 'Users' },
  { to: '/admin/analytics',   icon: BarChart3,       label: 'Analytics' },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  const sidebar = (
    <>
      <div className="p-6 flex items-center justify-between">
        <div>
          <Link to="/" className="font-display font-bold text-xl gradient-text">Rajeev Ranjan</Link>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Admin</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setSidebarOpen(false)}>
            <item.icon size={18} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 space-y-1 border-t border-slate-200 dark:border-slate-700">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Home size={18} /> View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark-card fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-white dark:bg-surface-dark-card h-full shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu size={20} />
          </button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
