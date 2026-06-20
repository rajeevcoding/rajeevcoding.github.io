import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Star, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input, Textarea, Toggle } from '../../components/ui/FormFields';
import Modal from '../../components/ui/Modal';
import { getProjects, upsertProject, deleteProject, uploadFile } from '../../lib/api';
import { slugify } from '../../lib/utils';

const emptyProject = {
  title: '', slug: '', description: '', content: '', tech_stack: [],
  image_url: '', live_url: '', repo_url: '', is_featured: false, is_visible: true, sort_order: 0,
};

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => getProjects(false).then(setProjects).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => setEditing({ ...emptyProject, sort_order: projects.length });
  const openEdit = (p) => setEditing({ ...p });
  const close = () => { setEditing(null); setTechInput(''); };

  const handleChange = (e) => {
    const updates = { [e.target.name]: e.target.value };
    if (e.target.name === 'title' && !editing.id) updates.slug = slugify(e.target.value);
    setEditing({ ...editing, ...updates });
  };

  const addTech = () => {
    if (!techInput.trim()) return;
    setEditing({ ...editing, tech_stack: [...(editing.tech_stack || []), techInput.trim()] });
    setTechInput('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile('portfolio-assets', `projects/${Date.now()}-${file.name}`, file);
      setEditing({ ...editing, image_url: url });
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!editing.title || !editing.slug) return;
    setSaving(true);
    try {
      await upsertProject(editing);
      await load();
      close();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    await load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Projects</h1>
        <Button onClick={openNew}><Plus size={16} /> Add Project</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="glass-card p-5 animate-pulse h-32" />)}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="glass-card overflow-hidden">
              {p.image_url && (
                <div className="h-32 bg-slate-100 dark:bg-slate-800">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.is_featured && <Star size={14} className="text-accent-amber fill-accent-amber" />}
                    {!p.is_visible && <EyeOff size={14} className="text-slate-400" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tech_stack?.slice(0, 4).map(t => <span key={t} className="tag-pill text-[10px] px-2 py-0.5">{t}</span>)}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors ml-auto">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No projects yet</p>
          <Button onClick={openNew}><Plus size={16} /> Add Your First Project</Button>
        </div>
      )}

      <Modal open={!!editing} onClose={close} title={editing?.id ? 'Edit Project' : 'New Project'} wide>
        {editing && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Title *" name="title" value={editing.title} onChange={handleChange} />
              <Input label="Slug *" name="slug" value={editing.slug} onChange={handleChange} />
            </div>
            <Input label="Short Description" name="description" value={editing.description} onChange={handleChange} placeholder="One-liner about the project" />
            <Textarea label="Full Content (Markdown)" name="content" value={editing.content} onChange={handleChange} rows={8} placeholder="Detailed project writeup..." />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Live URL" name="live_url" value={editing.live_url} onChange={handleChange} placeholder="https://..." />
              <Input label="Repo URL" name="repo_url" value={editing.repo_url} onChange={handleChange} placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Image</label>
              <div className="flex items-center gap-3">
                {editing.image_url && <img src={editing.image_url} alt="" className="w-20 h-14 rounded-lg object-cover" />}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  Upload
                </label>
                <Input className="flex-1" placeholder="or paste URL" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tech Stack</label>
              <div className="flex gap-2">
                <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="e.g. React" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                <Button onClick={addTech} variant="secondary" className="shrink-0">Add</Button>
              </div>
              {editing.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editing.tech_stack.map((t, i) => (
                    <span key={i} className="tag-pill cursor-pointer hover:line-through" onClick={() => setEditing({ ...editing, tech_stack: editing.tech_stack.filter((_, idx) => idx !== i) })}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Input label="Sort Order" name="sort_order" type="number" value={editing.sort_order} onChange={handleChange} className="w-24" />
              <Toggle label="Featured" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
              <Toggle label="Visible" checked={editing.is_visible} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" onClick={close}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save Project</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
