'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAdminProperties } from '@/components/admin/use-admin-properties'
import { PropertyForm } from '@/components/admin/property-form'
import { PropertiesTable } from '@/components/admin/properties-table'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { Property } from '@/stores/property-store'
import {
  Building2,
  Settings,
  Plus,
  Table2,
  LayoutDashboard,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [adminTab, setAdminTab] = useState('dashboard')
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [showForm, setShowForm] = useState(false)

  const {
    properties: adminProperties,
    loading: adminLoading,
    stats,
    fetchProperties: fetchAdminProperties,
    deleteProperty,
    toggleActive,
    toggleFeatured,
  } = useAdminProperties()

  // Check existing session
  useEffect(() => {
    if (sessionStorage.getItem('fincra_admin_auth') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async () => {
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
        setAuthPassword('')
        toast.success('Panel de administración desbloqueado')
      } else {
        setAuthError(data.error || 'Contraseña incorrecta')
        if (data.remaining !== undefined && data.remaining <= 2 && data.remaining > 0) {
          setAuthError(`${data.error}. ${data.remaining} intentos restantes.`)
        }
      }
    } catch {
      setAuthError('Error de conexión')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLogin()
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('fincra_admin_auth')
    setEditingProperty(null)
    setShowForm(false)
    toast.success('Sesión cerrada')
  }

  const refreshAll = useCallback(async () => {
    await fetchAdminProperties()
  }, [fetchAdminProperties])

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll()
    }
  }, [isAuthenticated, refreshAll])

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

  const openEditForm = (property: Property) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Fincra Perú</h1>
            <p className="text-xs text-gray-500 mt-1">Panel de Administración</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Acceso Restringido</h2>
                <p className="text-[11px] text-gray-500">Ingresa tu contraseña para continuar</p>
              </div>
            </div>

            {authError && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm mb-4 ${
                authError.includes('Demasiados')
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
              }`}>
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="admin-pwd" className="text-xs text-gray-600">Contraseña</Label>
                <div className="relative mt-1">
                  <Input
                    id="admin-pwd"
                    type={showPassword ? 'text' : 'password'}
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value)
                      setAuthError('')
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••"
                    className="pr-10 h-11"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={authLoading || !authPassword.trim()}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 gap-2"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Ingresar al Panel
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <a
              href="/"
              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              Volver al sitio público
            </a>
          </div>
        </div>
      </div>
    )
  }

  // --- ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold">Fincra Perú</span>
                <span className="text-[10px] text-gray-400 ml-2">Admin</span>
              </div>
            </a>
            <Separator orientation="vertical" className="h-6 bg-gray-700" />
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold hidden sm:inline">Administración</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showForm && (
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setEditingProperty(null)
                  setShowForm(true)
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nueva Propiedad</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            )}
            <a href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white h-8 text-xs gap-1.5"
              >
                Ver sitio
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400 h-8 text-xs"
              onClick={handleLogout}
            >
              <Lock className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {showForm ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <PropertyForm
                property={editingProperty}
                onSubmit={editingProperty ? handleUpdateProperty : handleCreateProperty}
                onCancel={() => {
                  setShowForm(false)
                  setEditingProperty(null)
                }}
              />
            </div>
          ) : (
            <Tabs value={adminTab} onValueChange={setAdminTab}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="dashboard" className="text-xs gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="properties" className="text-xs gap-1.5">
                    <Table2 className="w-3.5 h-3.5" />
                    Propiedades
                  </TabsTrigger>
                </TabsList>

                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 sm:hidden"
                  onClick={() => {
                    setEditingProperty(null)
                    setShowForm(true)
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo
                </Button>
              </div>

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
                  onViewPublic={(p) => {
                    window.open(`/#property-${p.id}`, '_blank')
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
