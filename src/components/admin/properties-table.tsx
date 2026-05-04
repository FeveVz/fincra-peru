'use client'

import { useState } from 'react'
import { formatPrice, formatArea, formatPricePerM2, getPropertyTypeLabel, getStatusLegalColor } from '@/lib/property-utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Star,
  ToggleLeft,
  ToggleRight,
  Building2,
  Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Property {
  id: string
  title: string
  propertyType: string
  department: string
  province: string
  district: string
  price: number
  areaTotal: number
  precioM2: number
  trustScore: number
  statusLegal: string
  active: boolean
  featured: boolean
  imageUrl: string | null
  views: number
  createdAt: string
  [key: string]: unknown
}

interface PropertiesTableProps {
  properties: Property[]
  onEdit: (property: Property) => void
  onDelete: (property: Property) => Promise<boolean>
  onToggleActive: (property: Property) => void
  onToggleFeatured: (property: Property) => void
  onViewPublic: (property: Property) => void
}

export function PropertiesTable({
  properties,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onViewPublic,
}: PropertiesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)
  const [search, setSearch] = useState('')

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} propiedades</p>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold w-16">Img</TableHead>
                  <TableHead className="text-xs font-semibold">Propiedad</TableHead>
                  <TableHead className="text-xs font-semibold">Ubicación</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Precio</TableHead>
                  <TableHead className="text-xs font-semibold text-right">m²</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Trust</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Legal</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Visitas</TableHead>
                  <TableHead className="text-xs font-semibold text-center w-12">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-sm text-gray-400">
                      No se encontraron propiedades
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((property) => {
                    const statusColor = getStatusLegalColor(property.statusLegal)
                    return (
                      <TableRow key={property.id} className="group hover:bg-gray-50/50">
                        <TableCell>
                          <div className="w-12 h-9 rounded-md overflow-hidden bg-gray-100">
                            {property.imageUrl ? (
                              <img src={property.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 line-clamp-1 max-w-[200px]">
                              {property.title}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {getPropertyTypeLabel(property.propertyType)}
                              {property.featured && (
                                <Star className="w-3 h-3 text-amber-400 inline ml-1" />
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-gray-600">
                            {property.district}, {property.department}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-xs font-semibold text-gray-900">
                            {formatPrice(property.price)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {formatPricePerM2(property.precioM2)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-xs text-gray-600">{formatArea(property.areaTotal)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-xs font-bold ${
                              property.trustScore >= 85
                                ? 'text-emerald-600'
                                : property.trustScore >= 70
                                ? 'text-green-600'
                                : property.trustScore >= 50
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {property.trustScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${statusColor.bgColor} ${statusColor.color}`}
                          >
                            {statusColor.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={property.active ? 'default' : 'outline'}
                            className={`text-[10px] ${property.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'text-gray-400'}`}
                          >
                            {property.active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs text-gray-500">{property.views}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => onViewPublic(property)}>
                                <Eye className="w-4 h-4 mr-2" /> Ver pública
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(property)}>
                                <Pencil className="w-4 h-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onToggleFeatured(property)}>
                                <Star className="w-4 h-4 mr-2" />
                                {property.featured ? 'Quitar destacado' : 'Marcar destacado'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onToggleActive(property)}>
                                {property.active ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 mr-2" /> Desactivar
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 mr-2" /> Activar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteTarget(property)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta propiedad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente:{' '}
              <strong className="text-gray-900">{deleteTarget?.title}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (deleteTarget) {
                  await onDelete(deleteTarget)
                  setDeleteTarget(null)
                }
              }}
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
