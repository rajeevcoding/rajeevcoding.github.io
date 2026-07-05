import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, FlagOff, Trash2, ExternalLink, MessageSquare } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getAllComments, deleteComment, toggleCommentFlag } from '../../lib/api';
import { formatFullDate } from '../../lib/utils';

export default function CommentsManager() {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('all'); // all | flagged
  const [loading, setLoading] = useState(true);

  const load = () => getAllComments().then(setComments).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const flaggedCount = comments.filter((c) => c.is_flagged).length;
  const filtered = filter === 'flagged' ? comments.filter((c) => c.is_flagged) : comments;

  const handleToggleFlag = async (id, currentlyFlagged) => {
    await toggleCommentFlag(id, !currentlyFlagged);
    setComments((prev) => prev.map((c) => c.id === id ? { ...c, is_flagged: !currentlyFlagged } : c));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment permanently?')) return;
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Comments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {comments.length} total · {flaggedCount} flagged
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>All</Button>
          <Button size="sm" variant={filter === 'flagged' ? 'primary' : 'ghost'} onClick={() => setFilter('flagged')}>
            Flagged {flaggedCount > 0 && `(${flaggedCount})`}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card p-5 animate-pulse h-20" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`glass-card p-5 ${c.is_flagged ? 'border-l-4 border-l-amber-400' : ''}`}
            >
              <div className="flex items-start gap-3">
                {c.author_avatar ? (
                  <img src={c.author_avatar} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-300">
                    {(c.author_name || '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{c.author_name}</span>
                    <span className="text-xs text-slate-400">{formatFullDate(c.created_at)}</span>
                    {c.parent_id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">reply</span>
                    )}
                    {c.is_flagged && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">flagged</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{c.content}</p>
                  {c.blog_posts && (
                    <Link
                      to={`/blog/${c.blog_posts.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2"
                    >
                      <ExternalLink size={10} /> {c.blog_posts.title}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleFlag(c.id, c.is_flagged)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                    title={c.is_flagged ? 'Unflag' : 'Flag'}
                  >
                    {c.is_flagged ? <FlagOff size={16} /> : <Flag size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <MessageSquare size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            {filter === 'flagged' ? 'No flagged comments' : 'No comments yet'}
          </p>
        </div>
      )}
    </div>
  );
}
