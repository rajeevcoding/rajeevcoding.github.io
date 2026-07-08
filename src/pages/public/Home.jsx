import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Eye, Github, Linkedin, Twitter } from 'lucide-react';
import Button from '../../components/ui/Button';
import SectionHeading from '../../components/ui/SectionHeading';
import SEO from '../../components/ui/SEO';
import Modal from '../../components/ui/Modal';
import { getProjects, getBlogPosts, getProfile, trackEvent } from '../../lib/api';

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadResume = async () => {
    if (!profile?.resume_url || downloading) return;
    setDownloading(true);
    try {
      // Fetch + blob so the download works even though the file lives on
      // a different origin (Supabase Storage), where the `download`
      // attribute alone would be ignored by most browsers.
      const res = await fetch(profile.resume_url);
      if (!res.ok) throw new Error('Failed to fetch resume');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const ext = profile.resume_url.split('.').pop().split('?')[0] || 'pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(profile?.full_name || 'resume').replace(/\s+/g, '_')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackEvent('resume_download', '/');
    } catch {
      // Fallback: open in a new tab if the fetch/blob approach fails
      // (e.g. CORS not enabled on the storage bucket).
      window.open(profile.resume_url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    trackEvent('page_view', '/');
    getProfile().then(setProfile).catch(() => {});
    getProjects().then((data) => setProjects(data?.filter((p) => p.is_featured)?.slice(0, 3) || [])).catch(() => {});
    getBlogPosts().then((data) => setPosts(data?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <>
      <SEO title="Home" description={profile?.bio} />
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Aurora background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="aurora-blob w-96 h-96 bg-brand-500 top-[-10%] left-[-5%]" />
          <div className="aurora-blob w-80 h-80 bg-accent-pink top-[20%] right-[-5%] animation-delay-2000" />
          <div className="aurora-blob w-72 h-72 bg-accent-teal bottom-[-10%] left-[30%] animation-delay-4000" />
        </div>

        <div className="section-container pt-20 pb-28 sm:pt-28 sm:pb-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                            bg-brand-100/80 dark:bg-brand-900/30 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                Available for opportunities
              </span>
            </div>

            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-tight">
              <span className="text-slate-900 dark:text-white">Hi, I'm </span>
              <span className="gradient-text">{profile?.full_name || 'Your Name'}</span>
            </h1>

            <p className="mt-6 text-xl sm:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {profile?.bio || 'Software Engineer crafting modern web experiences with clean code and thoughtful design.'}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/projects">
                <Button size="lg">
                  View My Work <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Get in Touch
                </Button>
              </Link>
              {profile?.resume_url && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      trackEvent('resume_view', '/');
                      setResumeOpen(true);
                    }}
                  >
                    <Eye size={18} /> View Resume
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleDownloadResume}
                    loading={downloading}
                  >
                    <Download size={18} /> Download
                  </Button>
                </>
              )}
            </div>

            <div className="mt-10 flex items-center gap-4">
              {[
                { icon: Github, href: profile?.social_links?.github },
                { icon: Linkedin, href: profile?.social_links?.linkedin },
                { icon: Twitter, href: profile?.social_links?.twitter },
              ]
                .filter((s) => s.href)
                .map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm
                             text-slate-500 hover:text-brand-600 dark:hover:text-brand-400
                             hover:bg-white dark:hover:bg-slate-800 transition-all duration-200
                             border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Projects ───────────────────────── */}
      <section className="py-20 bg-slate-50/50 dark:bg-surface-dark-card/30">
        <div className="section-container">
          <SectionHeading
            eyebrow="Projects"
            title="Featured Work"
            description="A selection of projects I've built recently"
          />
          {projects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  {project.image_url && (
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech_stack?.slice(0, 4).map((tech) => (
                      <span key={tech} className="tag-pill">{tech}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card">
              <p className="text-slate-500 dark:text-slate-400">
                Projects coming soon. Add them from the admin dashboard.
              </p>
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/projects">
              <Button variant="secondary">
                View All Projects <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest Blog Posts ───────────────────────── */}
      <section className="py-20">
        <div className="section-container">
          <SectionHeading
            eyebrow="Blog"
            title="Latest Articles"
            description="Thoughts on engineering, design, and technology"
          />
          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card">
              <p className="text-slate-500 dark:text-slate-400">
                Blog posts coming soon. Write your first post from the admin dashboard.
              </p>
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/blog">
              <Button variant="secondary">
                Read All Articles <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ──────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora opacity-5 dark:opacity-10 -z-10" />
        <div className="section-container">
          <div className="glass-card p-8 sm:p-12 text-center max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Stay in the loop
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Get occasional updates on new projects, articles, and insights. No spam.
            </p>
            <div className="mt-6">
              <Link to="/newsletter">
                <Button>Subscribe to Newsletter</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Resume Viewer Modal ─────────────────────── */}
      <Modal open={resumeOpen} onClose={() => setResumeOpen(false)} title="Resume" wide>
        <div className="h-[75vh]">
          <iframe
            src={profile?.resume_url}
            title="Resume"
            className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleDownloadResume} loading={downloading}>
            <Download size={18} /> Download
          </Button>
        </div>
      </Modal>
    </>
  );
}
