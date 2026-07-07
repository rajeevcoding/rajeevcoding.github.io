import { useEffect, useState, useMemo } from 'react';
import { Users, Eye, FileText, Download, Share2, TrendingUp } from 'lucide-react';
import { getAnalytics, getVisitorStats } from '../../lib/api';

export default function AnalyticsViewer() {
  const [events, setEvents] = useState([]);
  const [visitorStats, setVisitorStats] = useState(null);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalytics().catch(() => []),
      getVisitorStats(range).catch(() => null),
    ]).then(([evts, stats]) => {
      setEvents(evts);
      setVisitorStats(stats);
    }).finally(() => setLoading(false));
  }, [range]);

  // Legacy analytics (from analytics_events table)
  const legacyStats = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const filtered = events.filter((e) => new Date(e.created_at) >= cutoff);

    return {
      downloads: filtered.filter((e) => e.event_type === 'resume_download').length,
      contacts: filtered.filter((e) => e.event_type === 'contact_submit').length,
      subscribes: filtered.filter((e) => e.event_type === 'newsletter_subscribe').length,
    };
  }, [events, range]);

  // Daily visitors chart data from visitor stats
  const dailyData = visitorStats?.daily_visitors || [];
  const maxDaily = Math.max(...dailyData.map((d) => d.visitors), 1);

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
          {[1,2,3,4].map(i => <div key={i} className="glass-card p-5 animate-pulse h-24" />)}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: 'Unique Visitors',
                value: visitorStats?.total_unique_visitors || 0,
                sub: `${visitorStats?.new_visitors_today || 0} new today`,
                icon: Users,
                color: 'text-brand-500',
                bg: 'bg-brand-100 dark:bg-brand-900/40',
              },
              {
                label: 'Page Views',
                value: visitorStats?.total_page_views || 0,
                sub: 'unique views',
                icon: Eye,
                color: 'text-accent-violet',
                bg: 'bg-violet-100 dark:bg-violet-900/40',
              },
              {
                label: 'Blog Post Views',
                value: visitorStats?.total_post_views || 0,
                sub: 'unique reads',
                icon: FileText,
                color: 'text-accent-teal',
                bg: 'bg-teal-100 dark:bg-teal-900/40',
              },
              {
                label: 'Resume Downloads',
                value: legacyStats.downloads,
                icon: Download,
                color: 'text-accent-pink',
                bg: 'bg-pink-100 dark:bg-pink-900/40',
              },
              {
                label: 'Contact Submissions',
                value: legacyStats.contacts,
                icon: Share2,
                color: 'text-accent-amber',
                bg: 'bg-amber-100 dark:bg-amber-900/40',
              },
              {
                label: 'Newsletter Signups',
                value: legacyStats.subscribes,
                icon: TrendingUp,
                color: 'text-emerald-500',
                bg: 'bg-emerald-100 dark:bg-emerald-900/40',
              },
            ].map((s) => (
              <div key={s.label} className="glass-card p-5">
                <div className={`p-2 rounded-xl ${s.bg} w-fit mb-3`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                {s.sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Daily unique visitors chart */}
          {dailyData.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">
                Daily Unique Visitors
              </h2>
              <div className="flex items-end gap-1 h-40">
                {dailyData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.visitors} visitors`}>
                    <span className="text-[10px] text-slate-400">{d.visitors}</span>
                    <div
                      className="w-full bg-brand-500 rounded-t-sm transition-all hover:bg-brand-600"
                      style={{ height: `${(d.visitors / maxDaily) * 100}%`, minHeight: '4px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>{dailyData[0]?.day}</span>
                <span>{dailyData[dailyData.length - 1]?.day}</span>
              </div>
            </div>
          )}

          {/* Top pages */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">
                Top Pages <span className="text-xs font-normal text-slate-400">(unique views)</span>
              </h2>
              {(visitorStats?.top_pages || []).length > 0 ? (
                <div className="space-y-3">
                  {visitorStats.top_pages.map((p, i) => {
                    const maxViews = visitorStats.top_pages[0]?.views || 1;
                    return (
                      <div key={p.page}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600 dark:text-slate-300 truncate">{p.page}</span>
                          <span className="font-medium text-slate-900 dark:text-white ml-4 shrink-0">{p.views}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${(p.views / maxViews) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No data yet</p>
              )}
            </div>

            {/* Info card */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">
                How tracking works
              </h2>
              <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <p>
                  Each visitor gets a unique ID stored in their browser. Views are only counted once per visitor per page — refreshes and repeat visits don't inflate numbers.
                </p>
                <p>
                  Your own views as admin are excluded entirely.
                </p>
                <p>
                  Blog post view counts shown publicly are unique reads, not total page loads.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
