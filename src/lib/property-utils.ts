export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatPriceDetailed(price: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatArea(area: number): string {
  return `${area.toLocaleString('es-PE')} m²`
}

export function formatPricePerM2(precioM2: number): string {
  return `S/ ${precioM2.toFixed(0)}/m²`
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    terreno: 'Terreno',
    casa: 'Casa',
    departamento: 'Departamento',
    local_comercial: 'Local Comercial',
    oficina: 'Oficina',
  }
  return labels[type] || type
}

export function getPropertyTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    terreno: 'Grid3x3',
    casa: 'Home',
    departamento: 'Building2',
    local_comercial: 'Store',
    oficina: 'Briefcase',
  }
  return icons[type] || 'Building'
}

export function getTrustLevel(score: number): {
  label: string
  color: string
  bgColor: string
  description: string
} {
  if (score >= 85) {
    return {
      label: 'Excelente',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      description: 'Documentación completa y verificada. Sin cargas ni gravámenes.',
    }
  } else if (score >= 70) {
    return {
      label: 'Bueno',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Documentación en orden con observaciones menores.',
    }
  } else if (score >= 50) {
    return {
      label: 'Moderado',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Se requiere verificación adicional. Proceso legal en curso.',
    }
  } else {
    return {
      label: 'Bajo',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Documentación incompleta. Se recomienda asesoría legal.',
    }
  }
}

export function getStatusLegalColor(status: string): {
  label: string
  color: string
  bgColor: string
} {
  switch (status) {
    case 'Saneado':
      return { label: 'Saneado', color: 'text-emerald-700', bgColor: 'bg-emerald-100' }
    case 'En Trámite':
      return { label: 'En Trámite', color: 'text-amber-700', bgColor: 'bg-amber-100' }
    case 'Posesión':
      return { label: 'Posesión', color: 'text-red-700', bgColor: 'bg-red-100' }
    default:
      return { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' }
  }
}

export function parseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

export function getWhatsAppLink(propertyId: string, propertyTitle: string, trustScore: number): string {
  const message = encodeURIComponent(
    `Hola, deseo asesoría técnica sobre la propiedad "${propertyTitle}" (ID: ${propertyId}) con Trust Score ${trustScore}/100. ¿Podrían brindarme más información?`
  )
  return `https://wa.me/51999999999?text=${message}`
}

export function calculateClosingCosts(price: number): {
  precio: number
  alcabala: number
  gastosNotariales: number
  gastosRegistrales: number
  total: number
} {
  // Alcabala: 3% del valor autoavalúo (aproximado como 80% del precio de venta)
  const valorAutoavaluo = price * 0.8
  const UIT = 5150 // UIT 2025 Perú
  const alcabalaBase = valorAutoavaluo - (15 * UIT) // 15 UIT están inafectas
  const alcabala = alcabalaBase > 0 ? alcabalaBase * 0.03 : 0

  // Gastos notariales: ~1.5% del precio (varía)
  const gastosNotariales = price * 0.015

  // Gastos registrales: ~0.3% del precio
  const gastosRegistrales = price * 0.003

  const total = price + alcabala + gastosNotariales + gastosRegistrales

  return {
    precio: price,
    alcabala: Math.round(alcabala),
    gastosNotariales: Math.round(gastosNotariales),
    gastosRegistrales: Math.round(gastosRegistrales),
    total: Math.round(total),
  }
}
