'use client'

import { useState, useMemo } from 'react'
import { Property } from '@/stores/property-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Save,
  X,
  Loader2,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PropertyFormProps {
  property?: Property | null
  onSubmit: (data: Record<string, unknown>) => Promise<boolean>
  onCancel: () => void
}

const emptyForm: Record<string, string> = {
  title: '',
  slug: '',
  description: '',
  operationType: 'venta',
  propertyType: 'terreno',
  department: 'Ica',
  province: '',
  district: '',
  address: '',
  latitude: '',
  longitude: '',
  zone: '',
  areaTotal: '',
  areaBuilt: '',
  areaFront: '',
  price: '',
  trustScore: '50',
  statusLegal: 'En Trámite',
  cargasLegales: '',
  impuestoPredial: '',
  certificadoBusqueda: '',
  comparisonMarket: '',
  urbanServicesAgua: 'No disponible',
  urbanServicesLuz: 'No disponible',
  urbanServicesDesague: 'No disponible',
  urbanServicesInternet: 'No disponible',
  dormitorios: '',
  banos: '',
  estacionamiento: '',
  pisos: '',
  anoConstruccion: '',
  materialConstruccion: '',
  imageUrl: '',
  imageGallery: '',
  kuulaUrl: '',
  droneVideoUrl: '',
  features: '',
  featured: 'false',
}

function parsePropertyToForm(property: Property | null): Record<string, string> {
  if (!property) return emptyForm
  let urbanServices: Record<string, string> = {}
  try { urbanServices = JSON.parse(property.urbanServices || '{}') } catch { /* empty */ }
  let featuresArr: string[] = []
  try { featuresArr = JSON.parse(property.features || '[]') } catch { /* empty */ }
  let galleryArr: string[] = []
  try { galleryArr = JSON.parse(property.imageGallery || '[]') } catch { /* empty */ }

  return {
    title: property.title || '',
    slug: property.slug || '',
    description: property.description || '',
    operationType: property.operationType || 'venta',
    propertyType: property.propertyType || 'terreno',
    department: property.department || 'Ica',
    province: property.province || '',
    district: property.district || '',
    address: property.address || '',
    latitude: property.latitude?.toString() || '',
    longitude: property.longitude?.toString() || '',
    zone: property.zone || '',
    areaTotal: property.areaTotal?.toString() || '',
    areaBuilt: property.areaBuilt?.toString() || '',
    areaFront: property.areaFront?.toString() || '',
    price: property.price?.toString() || '',
    trustScore: property.trustScore?.toString() || '50',
    statusLegal: property.statusLegal || 'En Trámite',
    cargasLegales: property.cargasLegales || '',
    impuestoPredial: property.impuestoPredial?.toString() || '',
    certificadoBusqueda: property.certificadoBusqueda || '',
    comparisonMarket: property.comparisonMarket?.toString() || '',
    urbanServicesAgua: urbanServices.agua || 'No disponible',
    urbanServicesLuz: urbanServices.luz || 'No disponible',
    urbanServicesDesague: urbanServices.desague || 'No disponible',
    urbanServicesInternet: urbanServices.internet || 'No disponible',
    dormitorios: property.dormitorios?.toString() || '',
    banos: property.banos?.toString() || '',
    estacionamiento: property.estacionamiento?.toString() || '',
    pisos: property.pisos?.toString() || '',
    anoConstruccion: property.anoConstruccion?.toString() || '',
    materialConstruccion: property.materialConstruccion || '',
    imageUrl: property.imageUrl || '',
    imageGallery: galleryArr.join(', '),
    kuulaUrl: property.kuulaUrl || '',
    droneVideoUrl: property.droneVideoUrl || '',
    features: featuresArr.join(', '),
    featured: property.featured ? 'true' : 'false',
  }
}

