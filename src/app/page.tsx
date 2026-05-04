'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { usePropertyStore, Property } from '@/stores/property-store'
import { HonestPropertyCard } from '@/components/property/honest-property-card'
import { PropertyDetail } from '@/components/property/property-detail'
import { PropertyComparator } from '@/components/property/property-comparator'
import { ClosingCalculator } from '@/components/property/closing-calculator'
import { SmartFilters } from '@/components/property/smart-filters'
import { useAdminProperties } from '@/components/admin/use-admin-properties'
import { PropertyForm } from '@/components/admin/property-form'
import { PropertiesTable } from '@/components/admin/properties-table'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import {
  MessageCircle,
  Shield,
  GitCompareArrows,
  Calculator,
  Building2,
  TrendingUp,
  FileSearch,
  Settings,
  Plus,
  Table2,
  LayoutDashboard,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type AppView = 'public' | 'admin'

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

  const [appView, setAppView] = useState<AppView>('public')
  const [adminTab, setAdminTab] = useState('dashboard')
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [showForm, setShowForm] = useState(false)

  // --- Admin Auth State ---
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // --- Secret trigger: triple-click on logo ---
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogoClick = useCallback(() => {
    logoClickCount.current += 1

    if (logoClickTimer.current) clearTimeout(logoClickTimer.current)

    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0
      // Check if already authenticated
      if (sessionStorage.getItem('fincra_admin_auth') === 'true') {
        setAppView('admin')
      } else {
        setShowAuthDialog(true)
      }
    } else {
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0
      }, 800)
    }
  }, [])

  // --- Secret trigger: keyboard shortcut Ctrl+Shift+A ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        if (sessionStorage.getItem('fincra_admin_auth') === 'true') {
          setAppView('admin')
        } else {
          setShowAuthDialog(true)
        }
      }
      // Also: Ctrl+Shift+X to exit admin
      if (e.ctrlKey && e.shiftKey && e.key === 'X' && appView === 'admin') {
        e.preventDefault()
        setAppView('public')
        setEditingProperty(null)
        setShowForm(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [appView])

  // --- Restore auth from sessionStorage ---
  useEffect(() => {
    const auth = sessionStorage.getItem('fincra_admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAdminLogin = async () => {
    if (!authPassword.trim()) {
      setAuthError('Ingresa la contraseña')
      return
    }

    setAuthLoading(true)
    setAuthError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem('fincra_admin_auth', 'true')
        setShowAuthDialog(false)
        setAuthPassword('')
        setAppView('admin')
        toast.success('Panel de administración desbloqueado')
      } else {
        setAuthError(data.error || 'Contraseña incorrecta')
        if (data.remaining !== undefined && data.remaining <= 2 && data.remaining > 0) {
          setAuthError(`${data.error}. ${data.remaining} intentos restantes.`)
        }
        if (data.locked) {
          setAuthError(data.error)
        }
      }
    } catch {
      setAuthError('Error de conexión')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('fincra_admin_auth')
    setAppView('public')
    setEditingProperty(null)
    setShowForm(false)
    toast.success('Sesión cerrada')
  }

  const handleAuthKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdminLogin()
    }
  }

  // --- Admin Properties Hook ---
  const {
    properties: adminProperties,
    loading: adminLoading,
    stats,
    fetchProperties: fetchAdminProperties,
    deleteProperty,
    toggleActive,
    toggleFeatured,
  } = useAdminProperties()

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

  const refreshAll = useCallback(async () => {
    await fetchProperties()
    await fetchAdminProperties()
  }, [fetchProperties, fetchAdminProperties])

  // Fetch on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchProperties()
      fetchAdminProperties()
    }
  }, [])

  const handleCreateProperty = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Propiedad creada exitosamente')
        setShowForm(false)
        await refreshAll()
        return true
      }
      const err = await res.json()
      toast.error(err.error || 'Error al crear')
      return false
    } catch {
      toast.error('Error de conexión')
      return false
    }
  }

  const handleUpdateProperty = async (data: Record<string, unknown>) => {
    if (!editingProperty) return false
    try {
      const res = await fetch(`/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Propiedad actualizada')
        setEditingProperty(null)
        setShowForm(false)
        await refreshAll()
        return true
      }
      const err = await res.json()
      toast.error(err.error || 'Error al actualizar')
      return false
    } catch {
      toast.error('Error de conexión')
      return false
    }
  }

  const handleDeleteProperty = async (property: Property) => {
    const success = await deleteProperty(property.id)
    if (success) {
      toast.success('Propiedad eliminada')
      await refreshAll()
    } else {
      toast.error('Error al eliminar')
    }
    return success
  }

  const handleCompare = (property: Property) => {
    toggleCompare(property)
    if (compareList.length === 0 || (compareList.length < 3 && !compareList.find((p) => p.id === property.id))) {
      setActiveView('compare')
    }
  }

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property)
  }

  const handleViewPublic = (property: Property) => {
    const match = filteredProperties.find((p) => p.id === property.id)
    if (match) {
      setSelectedProperty(match)
    } else {
      setSelectedProperty(property as Property)
    }
    setAppView('public')
  }

  const openEditForm = (property: Property) => {
    setEditingProperty(property)
    setShowForm(true)
    setAdminTab('form')
  }

  // Detail View (overlay)
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

  // Admin View (hidden, password-protected)
  if (appView === 'admin' && isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Admin Header */}
        <header className="sticky top-0 z-50 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white h-8 gap-1.5"
                onClick={() => {
                  setAppView('public')
                  setEditingProperty(null)
                  setShowForm(false)
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs">Volver al sitio</span>
              </Button>
              <Separator orientation="vertical" className="h-6 bg-gray-700" />
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold">Panel de Administración</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setEditingProperty(null)
                  setShowForm(true)
                  setAdminTab('form')
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Propiedad
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400 h-8 text-xs"
                onClick={handleLogout}
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {showForm ? (
              /* Form View */
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <PropertyForm
                  property={editingProperty}
                  onSubmit={editingProperty ? handleUpdateProperty : handleCreateProperty}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingProperty(null)
                    setAdminTab('dashboard')
                  }}
                />
              </div>
            ) : (
              /* Tabs View */
              <Tabs value={adminTab} onValueChange={setAdminTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="dashboard" className="text-xs gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="properties" className="text-xs gap-1.5">
                    <Table2 className="w-3.5 h-3.5" />
                    Propiedades
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <AdminDashboard stats={stats} loading={adminLoading} />
                </TabsContent>

                <TabsContent value="properties">
                  <PropertiesTable
                    properties={adminProperties as unknown as Property[]}
                    onEdit={openEditForm}
                    onDelete={handleDeleteProperty}
                    onToggleActive={(p) => { toggleActive(p as never); toast.success('Estado actualizado') }}
                    onToggleFeatured={(p) => { toggleFeatured(p as never); toast.success('Destacado actualizado') }}
                    onViewPublic={handleViewPublic}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Public View
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Auth Dialog (hidden password prompt) */}
      <Dialog open={showAuthDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAuthDialog(false)
          setAuthPassword('')
          setAuthError('')
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              Acceso Restringido
            </DialogTitle>
            <DialogDescription>
              Ingresa la contraseña de administrador para continuar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {authError && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                authError.includes('Demasiados')
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
              }`}>
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <Label htmlFor="admin-password">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => {
                    setAuthPassword(e.target.value)
                    setAuthError('')
                  }}
                  onKeyDown={handleAuthKeyDown}
                  placeholder="••••••••"
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleAdminLogin}
              disabled={authLoading || !authPassword.trim()}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              {authLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Acceder al Panel
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-default select-none"
            onClick={handleLogoClick}
            role="banner"
          >
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
                  {filteredProperties.filter((p) => p.statusLegal === 'Saneado').length}
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

        {/* Calculator Section */}
        {activeView === 'calculator' && (
          <section className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="max-w-xl mx-auto">
                <ClosingCalculator />
              </div>
            </div>
          </section>
        )}

        {/* Comparator Section */}
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
          <SmartFilters
            filters={filters}
            onFilterChange={setFilter}
            onReset={resetFilters}
            totalResults={filteredProperties.length}
          />

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
                <p className="text-xs text-gray-500">contacto@fincra.pe</p>
                <p className="text-xs text-gray-500">+51 999 999 999</p>
                <p className="text-xs text-gray-500">Ica, Perú</p>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-[11px] text-gray-400 text-center">
            © {new Date().getFullYear()} Fincra Perú. Todos los derechos reservados. Los datos mostrados son informativos y no constituyen oferta legal.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
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
