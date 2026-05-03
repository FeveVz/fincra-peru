'use client'

import { Search, X, SlidersHorizontal, TrendingUp, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface SmartFiltersProps {
  filters: {
    department: string
    propertyType: string
    statusLegal: string
    sortBy: string
    search: string
    minTrust: number | null
  }
  onFilterChange: (key: string, value: string | number | null) => void
  onReset: () => void
  totalResults: number
}

const smartPresets = [
  {
    key: 'mayor_seguridad',
    label: 'Mayor Seguridad Legal',
    icon: Shield,
    description: 'Ordenar por Trust Score',
    sortBy: 'mayor_seguridad',
  },
  {
    key: 'mejor_plusvalia',
    label: 'Mejor Plusvalía',
    icon: TrendingUp,
    description: 'Debajo del promedio de zona',
    sortBy: 'mejor_plusvalia',
  },
  {
    key: 'solo_saneados',
    label: 'Solo Saneados',
    icon: Zap,
    description: '100% documentados',
    filterKey: 'statusLegal',
    filterValue: 'Saneado',
  },
]

export function SmartFilters({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}: SmartFiltersProps) {
  const hasActiveFilters =
    filters.department !== 'all' ||
    filters.propertyType !== 'all' ||
    filters.statusLegal !== 'all' ||
    filters.search !== '' ||
    filters.minTrust !== null

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por distrito, provincia o departamento..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10 pr-10 h-11 bg-white"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => onFilterChange('search', '')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Smart Presets */}
      <div className="flex flex-wrap gap-2">
        {smartPresets.map((preset) => (
          <Button
            key={preset.key}
            variant={filters.sortBy === preset.sortBy || (preset.filterKey && filters[preset.filterKey as keyof typeof filters] === preset.filterValue) ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-9"
            onClick={() => {
              if (preset.sortBy) {
                onFilterChange('sortBy', preset.sortBy)
              }
              if (preset.filterKey) {
                onFilterChange(preset.filterKey, preset.filterValue)
              }
            }}
          >
            <preset.icon className="w-3.5 h-3.5 mr-1.5" />
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-medium">Filtros:</span>
        </div>

        <Select value={filters.department} onValueChange={(v) => onFilterChange('department', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Ica">Ica</SelectItem>
            <SelectItem value="Lima">Lima</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.propertyType} onValueChange={(v) => onFilterChange('propertyType', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="terreno">Terreno</SelectItem>
            <SelectItem value="casa">Casa</SelectItem>
            <SelectItem value="departamento">Departamento</SelectItem>
            <SelectItem value="local_comercial">Local Comercial</SelectItem>
            <SelectItem value="oficina">Oficina</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.statusLegal} onValueChange={(v) => onFilterChange('statusLegal', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Estado Legal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Saneado">Saneado</SelectItem>
            <SelectItem value="En Trámite">En Trámite</SelectItem>
            <SelectItem value="Posesión">Posesión</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(v) => onFilterChange('sortBy', v)}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trust_desc">Mayor Trust Score</SelectItem>
            <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="plusvalia">Mejor Plusvalía</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-xs text-red-500" onClick={onReset}>
            <X className="w-3.5 h-3.5 mr-1" />
            Limpiar
          </Button>
        )}

        <div className="ml-auto">
          <Badge variant="secondary" className="text-xs">
            {totalResults} propiedades
          </Badge>
        </div>
      </div>
    </div>
  )
}
