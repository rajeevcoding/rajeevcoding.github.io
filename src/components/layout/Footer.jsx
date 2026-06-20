import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';

const socialLinks = [
  { icon: Github,   href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter,  href: '#', label: 'Twitter' },
  { icon: Mail,     href: '#', label: 'Email' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-700/50 mt-20">
      <div className="section-container py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: branding */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-display font-bold text-lg gradient-text">Rajeev Ranjan</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Built with <Heart size={14} className="text-accent-pink" /> and React
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 
                           hover:text-brand-600 dark:hover:text-brand-400
                           hover:bg-slate-100 dark:hover:bg-slate-800
                           transition-all duration-200"
                aria-label={link.label}
              >
                <link.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/30 dark:border-slate-700/30 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {year} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
