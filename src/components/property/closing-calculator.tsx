'use client'

import { useState } from 'react'
import { formatPriceDetailed, calculateClosingCosts } from '@/lib/property-utils'
import { Calculator, Info, FileText, Receipt, Landmark, Stamp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function ClosingCalculator() {
  const [price, setPrice] = useState<string>('300000')

  const numericPrice = parseFloat(price) || 0
  const costs = calculateClosingCosts(numericPrice)

  const totalBreakdown = [
    {
      label: 'Precio de Compra',
      value: costs.precio,
      icon: Receipt,
      color: 'text-gray-900',
      bgColor: 'bg-gray-100',
      percentage: numericPrice > 0 ? (costs.precio / costs.total) * 100 : 0,
    },
    {
      label: 'Alcabala (3%)',
      value: costs.alcabala,
      icon: Landmark,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      percentage: numericPrice > 0 ? (costs.alcabala / costs.total) * 100 : 0,
    },
    {
      label: 'Gastos Notariales (~1.5%)',
      value: costs.gastosNotariales,
      icon: FileText,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      percentage: numericPrice > 0 ? (costs.gastosNotariales / costs.total) * 100 : 0,
    },
    {
      label: 'Gastos Registrales (~0.3%)',
      value: costs.gastosRegistrales,
      icon: Stamp,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      percentage: numericPrice > 0 ? (costs.gastosRegistrales / costs.total) * 100 : 0,
    },
  ]

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-900 text-white px-5 py-3 flex items-center gap-2">
        <Calculator className="w-5 h-5" />
        <h3 className="font-semibold text-sm tracking-wide uppercase">Calculadora de Cierre</h3>
      </div>

      <div className="p-5">
        {/* Price Input */}
        <div className="mb-6">
          <Label htmlFor="price-input" className="text-sm font-medium text-gray-700 mb-2 block">
            Precio de la Propiedad (S/)
          </Label>
          <Input
            id="price-input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="text-lg font-bold h-12"
            min="0"
            step="10000"
          />
          <p className="text-xs text-gray-400 mt-1">
            Ingrese el precio de venta o use el valor de una propiedad
          </p>
        </div>

        {/* Visual Bar */}
        {numericPrice > 0 && (
          <div className="mb-6">
            <div className="flex rounded-lg overflow-hidden h-8">
              {totalBreakdown.map((item) => (
                <div
                  key={item.label}
                  className={`${item.bgColor} flex items-center justify-center`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.label}: ${formatPriceDetailed(item.value)}`}
                >
                  {item.percentage > 8 && (
                    <span className={`text-[10px] font-bold ${item.color}`}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-3 mb-5">
          {totalBreakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  {item.percentage > 0 && (
                    <p className="text-[10px] text-gray-400">{item.percentage.toFixed(1)}% del total</p>
                  )}
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900">{formatPriceDetailed(item.value)}</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Total */}
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Inversión Total Real</p>
          <p className="text-3xl font-bold text-white">{formatPriceDetailed(costs.total)}</p>
          <p className="text-xs text-gray-400 mt-1">
            +{formatPriceDetailed(costs.total - costs.precio)} en gastos de cierre
            ({((costs.total - costs.precio) / costs.precio * 100).toFixed(1)}% adicional)
          </p>
        </div>

        {/* Info */}
        <div className="mt-4 flex items-start gap-2 bg-amber-50 rounded-lg p-3">
          <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <strong>Nota:</strong> Cálculo basado en tarifas promedio de Ica/Lima 2025.
            La Alcabala se calcula sobre el 80% del valor de venta (autoavalúo).
            Las primeras 15 UIT (S/77,250) están inafectas.
            Los gastos notariales y registrales pueden variar según el valor y ubicación.
          </p>
        </div>
      </div>
    </div>
  )
}
