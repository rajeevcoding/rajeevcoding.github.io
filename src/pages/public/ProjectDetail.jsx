import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getProjectBySlug, trackEvent } from '../../lib/api';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getProjectBySlug(slug)
      .then((data) => {
        setProject(data);
        trackEvent('project_click', `/projects/${slug}`, { title: data.title });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="section-container py-16 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-6" />
        <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-2xl mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="section-container py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Project not found</h1>
        <Link to="/projects" className="mt-4 inline-block text-brand-600 dark:text-brand-400 hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="section-container max-w-4xl">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to projects
        </Link>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          {project.title}
        </h1>
        <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">{project.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                <ExternalLink size={14} /> Live Demo
              </Button>
            </a>
          )}
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <Github size={14} /> Source Code
              </Button>
            </a>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tech_stack?.map((tech) => (
            <span key={tech} className="tag-pill">{tech}</span>
          ))}
        </div>

        {project.image_url && (
          <div className="mt-8 rounded-2xl overflow-hidden">
            <img src={project.image_url} alt={project.title} className="w-full" />
          </div>
        )}

        {project.content && (
          <div className="mt-10 prose prose-lg dark:prose-invert prose-headings:font-display prose-a:text-brand-600 dark:prose-a:text-brand-400 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </section>
  );
}
