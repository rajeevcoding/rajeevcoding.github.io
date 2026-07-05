import { useEffect, useState, useMemo } from 'react';
import { MessageSquare, Reply, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';
import LoginPrompt from './LoginPrompt';
import Button from '../ui/Button';
import { getPostComments, addComment, deleteComment } from '../../lib/api';

// ── Build tree from flat list ────────────────────
function buildCommentTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach((c) => { map[c.id] = { ...c, children: [] }; });
  comments.forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

// ── Single Comment ───────────────────────────────
function Comment({ comment, postId, depth = 0, onReload }) {
  const { user, getUserDisplayName } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isOwn = user?.id === comment.user_id;
  const timeAgo = getTimeAgo(comment.created_at);

  const handleReply = async () => {
    if (!replyText.trim() || !user) return;
    setSending(true);
    try {
      await addComment({
        postId,
        userId: user.id,
        parentId: comment.id,
        content: replyText.trim(),
        authorName: getUserDisplayName(),
        authorAvatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      });
      setReplyText('');
      setReplying(false);
      onReload();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment.id);
      onReload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 sm:ml-10 pl-4 border-l-2 border-slate-200 dark:border-slate-700' : ''}`}>
      <div className={`py-4 ${comment.is_flagged ? 'opacity-60' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          {comment.author_avatar ? (
            <img src={comment.author_avatar} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-300">
              {(comment.author_name || '?')[0].toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {comment.author_name || 'Anonymous'}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo}</span>
          {comment.is_flagged && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              Flagged
            </span>
          )}
        </div>

        {/* Content */}
        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-3">
          {user && (
            <button
              onClick={() => setReplying(!replying)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Reply size={12} /> Reply
            </button>
          )}
          {isOwn && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
          {comment.children?.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply input */}
        {replying && (
          <div className="mt-3 flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder="Write a reply (Markdown supported)..."
              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={handleReply} loading={sending} disabled={!replyText.trim()}>
                <Send size={12} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
                ✕
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {!collapsed && comment.children?.map((child) => (
        <Comment
          key={child.id}
          comment={child}
          postId={postId}
          depth={depth + 1}
          onReload={onReload}
        />
      ))}
    </div>
  );
}

// ── Main Comments Section ────────────────────────
export default function CommentsSection({ postId }) {
  const { user, getUserDisplayName } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadComments = () => {
    getPostComments(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadComments(); }, [postId]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setSending(true);
    try {
      await addComment({
        postId,
        userId: user.id,
        parentId: null,
        content: newComment.trim(),
        authorName: getUserDisplayName(),
        authorAvatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      });
      setNewComment('');
      loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
      <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2 mb-6">
        <MessageSquare size={20} />
        Comments {comments.length > 0 && <span className="text-sm font-normal text-slate-400">({comments.length})</span>}
      </h2>

      {/* Comment input or login prompt */}
      {user ? (
        <div className="mb-8">
          <div className="flex items-start gap-3">
            {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
              <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="" className="w-8 h-8 rounded-full mt-1" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-300 mt-1">
                {getUserDisplayName()[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Write a comment (Markdown supported)..."
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">Markdown supported</span>
                <Button size="sm" onClick={handleSubmit} loading={sending} disabled={!newComment.trim()}>
                  <Send size={14} /> Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <LoginPrompt message="Sign in to join the discussion" />
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : tree.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tree.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postId={postId}
              onReload={loadComments}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}
    </section>
  );
}

// ── Time ago helper ──────────────────────────────
function getTimeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
