import { useEffect, useState, useMemo } from 'react';
import { BarChart3, Eye, FileText, Download, Users } from 'lucide-react';
import { getAnalytics } from '../../lib/api';

export default function AnalyticsViewer() {
  const [events, setEvents] = useState([]);
  const [range, setRange] = useState(30); // days
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return events.filter((e) => new Date(e.created_at) >= cutoff);
  }, [events, range]);

  const stats = useMemo(() => {
    const pageViews = filtered.filter((e) => e.event_type === 'page_view');
    const blogViews = filtered.filter((e) => e.event_type === 'blog_view');
    const downloads = filtered.filter((e) => e.event_type === 'resume_download');
    const contacts = filtered.filter((e) => e.event_type === 'contact_submit');

    // Page view counts
    const pageCounts = {};
    pageViews.forEach((e) => {
      pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
    });

    // Blog view counts
    const blogCounts = {};
    blogViews.forEach((e) => {
      const title = e.metadata?.title || e.page;
      blogCounts[title] = (blogCounts[title] || 0) + 1;
    });

    // Daily views
    const dailyViews = {};
    pageViews.forEach((e) => {
      const day = new Date(e.created_at).toLocaleDateString();
      dailyViews[day] = (dailyViews[day] || 0) + 1;
    });

    return {
      totalViews: pageViews.length,
      blogViews: blogViews.length,
      downloads: downloads.length,
      contacts: contacts.length,
      topPages: Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
      topPosts: Object.entries(blogCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
      dailyViews: Object.entries(dailyViews).sort((a, b) => new Date(a[0]) - new Date(b[0])),
    };
  }, [filtered]);

  const maxDaily = Math.max(...stats.dailyViews.map(([, v]) => v), 1);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Analytics</h1>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === d ? 'bg-white dark:bg-surface-dark-card shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="glass-card p-5 animate-pulse h-20" />)}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Page Views', value: stats.totalViews, icon: Eye, color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-900/40' },
              { label: 'Blog Views', value: stats.blogViews, icon: FileText, color: 'text-accent-violet', bg: 'bg-violet-100 dark:bg-violet-900/40' },
              { label: 'Resume Downloads', value: stats.downloads, icon: Download, color: 'text-accent-teal', bg: 'bg-teal-100 dark:bg-teal-900/40' },
              { label: 'Contact Submissions', value: stats.contacts, icon: Users, color: 'text-accent-pink', bg: 'bg-pink-100 dark:bg-pink-900/40' },
            ].map((s) => (
              <div key={s.label} className="glass-card p-5">
                <div className={`p-2 rounded-xl ${s.bg} w-fit mb-3`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Daily views bar chart */}
          {stats.dailyViews.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Daily Page Views</h2>
              <div className="flex items-end gap-1 h-40">
                {stats.dailyViews.map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${count} views`}>
                    <span className="text-[10px] text-slate-400">{count}</span>
                    <div
                      className="w-full bg-brand-500 rounded-t-sm transition-all hover:bg-brand-600"
                      style={{ height: `${(count / maxDaily) * 100}%`, minHeight: '4px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>{stats.dailyViews[0]?.[0]}</span>
                <span>{stats.dailyViews[stats.dailyViews.length - 1]?.[0]}</span>
              </div>
            </div>
          )}

          {/* Top pages & posts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Top Pages</h2>
              {stats.topPages.length > 0 ? (
                <div className="space-y-2">
                  {stats.topPages.map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300 truncate">{page}</span>
                      <span className="font-medium text-slate-900 dark:text-white ml-4 shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No data yet</p>
              )}
            </div>
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Top Blog Posts</h2>
              {stats.topPosts.length > 0 ? (
                <div className="space-y-2">
                  {stats.topPosts.map(([title, count]) => (
                    <div key={title} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300 truncate">{title}</span>
                      <span className="font-medium text-slate-900 dark:text-white ml-4 shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No data yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
