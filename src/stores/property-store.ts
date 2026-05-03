import { create } from 'zustand'

export interface Property {
  id: string
  title: string
  slug: string
  description: string
  operationType: string
  propertyType: string
  department: string
  province: string
  district: string
  address: string | null
  latitude: number | null
  longitude: number | null
  zone: string | null
  areaTotal: number
  areaBuilt: number | null
  areaFront: number | null
  price: number
  precioM2: number
  trustScore: number
  statusLegal: string
  cargasLegales: string | null
  impuestoPredial: number | null
  certificadoBusqueda: string | null
  fechaTasacion: string | null
  comparisonMarket: number | null
  urbanServices: string
  dormitorios: number | null
  banos: number | null
  estacionamiento: number | null
  pisos: number | null
  anoConstruccion: number | null
  materialConstruccion: string | null
  imageUrl: string | null
  imageGallery: string
  kuulaUrl: string | null
  droneVideoUrl: string | null
  features: string
  featured: boolean
  active: boolean
  views: number
  createdAt: string
  updatedAt: string
}

interface PropertyStore {
  // Properties list
  properties: Property[]
  filteredProperties: Property[]
  selectedProperty: Property | null
  isLoading: boolean
  
  // Comparison
  compareList: Property[]
  
  // Filters
  filters: {
    department: string
    propertyType: string
    statusLegal: string
    sortBy: string
    search: string
    minTrust: number | null
  }
  
  // Active view
  activeView: 'grid' | 'detail' | 'compare' | 'calculator'
  
  // Actions
  setProperties: (properties: Property[]) => void
  setSelectedProperty: (property: Property | null) => void
  setActiveView: (view: 'grid' | 'detail' | 'compare' | 'calculator') => void
  setFilter: (key: string, value: string | number | null) => void
  resetFilters: () => void
  toggleCompare: (property: Property) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  getCompareCount: () => number
}

const defaultFilters = {
  department: 'all',
  propertyType: 'all',
  statusLegal: 'all',
  sortBy: 'trust_desc',
  search: '',
  minTrust: null,
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  filteredProperties: [],
  selectedProperty: null,
  isLoading: false,
  compareList: [],
  filters: defaultFilters,
  activeView: 'grid',
  
  setProperties: (properties) => {
    const { filters } = get()
    const filtered = applyFilters(properties, filters)
    set({ properties, filteredProperties: filtered })
  },
  
  setSelectedProperty: (property) => set({ selectedProperty: property, activeView: property ? 'detail' : 'grid' }),
  setActiveView: (view) => set({ activeView: view }),
  setFilter: (key, value) => {
    const newFilters = { ...get().filters, [key]: value }
    const filtered = applyFilters(get().properties, newFilters)
    set({ filters: newFilters, filteredProperties: filtered })
  },
  resetFilters: () => {
    const filtered = applyFilters(get().properties, defaultFilters)
    set({ filters: defaultFilters, filteredProperties: filtered })
  },
  toggleCompare: (property) => {
    const { compareList } = get()
    const exists = compareList.find((p) => p.id === property.id)
    if (exists) {
      set({ compareList: compareList.filter((p) => p.id !== property.id) })
    } else if (compareList.length < 3) {
      set({ compareList: [...compareList, property] })
    }
  },
  removeFromCompare: (id) => {
    set({ compareList: get().compareList.filter((p) => p.id !== id) })
  },
  clearCompare: () => set({ compareList: [] }),
  getCompareCount: () => get().compareList.length,
}))

function applyFilters(properties: Property[], filters: typeof defaultFilters) {
  let result = [...properties]
  
  if (filters.department && filters.department !== 'all') {
    result = result.filter((p) => p.department === filters.department)
  }
  if (filters.propertyType && filters.propertyType !== 'all') {
    result = result.filter((p) => p.propertyType === filters.propertyType)
  }
  if (filters.statusLegal && filters.statusLegal !== 'all') {
    result = result.filter((p) => p.statusLegal === filters.statusLegal)
  }
  if (filters.search) {
    const s = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.district.toLowerCase().includes(s) ||
        p.province.toLowerCase().includes(s) ||
        p.department.toLowerCase().includes(s)
    )
  }
  if (filters.minTrust) {
    result = result.filter((p) => p.trustScore >= (filters.minTrust ?? 0))
  }
  
  // Sort
  switch (filters.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'trust_desc':
    case 'mayor_seguridad':
      result.sort((a, b) => b.trustScore - a.trustScore)
      break
    case 'plusvalia':
    case 'mejor_plusvalia':
      result.sort((a, b) => (b.comparisonMarket ?? 0) - (a.comparisonMarket ?? 0))
      break
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  return result
}
