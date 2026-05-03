'use client'

import { Property } from '@/stores/property-store'
import {
  formatPrice,
  formatArea,
  formatPricePerM2,
  getPropertyTypeLabel,
  getStatusLegalColor,
  parseJSON,
  getTrustLevel,
} from '@/lib/property-utils'
import {
  Maximize,
  MapPin,
  TrendingDown,
  TrendingUp,
  Minus,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PropertyComparatorProps {
  properties: Property[]
  onRemove: (id: string) => void
  onClear: () => void
}

interface MetricRow {
  label: string
  key: string
  getValue: (p: Property) => string | number
  best: 'lowest' | 'highest' | 'match'
}

const metrics: MetricRow[] = [
  {
    label: 'Precio Total',
    key: 'price',
    getValue: (p) => p.price,
    best: 'lowest',
  },
  {
    label: 'Precio/m²',
    key: 'precioM2',
    getValue: (p) => p.precioM2,
    best: 'lowest',
  },
  {
    label: 'Área Total',
    key: 'areaTotal',
    getValue: (p) => p.areaTotal,
    best: 'highest',
  },
  {
    label: 'Trust Score',
    key: 'trustScore',
    getValue: (p) => p.trustScore,
    best: 'highest',
  },
  {
    label: 'Estado Legal',
    key: 'statusLegal',
    getValue: (p) => p.statusLegal,
    best: 'match',
  },
  {
    label: 'vs. Zona',
    key: 'comparisonMarket',
    getValue: (p) => `${p.comparisonMarket !== null ? (p.comparisonMarket > 0 ? '+' : '') + p.comparisonMarket.toFixed(1) + '%' : 'N/A'}`,
    best: 'lowest',
  },
]

export function PropertyComparator({ properties, onRemove, onClear }: PropertyComparatorProps) {
  if (properties.length === 0) return null

  // Find best value for each metric
  const bestValues: Record<string, number | string> = {}
  for (const metric of metrics) {
    if (metric.best === 'match') {
      bestValues[metric.key] = 'Saneado'
    } else if (metric.best === 'lowest') {
      const vals = properties.map((p) => (typeof metric.getValue(p) === 'number' ? metric.getValue(p) as number : Infinity)).filter(v => v !== Infinity)
      bestValues[metric.key] = vals.length > 0 ? Math.min(...vals) : ''
    } else {
      const vals = properties.map((p) => (typeof metric.getValue(p) === 'number' ? metric.getValue(p) as number : -Infinity)).filter(v => v !== -Infinity)
      bestValues[metric.key] = vals.length > 0 ? Math.max(...vals) : ''
    }
  }

  const emptySlots = Math.max(0, 3 - properties.length)

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm tracking-wide uppercase">Comparador de Propiedades</h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-gray-400 hover:text-white h-7 text-xs">
          Limpiar
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase w-32">Métrica</th>
              {properties.map((p) => (
                <th key={p.id} className="p-3 text-center min-w-[180px]">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{p.title}</p>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
                      <MapPin className="w-2.5 h-2.5" />
                      {p.district}, {p.department}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onRemove(p.id)}
                    >
                      <XCircle className="w-3 h-3 mr-0.5" />
                      Quitar
                    </Button>
                  </div>
                </th>
              ))}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <th key={`empty-${i}`} className="p-3 text-center min-w-[180px] text-gray-300">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-xs">
                    Agregar propiedad
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Property Image */}
            <tr className="border-t border-gray-100">
              <td className="p-3 text-xs font-medium text-gray-400 uppercase">Vista</td>
              {properties.map((p) => (
                <td key={p.id} className="p-2 text-center">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">Sin imagen</div>
                    )}
                  </div>
                </td>
              ))}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <td key={`empty-img-${i}`} className="p-2" />
              ))}
            </tr>

            {/* Trust Score Visual */}
            <tr className="border-t border-gray-100 bg-gray-50/50">
              <td className="p-3 text-xs font-medium text-gray-400 uppercase">Trust Score</td>
              {properties.map((p) => {
                const trust = getTrustLevel(p.trustScore)
                return (
                  <td key={p.id} className="p-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <Shield className={`w-4 h-4 ${trust.color}`} />
                        <span className={`text-lg font-bold ${trust.color}`}>{p.trustScore}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${trust.color} ${trust.bgColor}`}>
                        {trust.label}
                      </Badge>
                    </div>
                  </td>
                )
              })}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <td key={`empty-trust-${i}`} className="p-2" />
              ))}
            </tr>

            {/* Metrics */}
            {metrics.map((metric) => (
              <tr key={metric.key} className="border-t border-gray-100">
                <td className="p-3 text-xs font-medium text-gray-500">{metric.label}</td>
                {properties.map((p) => {
                  const value = metric.getValue(p)
                  const isBest =
                    metric.best === 'match'
                      ? value === bestValues[metric.key]
                      : typeof value === 'number' && value === bestValues[metric.key]

                  return (
                    <td
                      key={p.id}
                      className={`p-3 text-center font-medium ${
                        isBest ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {metric.key === 'price' && typeof value === 'number' && (
                          <span className="text-xs">{formatPrice(value)}</span>
                        )}
                        {metric.key === 'precioM2' && typeof value === 'number' && (
                          <span className="text-xs">{formatPricePerM2(value)}</span>
                        )}
                        {metric.key === 'areaTotal' && typeof value === 'number' && (
                          <span className="text-xs">{formatArea(value)}</span>
                        )}
                        {metric.key === 'trustScore' && typeof value === 'number' && (
                          <span className="text-xs">{value}/100</span>
                        )}
                        {metric.key === 'statusLegal' && (
                          <div className="flex items-center justify-center gap-1">
                            {value === 'Saneado' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : value === 'En Trámite' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            )}
                            <span className="text-xs">{value as string}</span>
                          </div>
                        )}
                        {metric.key === 'comparisonMarket' && (
                          <span className={`text-xs flex items-center justify-center gap-1 ${
                            p.comparisonMarket !== null && p.comparisonMarket < 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {p.comparisonMarket !== null && p.comparisonMarket < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : p.comparisonMarket !== null && p.comparisonMarket > 5 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                            {value as string}
                          </span>
                        )}
                        {isBest && (
                          <Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200 px-1.5">
                            ★
                          </Badge>
                        )}
                      </div>
                    </td>
                  )
                })}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <td key={`empty-${metric.key}-${i}`} className="p-3 text-center text-gray-300" />
                ))}
              </tr>
            ))}

            {/* Urban Services Summary */}
            <tr className="border-t border-gray-100 bg-gray-50/50">
              <td className="p-3 text-xs font-medium text-gray-400 uppercase">Servicios</td>
              {properties.map((p) => {
                const services = parseJSON<Record<string, string>>(p.urbanServices, {})
                const available = Object.values(services).filter(
                  (v) => v !== 'No disponible' && v !== 'Sin cobertura'
                ).length
                const total = Object.values(services).length
                return (
                  <td key={p.id} className="p-3 text-center">
                    <span className={`text-xs font-semibold ${available === total ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {available}/{total} servicios
                    </span>
                  </td>
                )
              })}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <td key={`empty-svc-${i}`} className="p-3" />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-emerald-600">★</span> indica el mejor valor en cada métrica.
          El comparador prioriza datos técnicos sobre estética.
        </p>
      </div>
    </div>
  )
}