export function PropertyForm({ property, onSubmit, onCancel }: PropertyFormProps) {
  const initialForm = useMemo(() => parsePropertyToForm(property), [property])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEditing = !!property

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Auto-generate slug from title
    if (key === 'title' && !property) {
      setForm((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g, '-').replace(/-+$/, ''),
      }))
    }
    // Auto-calc precioM2
    if (key === 'price' || key === 'areaTotal') {
      const p = parseFloat(key === 'price' ? value : form.price) || 0
      const a = parseFloat(key === 'areaTotal' ? value : form.areaTotal) || 0
      // precioM2 is calculated server-side, no need here
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const urbanServices = JSON.stringify({
      agua: form.urbanServicesAgua,
      luz: form.urbanServicesLuz,
      desague: form.urbanServicesDesague,
      internet: form.urbanServicesInternet,
    })

    const featuresArr = form.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
    const galleryArr = form.imageGallery
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

    const payload: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      operationType: form.operationType,
      propertyType: form.propertyType,
      department: form.department,
      province: form.province,
      district: form.district,
      address: form.address || null,
      latitude: form.latitude || null,
      longitude: form.longitude || null,
      zone: form.zone || null,
      areaTotal: form.areaTotal,
      areaBuilt: form.areaBuilt || null,
      areaFront: form.areaFront || null,
      price: form.price,
      trustScore: form.trustScore,
      statusLegal: form.statusLegal,
      cargasLegales: form.cargasLegales || null,
      impuestoPredial: form.impuestoPredial || null,
      certificadoBusqueda: form.certificadoBusqueda || null,
      comparisonMarket: form.comparisonMarket || null,
      urbanServices,
      dormitorios: form.dormitorios || null,
      banos: form.banos || null,
      estacionamiento: form.estacionamiento || null,
      pisos: form.pisos || null,
      anoConstruccion: form.anoConstruccion || null,
      materialConstruccion: form.materialConstruccion || null,
      imageUrl: form.imageUrl || null,
      imageGallery: JSON.stringify(galleryArr),
      kuulaUrl: form.kuulaUrl || null,
      droneVideoUrl: form.droneVideoUrl || null,
      features: JSON.stringify(featuresArr),
      featured: form.featured === 'true',
    }

    const success = await onSubmit(payload)
    if (!success) {
      setError('Error al guardar. Verifica los datos.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h2>
          <p className="text-xs text-gray-500">
            {isEditing ? 'Modifica los campos deseados' : 'Completa los datos de la nueva propiedad'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" /> Cancelar
          </Button>
          <Button type="submit" disabled={loading || !form.title || !form.areaTotal || !form.price || !form.district || !form.province}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            {isEditing ? 'Guardar Cambios' : 'Crear Propiedad'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="basic" className="text-xs">Básico</TabsTrigger>
          <TabsTrigger value="legal" className="text-xs">Legal / Trust</TabsTrigger>
          <TabsTrigger value="services" className="text-xs">Servicios / Media</TabsTrigger>
          <TabsTrigger value="extras" className="text-xs">Extras</TabsTrigger>
        </TabsList>

        {/* BASIC TAB */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Ej: Terreno Comercial Saneado - Ica Centro" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="url-amigable-auto-generada" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo Operación</Label>
                <Select value={form.operationType} onValueChange={(v) => updateField('operationType', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="alquiler">Alquiler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo Propiedad *</Label>
                <Select value={form.propertyType} onValueChange={(v) => updateField('propertyType', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="departamento">Departamento</SelectItem>
                    <SelectItem value="local_comercial">Local Comercial</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Departamento *</Label>
              <Select value={form.department} onValueChange={(v) => updateField('department', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ica">Ica</SelectItem>
                  <SelectItem value="Lima">Lima</SelectItem>
                  <SelectItem value="Arequipa">Arequipa</SelectItem>
                  <SelectItem value="Cusco">Cusco</SelectItem>
                  <SelectItem value="La Libertad">La Libertad</SelectItem>
                  <SelectItem value="Piura">Piura</SelectItem>
                  <SelectItem value="Ancash">Ancash</SelectItem>
                  <SelectItem value="Junín">Junín</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Provincia *</Label>
              <Input value={form.province} onChange={(e) => updateField('province', e.target.value)} placeholder="Ej: Ica" className="mt-1" />
            </div>
            <div>
              <Label>Distrito *</Label>
              <Input value={form.district} onChange={(e) => updateField('district', e.target.value)} placeholder="Ej: Ica" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Av. Municipal 450, Ica" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Área Total (m²) *</Label>
              <Input type="number" value={form.areaTotal} onChange={(e) => updateField('areaTotal', e.target.value)} placeholder="480" className="mt-1" />
            </div>
            <div>
              <Label>Área Construida (m²)</Label>
              <Input type="number" value={form.areaBuilt} onChange={(e) => updateField('areaBuilt', e.target.value)} placeholder="180" className="mt-1" />
            </div>
            <div>
              <Label>Frente (m)</Label>
              <Input type="number" value={form.areaFront} onChange={(e) => updateField('areaFront', e.target.value)} placeholder="20" className="mt-1" />
            </div>
            <div>
              <Label>Precio (S/) *</Label>
              <Input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="285000" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Descripción Técnica</Label>
            <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Descripción honesta y técnica de la propiedad..." rows={4} className="mt-1" />
          </div>
        </TabsContent>

        {/* LEGAL / TRUST TAB */}
        <TabsContent value="legal" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Trust Score (1-100)</Label>
              <Input type="number" min="1" max="100" value={form.trustScore} onChange={(e) => updateField('trustScore', e.target.value)} className="mt-1" />
              <p className="text-[10px] text-gray-400 mt-1">Basado en verificación legal documentada</p>
            </div>
            <div>
              <Label>Estado Legal</Label>
              <Select value={form.statusLegal} onValueChange={(v) => updateField('statusLegal', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saneado">Saneado</SelectItem>
                  <SelectItem value="En Trámite">En Trámite</SelectItem>
                  <SelectItem value="Posesión">Posesión</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Cargas Legales</Label>
            <Input value={form.cargasLegales} onChange={(e) => updateField('cargasLegales', e.target.value)} placeholder="Sin cargas ni gravámenes" className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Impuesto Predial (S/ año)</Label>
              <Input type="number" value={form.impuestoPredial} onChange={(e) => updateField('impuestoPredial', e.target.value)} placeholder="1200" className="mt-1" />
            </div>
            <div>
              <Label>Certificado de Búsqueda</Label>
              <Input value={form.certificadoBusqueda} onChange={(e) => updateField('certificadoBusqueda', e.target.value)} placeholder="Negativo - Sin afectaciones" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Diferencia vs Promedio Zona (%)</Label>
              <Input type="number" step="0.1" value={form.comparisonMarket} onChange={(e) => updateField('comparisonMarket', e.target.value)} placeholder="-8.5" className="mt-1" />
              <p className="text-[10px] text-gray-400 mt-1">Negativo = más barato que el promedio</p>
            </div>
            <div>
              <Label>Zona / Barrio</Label>
              <Input value={form.zone} onChange={(e) => updateField('zone', e.target.value)} placeholder="Centro Comercial Ica" className="mt-1" />
            </div>
          </div>
        </TabsContent>

        {/* SERVICES / MEDIA TAB */}
        <TabsContent value="services" className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700">Servicios Urbanos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Agua</Label>
              <Select value={form.urbanServicesAgua} onValueChange={(v) => updateField('urbanServicesAgua', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEDAPAL">SEDAPAL</SelectItem>
                  <SelectItem value="SEDAPISCO">SEDAPISCO</SelectItem>
                  <SelectItem value="SEDACHIN">SEDACHIN</SelectItem>
                  <SelectItem value="Factible">Factible</SelectItem>
                  <SelectItem value="Conexión existente">Conexión existente</SelectItem>
                  <SelectItem value="Canal de riego">Canal de riego</SelectItem>
                  <SelectItem value="Factible (pozo propio)">Factible (pozo propio)</SelectItem>
                  <SelectItem value="No disponible">No disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Luz</Label>
              <Select value={form.urbanServicesLuz} onValueChange={(v) => updateField('urbanServicesLuz', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Luz del Sur">Luz del Sur</SelectItem>
                  <SelectItem value="Luz Sur">Luz Sur</SelectItem>
                  <SelectItem value="Conexión existente">Conexión existente</SelectItem>
                  <SelectItem value="Transformador cercano">Transformador cercano</SelectItem>
                  <SelectItem value="Poste cercano (150m)">Poste cercano</SelectItem>
                  <SelectItem value="No disponible">No disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Desagüe</Label>
              <Select value={form.urbanServicesDesague} onValueChange={(v) => updateField('urbanServicesDesague', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEDAPAL">SEDAPAL</SelectItem>
                  <SelectItem value="SEDAPISCO">SEDAPISCO</SelectItem>
                  <SelectItem value="Factible">Factible</SelectItem>
                  <SelectItem value="Tanque séptico">Tanque séptico</SelectItem>
                  <SelectItem value="No disponible">No disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Internet</Label>
              <Select value={form.urbanServicesInternet} onValueChange={(v) => updateField('urbanServicesInternet', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fibra óptica">Fibra óptica</SelectItem>
                  <SelectItem value="Fibra óptica dedicada">Fibra óptica dedicada</SelectItem>
                  <SelectItem value="Claro/Telmex fibra">Claro/Telmex fibra</SelectItem>
                  <SelectItem value="Claro 4G">Claro 4G</SelectItem>
                  <SelectItem value="4G/HFC">4G/HFC</SelectItem>
                  <SelectItem value="Sin cobertura">Sin cobertura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <h3 className="text-sm font-semibold text-gray-700">Imágenes y Multimedia</h3>
          <div>
            <Label>URL Imagen Principal</Label>
            <Input value={form.imageUrl} onChange={(e) => updateField('imageUrl', e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="mt-1" />
          </div>
          <div>
            <Label>Galería de Imágenes (URLs separadas por coma)</Label>
            <Input value={form.imageGallery} onChange={(e) => updateField('imageGallery', e.target.value)} placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tour 360° (Kuula ID)</Label>
              <Input value={form.kuulaUrl} onChange={(e) => updateField('kuulaUrl', e.target.value)} placeholder="collection-id" className="mt-1" />
            </div>
            <div>
              <Label>Video Drone URL</Label>
              <Input value={form.droneVideoUrl} onChange={(e) => updateField('droneVideoUrl', e.target.value)} placeholder="https://youtube.com/embed/..." className="mt-1" />
            </div>
          </div>

          {form.imageUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-md">
              <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
        </TabsContent>

        {/* EXTRAS TAB */}
        <TabsContent value="extras" className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700">Características del Inmueble</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Dormitorios</Label>
              <Input type="number" value={form.dormitorios} onChange={(e) => updateField('dormitorios', e.target.value)} placeholder="3" className="mt-1" />
            </div>
            <div>
              <Label>Baños</Label>
              <Input type="number" value={form.banos} onChange={(e) => updateField('banos', e.target.value)} placeholder="2" className="mt-1" />
            </div>
            <div>
              <Label>Estacionamiento</Label>
              <Input type="number" value={form.estacionamiento} onChange={(e) => updateField('estacionamiento', e.target.value)} placeholder="2" className="mt-1" />
            </div>
            <div>
              <Label>Pisos</Label>
              <Input type="number" value={form.pisos} onChange={(e) => updateField('pisos', e.target.value)} placeholder="2" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Año de Construcción</Label>
              <Input type="number" value={form.anoConstruccion} onChange={(e) => updateField('anoConstruccion', e.target.value)} placeholder="2019" className="mt-1" />
            </div>
            <div>
              <Label>Material de Construcción</Label>
              <Select value={form.materialConstruccion} onValueChange={(v) => updateField('materialConstruccion', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="concreto">Concreto</SelectItem>
                  <SelectItem value="ladrillo">Ladrillo</SelectItem>
                  <SelectItem value="adobe">Adobe</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Características (separadas por coma)</Label>
            <Input value={form.features} onChange={(e) => updateField('features', e.target.value)} placeholder="Cerca al centro, Esquina, Frente amplio, Zona comercial" className="mt-1" />
            <div className="flex flex-wrap gap-1 mt-2">
              {form.features.split(',').map((f, i) => f.trim() && <Badge key={i} variant="secondary" className="text-xs">{f.trim()}</Badge>)}
            </div>
          </div>

          <Separator />

          <div>
            <Label>Coordenadas (opcional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} placeholder="Latitude (-14.065)" className="mt-1" />
              <Input value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} placeholder="Longitude (-75.728)" className="mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label>Destacada</Label>
            <Select value={form.featured} onValueChange={(v) => updateField('featured', v)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}
