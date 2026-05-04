'use client'

import {
  Building2,
  Shield,
  Star,
  MapPin,
  BarChart3,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/property-utils'

interface AdminStats {
  total: number
  active: number
  featured: number
  avgTrust: number
  totalValue: number
  byDepartment: Record<string, number>
  byStatusLegal: { Saneado: number; 'En Trámite': number; Posesión: number }
}

interface AdminDashboardProps {
  stats: AdminStats
  loading: boolean
}

export function AdminDashboard({ stats, loading }: AdminDashboardProps) {
  const statCards = [
    {
      label: 'Total Propiedades',
      value: stats.total,
      icon: Building2,
      color: 'text-gray-900',
      bgColor: 'bg-gray-100',
      sublabel: `${stats.active} activas`,
    },
    {
      label: 'Valor Total Catálogo',
      value: formatPrice(stats.totalValue),
      icon: BarChart3,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      sublabel: 'Suma de todos los precios',
    },
    {
      label: 'Trust Score Promedio',
      value: stats.avgTrust,
      icon: Shield,
      color: stats.avgTrust >= 75 ? 'text-emerald-700' : 'text-amber-700',
      bgColor: stats.avgTrust >= 75 ? 'bg-emerald-50' : 'bg-amber-50',
      sublabel: 'de 100',
    },
    {
      label: 'Propiedades Destacadas',
      value: stats.featured,
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      sublabel: `de ${stats.total} totales`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="p-4 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{card.sublabel}</p>
          </Card>
        ))}
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Department */}
        <Card className="p-5 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            Por Departamento
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.byDepartment)
              .sort((a, b) => b[1] - a[1])
              .map(([dept, count]) => {
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                return (
                  <div key={dept} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20 shrink-0">{dept}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-12 text-right">{count}</span>
                  </div>
                )
              })}
          </div>
        </Card>

        {/* By Legal Status */}
        <Card className="p-5 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            Estado Legal
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Saneado', count: stats.byStatusLegal.Saneado, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
              { label: 'En Trámite', count: stats.byStatusLegal['En Trámite'], color: 'bg-amber-500', textColor: 'text-amber-700' },
              { label: 'Posesión', count: stats.byStatusLegal.Posesión, color: 'bg-red-500', textColor: 'text-red-700' },
            ].map((item) => {
              const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-20 shrink-0 ${item.textColor}`}>{item.label}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-12 text-right">{item.count}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Propiedades 100% documentadas</span>
              <span className="text-sm font-bold text-emerald-700">
                {stats.total > 0 ? Math.round((stats.byStatusLegal.Saneado / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
