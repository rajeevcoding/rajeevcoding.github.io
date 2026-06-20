import { useEffect, useState } from 'react';
import { Save, Upload, Plus, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/FormFields';
import { getProfile, updateProfile, uploadFile } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileEditor() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: '', title: '', bio: '', avatar_url: '', resume_url: '',
    social_links: { github: '', linkedin: '', twitter: '', medium: '' },
    skills: [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setForm({
        full_name: data.full_name || '',
        title: data.title || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        resume_url: data.resume_url || '',
        social_links: data.social_links || { github: '', linkedin: '', twitter: '', medium: '' },
        skills: data.skills || [],
      });
    }).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSocialChange = (key, value) =>
    setForm({ ...form, social_links: { ...form.social_links, [key]: value } });

  const addSkill = () => {
    if (!newSkill.name) return;
    setForm({ ...form, skills: [...form.skills, { ...newSkill }] });
    setNewSkill({ name: '', category: newSkill.category });
  };

  const removeSkill = (index) =>
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const path = `${field}/${Date.now()}-${file.name}`;
      const url = await uploadFile('portfolio-assets', path, file);
      setForm({ ...form, [field === 'avatars' ? 'avatar_url' : 'resume_url']: url });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ id: user.id, ...form, updated_at: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const skillCategories = [...new Set(form.skills.map((s) => s.category).filter(Boolean))];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Edit Profile</h1>
        <Button onClick={handleSave} loading={saving}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Basic Info</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Doe" />
            <Input label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Software Engineer" />
          </div>
          <Textarea label="Bio" name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Tell visitors about yourself..." />
        </div>

        {/* Avatar & Resume */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Media</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Avatar</label>
              <div className="flex items-center gap-4">
                {form.avatar_url && (
                  <img src={form.avatar_url} alt="Avatar" className="w-14 h-14 rounded-xl object-cover" />
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'avatars')} />
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Upload size={14} /> Upload
                  </span>
                </label>
              </div>
              <Input className="mt-2" placeholder="or paste URL" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resume PDF</label>
              <label className="cursor-pointer">
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'resumes')} />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Upload size={14} /> Upload PDF
                </span>
              </label>
              <Input className="mt-2" placeholder="or paste URL" value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Social Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {['github', 'linkedin', 'twitter', 'medium'].map((key) => (
              <Input
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={form.social_links[key] || ''}
                onChange={(e) => handleSocialChange(key, e.target.value)}
                placeholder={`https://${key}.com/...`}
              />
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">Skills</h2>
          <div className="flex gap-2">
            <Input placeholder="Skill name" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} />
            <Input placeholder="Category" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              list="skill-categories" />
            <datalist id="skill-categories">
              {skillCategories.map((c) => <option key={c} value={c} />)}
            </datalist>
            <Button onClick={addSkill} variant="secondary" className="shrink-0"><Plus size={16} /></Button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
                  {skill.name}
                  {skill.category && <span className="text-xs opacity-60">({skill.category})</span>}
                  <button onClick={() => removeSkill(i)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
