import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react';
import { getBlogPostBySlug, incrementPostViews, trackEvent } from '../../lib/api';
import { formatFullDate, readingTime } from '../../lib/utils';
import SEO from '../../components/ui/SEO';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getBlogPostBySlug(slug)
      .then((data) => {
        setPost(data);
        incrementPostViews(data.id);
        trackEvent('blog_view', `/blog/${slug}`, { title: data.title });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="section-container py-16 max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section-container py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-brand-600 dark:text-brand-400 hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="py-16">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.cover_image_url}
        type="article"
      />
      <div className="section-container max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to articles
        </Link>

        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {formatFullDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {readingTime(post.content)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {post.views_count || 0} views
            </span>
          </div>
        </header>

        {post.cover_image_url && (
          <div className="rounded-2xl overflow-hidden mb-10">
            <img src={post.cover_image_url} alt={post.title} className="w-full" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert prose-headings:font-display prose-a:text-brand-600 dark:prose-a:text-brand-400 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
