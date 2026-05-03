'use client'

import { useEffect, useCallback } from 'react'
import { usePropertyStore, Property } from '@/stores/property-store'
import { HonestPropertyCard } from '@/components/property/honest-property-card'
import { PropertyDetail } from '@/components/property/property-detail'
import { PropertyComparator } from '@/components/property/property-comparator'
import { ClosingCalculator } from '@/components/property/closing-calculator'
import { SmartFilters } from '@/components/property/smart-filters'
import {
  MessageCircle,
  Shield,
  Eye,
  GitCompareArrows,
  Calculator,
  ChevronDown,
  Building2,
  TrendingUp,
  FileSearch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function HomePage() {
  const {
    filteredProperties,
    compareList,
    selectedProperty,
    filters,
    activeView,
    isLoading,
    setProperties,
    setSelectedProperty,
    setActiveView,
    setFilter,
    resetFilters,
    toggleCompare,
    removeFromCompare,
    clearCompare,
  } = usePropertyStore()

  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      if (data.properties) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }, [setProperties])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handleCompare = (property: Property) => {
    toggleCompare(property)
    if (compareList.length === 0 || (compareList.length < 3 && !compareList.find(p => p.id === property.id))) {
      setActiveView('compare')
    }
  }

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property)
  }

  // Detail View
  if (activeView === 'detail' && selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty}
        onBack={() => {
          setSelectedProperty(null)
          setActiveView('grid')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">Fincra Perú</h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">Datos duros, no publicidad</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setActiveView('compare')}
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                Comparar ({compareList.length}/3)
              </Button>
            )}
            <Button
              variant={activeView === 'calculator' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setActiveView(activeView === 'calculator' ? 'grid' : 'calculator')}
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculadora
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 pt-10 pb-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <Badge variant="outline" className="mb-4 text-xs border-gray-300">
                <Shield className="w-3 h-3 mr-1" />
                Plataforma de confianza inmobiliaria
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Información inmobiliaria <span className="text-emerald-600">real</span>
              </h2>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                Sin adornos publicitarios. Sin datos manipulados. Solo fichas técnicas honestas
                con verificación legal, precios transparentes y comparadores objetivos.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{filteredProperties.length}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Propiedades</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {filteredProperties.filter(p => p.statusLegal === 'Saneado').length}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Saneadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">Ica + Lima</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Regiones</p>
              </div>
            </div>

            {/* Trust Philosophy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Trust Score</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Algoritmo de confianza basado en validación legal documentada.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <FileSearch className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Ficha Técnica Honesta</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Datos duros primero: metraje, cargas legales, impuestos reales.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Comparador Objetivo</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Compara hasta 3 propiedades basándote en rentabilidad y seguridad.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section (if active) */}
        {activeView === 'calculator' && (
          <section className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="max-w-xl mx-auto">
                <ClosingCalculator />
              </div>
            </div>
          </section>
        )}

        {/* Comparator Section (if active) */}
        {compareList.length > 0 && activeView === 'compare' && (
          <section className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <PropertyComparator
                properties={compareList}
                onRemove={removeFromCompare}
                onClear={clearCompare}
              />
            </div>
          </section>
        )}

        {/* Properties Section */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          {/* Filters */}
          <SmartFilters
            filters={filters}
            onFilterChange={setFilter}
            onReset={resetFilters}
            totalResults={filteredProperties.length}
          />

          {/* Results */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {filteredProperties.map((property) => (
                <HonestPropertyCard
                  key={property.id}
                  property={property}
                  onSelect={handleSelectProperty}
                  onCompare={handleCompare}
                  isComparing={compareList.some((p) => p.id === property.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No se encontraron propiedades</h3>
              <p className="text-sm text-gray-500 mb-4">
                Intenta ajustar los filtros o buscar en otra zona.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">Fincra Perú</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Plataforma inmobiliaria que prioriza la transparencia, la verificación legal y los datos técnicos
                por encima de la publicidad engañosa. Operamos en Ica y Lima.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Los Trust Scores son indicadores informativos basados en verificación documentaria.</p>
                <p className="text-xs text-gray-500">Las calculadoras de cierre son estimaciones basadas en tarifas promedio 2025.</p>
                <p className="text-xs text-gray-500">Consulte siempre a un abogado especializado antes de realizar cualquier transacción inmobiliaria.</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Contacto</h4>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">📧 contacto@fincra.pe</p>
                <p className="text-xs text-gray-500">📱 +51 999 999 999</p>
                <p className="text-xs text-gray-500">📍 Ica, Perú</p>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-[11px] text-gray-400 text-center">
            © {new Date().getFullYear()} Fincra Perú. Todos los derechos reservados. Los datos mostrados son informativos y no constituyen oferta legal.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/51999999999?text=Hola%2C%20necesito%20asesor%C3%ADa%20inmobiliaria%20técnica"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Asesoría técnica
        </span>
      </a>
    </div>
  )
}
