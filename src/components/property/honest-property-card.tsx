'use client'

import { Property } from '@/stores/property-store'
import { TrustScoreWidget } from './trust-score-widget'
import {
  formatPrice,
  formatArea,
  formatPricePerM2,
  getPropertyTypeLabel,
  getStatusLegalColor,
  parseJSON,
} from '@/lib/property-utils'
import {
  MapPin,
  Ruler,
  Maximize,
  BedDouble,
  Bath,
  Car,
  GitCompareArrows,
  Eye,
  TrendingDown,
  TrendingUp,
  Minus,
  Building2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface HonestPropertyCardProps {
  property: Property
  onSelect: (property: Property) => void
  onCompare: (property: Property) => void
  isComparing?: boolean
}

export function HonestPropertyCard({
  property,
  onSelect,
  onCompare,
  isComparing = false,
}: HonestPropertyCardProps) {
  const urbanServices = parseJSON<Record<string, string>>(property.urbanServices, {})
  const statusColor = getStatusLegalColor(property.statusLegal)
  const comparisonPercent = property.comparisonMarket ?? 0

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200"
      onClick={() => onSelect(property)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Trust Score Badge */}
        <div className="absolute top-3 left-3">
          <TrustScoreWidget
            score={property.trustScore}
            statusLegal={property.statusLegal}
            compact
          />
        </div>

        {/* Legal Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className={`${statusColor.bgColor} ${statusColor.color} text-xs font-semibold`}>
            {statusColor.label}
          </Badge>
        </div>

        {/* Comparison Market Badge */}
        {comparisonPercent !== 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="secondary"
              className={`text-xs font-semibold ${
                comparisonPercent < 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : comparisonPercent > 5
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {comparisonPercent < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : comparisonPercent > 5 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <Minus className="w-3 h-3 mr-1" />
              )}
              {comparisonPercent > 0 ? '+' : ''}
              {comparisonPercent.toFixed(1)}% vs zona
            </Badge>
          </div>
        )}

        {/* Property Type */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-gray-900 text-white text-xs">
            {getPropertyTypeLabel(property.propertyType)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Location */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{property.district}, {property.province}, {property.department}</span>
        </div>

        {/* Hard Data Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Precio Total</p>
            <p className="text-sm font-bold text-gray-900">{formatPrice(property.price)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Precio/m²</p>
            <p className="text-sm font-bold text-gray-900">{formatPricePerM2(property.precioM2)}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" />
            <span>{formatArea(property.areaTotal)}</span>
          </div>
          {property.areaBuilt && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              <span>{formatArea(property.areaBuilt)} const.</span>
            </div>
          )}
          {property.dormitorios && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />
              <span>{property.dormitorios}D</span>
            </div>
          )}
          {property.banos && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              <span>{property.banos}B</span>
            </div>
          )}
          {property.estacionamiento && (
            <div className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              <span>{property.estacionamiento}</span>
            </div>
          )}
        </div>

        {/* Urban Services Status */}
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 uppercase font-medium mb-1.5">Servicios Urbanos</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(urbanServices).map(([key, value]) => (
              <Badge
                key={key}
                variant="outline"
                className={`text-[10px] px-2 py-0 ${
                  value === 'No disponible' || value === 'Sin cobertura'
                    ? 'border-red-200 text-red-600 bg-red-50'
                    : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
              </Badge>
            ))}
          </div>
        </div>

        {/* Honest Technical Note */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 mb-3">
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <span className="font-semibold">Nota técnica:</span>{' '}
            {property.cargasLegales || 'Verificar documentación'}
            {property.impuestoPredial ? ` • Predial: ${formatPrice(property.impuestoPredial)}/año` : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="flex-1 text-xs h-9"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(property)
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Ver Ficha Técnica
          </Button>
          <Button
            variant={isComparing ? 'default' : 'outline'}
            size="sm"
            className={`h-9 w-9 p-0 ${isComparing ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onCompare(property)
            }}
          >
            <GitCompareArrows className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
