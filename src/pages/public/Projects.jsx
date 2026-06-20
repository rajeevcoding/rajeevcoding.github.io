import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';
import SectionHeading from '../../components/ui/SectionHeading';
import { getProjects, trackEvent } from '../../lib/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', '/projects');
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique tech across projects
  const allTech = [...new Set(projects.flatMap((p) => p.tech_stack || []))];

  const filtered = filter === 'all'
    ? projects
    : projects.filter((p) => p.tech_stack?.includes(filter));

  return (
    <section className="py-16">
      <div className="section-container">
        <SectionHeading
          eyebrow="Portfolio"
          title="Projects"
          description="Things I've built, contributed to, and experimented with"
        />

        {/* Filter chips */}
        {allTech.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {allTech.map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === tech
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-700 mb-4" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="glass-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                {project.image_url && (
                  <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech_stack?.map((tech) => (
                      <span key={tech} className="tag-pill">{tech}</span>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <ExternalLink size={14} /> Live Demo
                      </a>
                    )}
                    {project.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:underline"
                      >
                        <Github size={14} /> Source
                      </a>
                    )}
                    <Link
                      to={`/projects/${project.slug}`}
                      className="ml-auto text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card">
            <p className="text-slate-500 dark:text-slate-400">
              {projects.length === 0
                ? 'Add projects from the admin dashboard.'
                : 'No projects match this filter.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
