import { useEffect, useState } from 'react';
import { Users, Shield, ShieldOff, Ban, CheckCircle, Github } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getAllUsers, banUser, setUserAdmin } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const providerIcons = {
  github: <Github size={14} />,
  google: <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
  email: null,
};

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, admin, banned
  const [loading, setLoading] = useState(true);

  const load = () => getAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleBan = async (userId, ban) => {
    const action = ban ? 'ban' : 'unban';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await banUser(userId, ban);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAdmin = async (userId, makeAdmin) => {
    const action = makeAdmin ? 'grant admin' : 'revoke admin';
    if (!confirm(`Are you sure you want to ${action} for this user?`)) return;
    try {
      await setUserAdmin(userId, makeAdmin);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const adminCount = users.filter((u) => u.is_admin).length;
  const bannedCount = users.filter((u) => u.is_banned).length;

  const filtered = filter === 'admin'
    ? users.filter((u) => u.is_admin)
    : filter === 'banned'
    ? users.filter((u) => u.is_banned)
    : users;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {users.length} total · {adminCount} admin · {bannedCount} banned
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>All</Button>
          <Button size="sm" variant={filter === 'admin' ? 'primary' : 'ghost'} onClick={() => setFilter('admin')}>Admins</Button>
          <Button size="sm" variant={filter === 'banned' ? 'primary' : 'ghost'} onClick={() => setFilter('banned')}>
            Banned {bannedCount > 0 && `(${bannedCount})`}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card p-5 animate-pulse h-16" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Provider</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Last Sign In</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${u.is_banned ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-300">
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {u.full_name || '(no name)'}
                            {isSelf && <span className="ml-1 text-xs text-slate-400">(you)</span>}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {providerIcons[u.provider]} {u.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(u.last_sign_in_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {u.is_admin && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
                            Admin
                          </span>
                        )}
                        {u.is_banned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                            Banned
                          </span>
                        )}
                        {!u.is_admin && !u.is_banned && u.has_onboarded && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <div className="flex items-center gap-1">
                          {/* Toggle admin */}
                          <button
                            onClick={() => handleToggleAdmin(u.id, !u.is_admin)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-500 transition-colors"
                            title={u.is_admin ? 'Revoke admin' : 'Make admin'}
                          >
                            {u.is_admin ? <ShieldOff size={15} /> : <Shield size={15} />}
                          </button>
                          {/* Ban/unban */}
                          <button
                            onClick={() => handleBan(u.id, !u.is_banned)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_banned
                                ? 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-400 hover:text-emerald-500'
                                : 'hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500'
                            }`}
                            title={u.is_banned ? 'Unban' : 'Ban'}
                          >
                            {u.is_banned ? <CheckCircle size={15} /> : <Ban size={15} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Users size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            {filter === 'banned' ? 'No banned users' : filter === 'admin' ? 'No admin users' : 'No users yet'}
          </p>
        </div>
      )}
    </div>
  );
}
