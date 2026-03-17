const variants = {
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  violet: 'bg-violet-100 text-violet-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
  slate: 'bg-slate-100 text-slate-600',
}

export function Badge({ children, variant = 'slate', mono = false, className = '' }) {
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
      ${variants[variant] ?? variants.slate}
      ${mono ? 'font-mono' : ''}
      ${className}
    `}>
      {children}
    </span>
  )
}
