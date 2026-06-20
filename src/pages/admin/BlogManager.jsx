import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, ArrowLeft, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../../components/ui/Button';
import { Input, Textarea, Toggle } from '../../components/ui/FormFields';
import { getBlogPosts, upsertBlogPost, deleteBlogPost, uploadFile } from '../../lib/api';
import { slugify, formatFullDate, readingTime } from '../../lib/utils';

// ── Blog Post List ────────────────────────────────
export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => getBlogPosts(false).then(setPosts).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await deleteBlogPost(id);
    await load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Blog Posts</h1>
        <Button onClick={() => navigate('/admin/blog/new')}><Plus size={16} /> New Post</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card p-5 animate-pulse h-20" />)}</div>
      ) : posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="glass-card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    post.is_published
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  {post.published_at && <span>{formatFullDate(post.published_at)}</span>}
                  <span>{readingTime(post.content)}</span>
                  <span><Eye size={12} className="inline" /> {post.views_count || 0}</span>
                  {post.tags?.map(t => <span key={t} className="tag-pill text-[10px] px-2 py-0">{t}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/admin/blog/${post.id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <Pencil size={16} />
                </Link>
                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No blog posts yet</p>
          <Button onClick={() => navigate('/admin/blog/new')}><Plus size={16} /> Write Your First Post</Button>
        </div>
      )}
    </div>
  );
}

// ── Blog Post Editor ──────────────────────────────
export function BlogEditor() {
  const { id } = useParams(); // 'new' or uuid
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
    tags: [], is_published: false, published_at: null,
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      getBlogPosts(false).then((posts) => {
        const post = posts.find((p) => p.id === id);
        if (post) setForm(post);
      }).catch(() => {});
    }
  }, [id]);

  const handleChange = (e) => {
    const updates = { [e.target.name]: e.target.value };
    if (e.target.name === 'title' && (!form.id || id === 'new')) updates.slug = slugify(e.target.value);
    setForm({ ...form, ...updates });
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
    setTagInput('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile('portfolio-assets', `blog/${Date.now()}-${file.name}`, file);
      setForm({ ...form, cover_image_url: url });
    } catch (err) { console.error(err); }
  };

  const handleSave = async (publish = null) => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    try {
      const updates = { ...form, updated_at: new Date().toISOString() };
      if (publish !== null) {
        updates.is_published = publish;
        if (publish && !updates.published_at) updates.published_at = new Date().toISOString();
      }
      // Remove id if new
      if (id === 'new') delete updates.id;
      await upsertBlogPost(updates);
      navigate('/admin/blog');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={16} /> Back to posts
        </Link>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
            <Eye size={16} /> {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleSave(false)} loading={saving}>
            <Save size={16} /> Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave(true)} loading={saving}>
            {form.is_published ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="glass-card p-8">
          <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white mb-2">{form.title || 'Untitled'}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {form.tags?.map(t => <span key={t} className="tag-pill">{t}</span>)}
          </div>
          {form.cover_image_url && <img src={form.cover_image_url} alt="" className="w-full rounded-xl mb-6" />}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Title *" name="title" value={form.title} onChange={handleChange} placeholder="Your post title" />
              <Input label="Slug *" name="slug" value={form.slug} onChange={handleChange} />
            </div>
            <Input label="Excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Short summary for listings" />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cover Image</label>
              <div className="flex items-center gap-3">
                {form.cover_image_url && <img src={form.cover_image_url} alt="" className="w-20 h-14 rounded-lg object-cover" />}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  Upload
                </label>
                <Input className="flex-1" placeholder="or paste URL" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tags</label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. React" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <Button onClick={addTag} variant="secondary" className="shrink-0">Add</Button>
              </div>
              {form.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((t, i) => (
                    <span key={i} className="tag-pill cursor-pointer hover:line-through" onClick={() => setForm({ ...form, tags: form.tags.filter((_, idx) => idx !== i) })}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Markdown editor */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content (Markdown)</label>
              <span className="text-xs text-slate-400">{readingTime(form.content)}</span>
            </div>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={20}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-y"
              placeholder="Write your post in Markdown..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
