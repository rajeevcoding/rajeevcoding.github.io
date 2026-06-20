import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input, Textarea, Toggle } from '../../components/ui/FormFields';
import Modal from '../../components/ui/Modal';
import { getExperiences, upsertExperience, deleteExperience } from '../../lib/api';

const emptyExp = {
  company: '', role: '', location: '', start_date: '', end_date: '',
  description: '', tech_stack: [], sort_order: 0, is_visible: true,
};

export default function ExperiencesManager() {
  const [experiences, setExperiences] = useState([]);
  const [editing, setEditing] = useState(null); // null or form object
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => getExperiences(false).then(setExperiences).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => setEditing({ ...emptyExp, sort_order: experiences.length });
  const openEdit = (exp) => setEditing({ ...exp });
  const close = () => { setEditing(null); setTechInput(''); };

  const handleChange = (e) => setEditing({ ...editing, [e.target.name]: e.target.value });

  const addTech = () => {
    if (!techInput.trim()) return;
    setEditing({ ...editing, tech_stack: [...(editing.tech_stack || []), techInput.trim()] });
    setTechInput('');
  };
  const removeTech = (i) => setEditing({ ...editing, tech_stack: editing.tech_stack.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertExperience(editing);
      await load();
      close();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this experience?')) return;
    await deleteExperience(id);
    await load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Experiences</h1>
        <Button onClick={openNew}><Plus size={16} /> Add Experience</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="glass-card p-5 animate-pulse h-20" />)}
        </div>
      ) : experiences.length > 0 ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div key={exp.id} className="glass-card p-5 flex items-center gap-4">
              <GripVertical size={16} className="text-slate-300 dark:text-slate-600 shrink-0 cursor-grab" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{exp.role}</h3>
                  {!exp.is_visible && <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-700 text-slate-500">Hidden</span>}
                  {!exp.end_date && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">Current</span>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{exp.company} {exp.location && `· ${exp.location}`}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(exp)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No experiences yet</p>
          <Button onClick={openNew}><Plus size={16} /> Add Your First Experience</Button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={close} title={editing?.id ? 'Edit Experience' : 'Add Experience'} wide>
        {editing && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Role *" name="role" value={editing.role} onChange={handleChange} placeholder="Software Engineer" />
              <Input label="Company *" name="company" value={editing.company} onChange={handleChange} placeholder="Acme Corp" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Location" name="location" value={editing.location} onChange={handleChange} placeholder="San Francisco, CA" />
              <Input label="Start Date *" name="start_date" type="date" value={editing.start_date} onChange={handleChange} />
              <Input label="End Date" name="end_date" type="date" value={editing.end_date || ''} onChange={handleChange} />
            </div>
            <p className="text-xs text-slate-400">Leave end date empty for current role.</p>
            <Textarea label="Description" name="description" value={editing.description} onChange={handleChange} rows={4} placeholder="What did you do?" />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tech Stack</label>
              <div className="flex gap-2">
                <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="e.g. React" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                <Button onClick={addTech} variant="secondary" className="shrink-0">Add</Button>
              </div>
              {editing.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editing.tech_stack.map((t, i) => (
                    <span key={i} className="tag-pill cursor-pointer hover:line-through" onClick={() => removeTech(i)}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <Input label="Sort Order" name="sort_order" type="number" value={editing.sort_order} onChange={handleChange} />
              <Toggle label="Visible on site" checked={editing.is_visible} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" onClick={close}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save Experience</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
