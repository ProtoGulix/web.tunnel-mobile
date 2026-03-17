export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="bg-white border-b border-tunnel-border px-4 pt-4 pb-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-tunnel-text">{title}</h1>
          {subtitle && <p className="text-xs text-tunnel-muted mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
