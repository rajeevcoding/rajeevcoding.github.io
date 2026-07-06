import { useState, useRef, useEffect } from 'react';
import { Share2, Link, Check, Twitter, Linkedin, Mail } from 'lucide-react';

export default function ShareButton({ title, text, url }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  const shareUrl = url || window.location.href;
  const shareText = text || '';
  const shareTitle = title || '';

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleShare = async () => {
    // Use native Web Share API on mobile / supported browsers
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to menu
        if (err.name === 'AbortError') return;
      }
    }
    // Fallback: show share menu
    setShowMenu(!showMenu);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowMenu(false); }, 1500);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowMenu(false); }, 1500);
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${shareTitle}\n\n${shareText}`);
  const encodedTitle = encodeURIComponent(shareTitle);

  const socialLinks = [
    {
      label: 'Twitter / X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`,
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                   bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400
                   border border-slate-200 dark:border-slate-700
                   hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400
                   transition-all"
      >
        <Share2 size={16} /> Share
      </button>

      {/* Fallback dropdown for desktop / browsers without Web Share API */}
      {showMenu && (
        <div className="absolute bottom-full mb-2 right-0 w-52 bg-white dark:bg-surface-dark-card rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Link size={15} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <s.icon size={15} /> {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
