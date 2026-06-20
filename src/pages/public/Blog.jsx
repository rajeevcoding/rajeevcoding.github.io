import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../components/ui/SectionHeading';
import { getBlogPosts, trackEvent } from '../../lib/api';
import { formatFullDate, readingTime } from '../../lib/utils';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [tagFilter, setTagFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('page_view', '/blog');
    getBlogPosts()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allTags = [...new Set(posts.flatMap((p) => p.tags || []))];
  const filtered = tagFilter === 'all' ? posts : posts.filter((p) => p.tags?.includes(tagFilter));

  return (
    <section className="py-16">
      <div className="section-container">
        <SectionHeading
          eyebrow="Blog"
          title="Articles"
          description="Thoughts on engineering, design, and technology"
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setTagFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                tagFilter === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  tagFilter === tag
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="glass-card p-6 block hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {post.tags?.map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatFullDate(post.published_at)} · {readingTime(post.content)}
                  </span>
                </div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card max-w-3xl mx-auto">
            <p className="text-slate-500 dark:text-slate-400">
              {posts.length === 0
                ? 'Write your first blog post from the admin dashboard.'
                : 'No posts match this tag.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
