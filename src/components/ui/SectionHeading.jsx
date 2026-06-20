export default function SectionHeading({ eyebrow, title, description, center = true }) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase
                         bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
