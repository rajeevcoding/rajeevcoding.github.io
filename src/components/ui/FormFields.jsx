import { cn } from '../../lib/utils';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700',
          'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm',
          error && 'border-red-400 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <textarea
        className={cn(
          'w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700',
          'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm resize-none',
          error && 'border-red-400 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, options, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <select
        className={cn(
          'w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700',
          'text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
    </label>
  );
}
