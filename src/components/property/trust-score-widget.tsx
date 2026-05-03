'use client'

import { getTrustLevel } from '@/lib/property-utils'
import { Shield, FileCheck, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

interface TrustScoreWidgetProps {
  score: number
  statusLegal: string
  cargasLegales?: string | null
  certificadoBusqueda?: string | null
  compact?: boolean
}

export function TrustScoreWidget({
  score,
  statusLegal,
  cargasLegales,
  certificadoBusqueda,
  compact = false,
}: TrustScoreWidgetProps) {
  const trust = getTrustLevel(score)
  
  const scoreColor = score >= 85 
    ? 'stroke-emerald-500' 
    : score >= 70 
    ? 'stroke-green-500' 
    : score >= 50 
    ? 'stroke-amber-500' 
    : 'stroke-red-500'
  
  const circumference = 2 * Math.PI * 40
  const progress = (score / 100) * circumference
  const dashOffset = circumference - progress

  const legalItems = [
    {
      label: 'Estado Legal',
      value: statusLegal,
      status: statusLegal === 'Saneado' ? 'ok' : statusLegal === 'En Trámite' ? 'warning' : 'danger',
    },
    {
      label: 'Certificado de Búsqueda',
      value: certificadoBusqueda || 'No disponible',
      status: certificadoBusqueda?.includes('Negativo') ? 'ok' : certificadoBusqueda?.includes('Pendiente') ? 'warning' : 'danger',
    },
    {
      label: 'Cargas y Gravámenes',
      value: cargasLegales || 'No verificado',
      status: cargasLegales?.includes('Sin cargas') ? 'ok' : cargasLegales?.includes('trámite') ? 'warning' : 'danger',
    },
  ]

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${trust.bgColor}`}>
        <Shield className={`w-4 h-4 ${trust.color}`} />
        <span className={`text-sm font-bold ${trust.color}`}>{score}/100</span>
        <span className={`text-xs ${trust.color}`}>• {trust.label}</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white px-5 py-3 flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-sm tracking-wide uppercase">Reporte de Confianza</h3>
      </div>

      <div className="p-5">
        {/* Score Circle */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="stroke-gray-100"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{score}</span>
              <span className="text-xs text-gray-500">de 100</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className={`text-sm font-bold ${trust.color}`}>{trust.label}</span>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{trust.description}</p>
          </div>
        </div>

        {/* Legal Status Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verificación Legal</h4>
          {legalItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              {item.status === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              ) : item.status === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-500 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 bg-gray-50 rounded-lg p-3">
          <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Trust Score es un indicador basado en verificación documentaria. No reemplaza la asesoría legal profesional.
            Consulte a un abogado antes de cualquier transacción.
          </p>
        </div>
      </div>
    </div>
  )
}
