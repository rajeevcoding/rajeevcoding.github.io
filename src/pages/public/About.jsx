import { useEffect, useState } from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import { getProfile, getExperiences, trackEvent } from '../../lib/api';
import { formatDate } from '../../lib/utils';

export default function About() {
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    trackEvent('page_view', '/about');
    getProfile().then(setProfile).catch(() => {});
    getExperiences().then(setExperiences).catch(() => {});
  }, []);

  const skillsByCategory = (profile?.skills || []).reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="pt-16 pb-12">
        <div className="section-container">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {profile?.avatar_url && (
              <div className="shrink-0">
                <div className="w-40 h-40 rounded-2xl overflow-hidden ring-4 ring-brand-200 dark:ring-brand-800">
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white">
                About Me
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {profile?.bio || 'Add your bio from the admin dashboard to tell visitors about yourself.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills ────────────────────────────────── */}
      <section className="py-16 bg-slate-50/50 dark:bg-surface-dark-card/30">
        <div className="section-container">
          <SectionHeading eyebrow="Skills" title="Tech Stack" />
          {Object.keys(skillsByCategory).length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="glass-card p-6">
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.name} className="tag-pill">{skill.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card">
              <p className="text-slate-500 dark:text-slate-400">Add your skills from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Experience Timeline ───────────────────── */}
      <section className="py-16">
        <div className="section-container">
          <SectionHeading eyebrow="Career" title="Experience" />
          {experiences.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="relative border-l-2 border-brand-200 dark:border-brand-800 ml-4">
                {experiences.map((exp, i) => (
                  <div key={exp.id} className="relative pl-8 pb-10 last:pb-0">
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-white dark:ring-surface-dark" />

                    <div className="glass-card p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                          {exp.role}
                        </h3>
                        {!exp.end_date && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={14} /> {exp.company}
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} /> {exp.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} /> {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {exp.description}
                      </p>
                      {exp.tech_stack?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {exp.tech_stack.map((tech) => (
                            <span key={tech} className="tag-pill">{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 glass-card max-w-3xl mx-auto">
              <p className="text-slate-500 dark:text-slate-400">Add your experiences from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
