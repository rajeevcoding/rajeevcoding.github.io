import { useEffect } from 'react';

/**
 * Simple SEO component that updates document head
 * For a SPA on GitHub Pages, this updates meta tags dynamically.
 * For full SSR/SSG SEO, consider frameworks like Next.js or Astro.
 */
export default function SEO({ title, description, image, url, type = 'website' }) {
  useEffect(() => {
    const siteName = 'Rajeev Ranjan';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const desc = description || 'Software Engineer portfolio — projects, blog, and more.';

    document.title = fullTitle;

    const setMeta = (property, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          el.setAttribute('property', property);
        } else {
          el.setAttribute('name', property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', desc);
    setMeta('og:title', fullTitle);
    setMeta('og:description', desc);
    setMeta('og:type', type);
    if (image) setMeta('og:image', image);
    if (url) setMeta('og:url', url);
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    if (image) setMeta('twitter:image', image);

    return () => {
      document.title = siteName;
    };
  }, [title, description, image, url, type]);

  return null;
}
