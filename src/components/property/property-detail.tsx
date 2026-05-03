'use client'

import { Property } from '@/stores/property-store'
import { TrustScoreWidget } from './trust-score-widget'
import {
  formatPrice,
  formatArea,
  formatPricePerM2,
  formatPriceDetailed,
  getPropertyTypeLabel,
  parseJSON,
  getWhatsAppLink,
} from '@/lib/property-utils'
import {
  MapPin,
  Maximize,
  Ruler,
  BedDouble,
  Bath,
  Car,
  Building2,
  Calendar,
  Hammer,
  ArrowLeft,
  MessageCircle,
  Play,
  Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PropertyDetailProps {
  property: Property
  onBack: () => void
}

export function PropertyDetail({ property, onBack }: PropertyDetailProps) {
  const urbanServices = parseJSON<Record<string, string>>(property.urbanServices, {})
  const features = parseJSON<string[]>(property.features, [])
  const images = parseJSON<string[]>(property.imageGallery, [])
  const whatsappLink = getWhatsAppLink(property.id, property.title, property.trustScore)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <Badge variant="outline" className="text-xs">
            <Eye className="w-3 h-3 mr-1" />
            {property.views} visitas
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {images.length > 0 ? (
                <>
                  <div className="md:col-span-2 aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images.slice(1, 4).map((img, i) => (
                    <div key={i} className="aspect-[16/9] overflow-hidden bg-gray-100">
                      <img
                        src={img}
                        alt={`${property.title} - ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div className="md:col-span-2 aspect-[16/9] flex items-center justify-center bg-gray-200">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-gray-900 text-white text-xs">
                  {getPropertyTypeLabel(property.propertyType)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {property.operationType === 'venta' ? 'En Venta' : 'En Alquiler'}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>
                  {property.address && `${property.address}, `}
                  {property.district}, {property.province}, {property.department}
                </span>
              </div>
            </div>

            <Separator />

            {/* Honest Technical Sheet */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Ficha Técnica Honesta
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-1">Precio Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-1">Precio/m²</p>
                  <p className="text-lg font-bold text-gray-900">{formatPricePerM2(property.precioM2)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-1">Área Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatArea(property.areaTotal)}</p>
                </div>
                {property.areaBuilt && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Área Construida</p>
                    <p className="text-lg font-bold text-gray-900">{formatArea(property.areaBuilt)}</p>
                  </div>
                )}
                {property.areaFront && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Frente</p>
                    <p className="text-lg font-bold text-gray-900">{property.areaFront} m</p>
                  </div>
                )}
                {property.dormitorios && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Dormitorios</p>
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-5 h-5 text-gray-400" />
                      <p className="text-lg font-bold text-gray-900">{property.dormitorios}</p>
                    </div>
                  </div>
                )}
                {property.banos && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Baños</p>
                    <div className="flex items-center gap-1">
                      <Bath className="w-5 h-5 text-gray-400" />
                      <p className="text-lg font-bold text-gray-900">{property.banos}</p>
                    </div>
                  </div>
                )}
                {property.estacionamiento && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Estacionamiento</p>
                    <div className="flex items-center gap-1">
                      <Car className="w-5 h-5 text-gray-400" />
                      <p className="text-lg font-bold text-gray-900">{property.estacionamiento}</p>
                    </div>
                  </div>
                )}
                {property.anoConstruccion && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Año Construcción</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <p className="text-lg font-bold text-gray-900">{property.anoConstruccion}</p>
                    </div>
                  </div>
                )}
                {property.materialConstruccion && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Material</p>
                    <div className="flex items-center gap-1">
                      <Hammer className="w-5 h-5 text-gray-400" />
                      <p className="text-lg font-bold text-gray-900 capitalize">{property.materialConstruccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Technical Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Descripción Técnica</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Tabs for more details */}
            <Tabs defaultValue="services">
              <TabsList className="w-full">
                <TabsTrigger value="services" className="flex-1">Servicios Urbanos</TabsTrigger>
                <TabsTrigger value="features" className="flex-1">Características</TabsTrigger>
                <TabsTrigger value="media" className="flex-1">Multimedia</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(urbanServices).map(([key, value]) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        value === 'No disponible' || value === 'Sin cobertura'
                          ? 'border-red-200 bg-red-50'
                          : 'border-emerald-200 bg-emerald-50'
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-sm font-semibold text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-4 space-y-4">
                {property.kuulaUrl && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Tour 360°</h4>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={`https://www.kuula.co/share/collection/${property.kuulaUrl}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="Tour 360°"
                      />
                    </div>
                  </div>
                )}
                {property.droneVideoUrl && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      Video Drone - Entorno
                    </h4>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={property.droneVideoUrl}
                        className="w-full h-full"
                        allowFullScreen
                        title="Video Drone"
                      />
                    </div>
                  </div>
                )}
                {!property.kuulaUrl && !property.droneVideoUrl && (
                  <p className="text-sm text-gray-500">No hay multimedia disponible para esta propiedad.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Trust Score Widget */}
            <TrustScoreWidget
              score={property.trustScore}
              statusLegal={property.statusLegal}
              cargasLegales={property.cargasLegales}
              certificadoBusqueda={property.certificadoBusqueda}
            />

            {/* Price Summary */}
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resumen de Precio</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{formatPrice(property.price)}</p>
              <p className="text-sm text-gray-500">{formatPricePerM2(property.precioM2)}</p>
              {property.impuestoPredial && (
                <>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Impuesto Predial/año</span>
                    <span className="font-semibold">{formatPrice(property.impuestoPredial)}</span>
                  </div>
                </>
              )}
              {property.comparisonMarket !== null && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">vs. Promedio de Zona</span>
                  <span className={`font-semibold ${property.comparisonMarket < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {property.comparisonMarket > 0 ? '+' : ''}{property.comparisonMarket.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Solicitar Asesoría Técnica
            </a>
            <p className="text-[11px] text-gray-400 text-center">
              Se enviará: propiedad &quot;{property.title}&quot; con Trust Score {property.trustScore}/100
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
