import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: string
  accent?: 'purple' | 'green' | 'blue' | 'amber'
}

const accentStyles = {
  purple: 'bg-brand-50 text-brand-600 ring-brand-100',
  green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  blue: 'bg-sky-50 text-sky-600 ring-sky-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = 'purple',
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className="mt-2 text-xs font-medium text-emerald-600">{trend}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ring-1 ${accentStyles[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
