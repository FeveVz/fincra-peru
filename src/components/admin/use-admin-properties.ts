'use client'

import { useState, useEffect } from 'react'
import { formatPrice, getPropertyTypeLabel } from '@/lib/property-utils'

interface Property {
  id: string
  title: string
  slug: string
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

export function useAdminProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    avgTrust: 0,
    totalValue: 0,
    byDepartment: {} as Record<string, number>,
    byStatusLegal: { Saneado: 0, 'En Trámite': 0, Posesión: 0 },
  })

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      if (data.properties) {
        const props = data.properties as Property[]
        setProperties(props)
        updateStats(props)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (props: Property[]) => {
    const active = props.filter((p) => p.active)
    setStats({
      total: props.length,
      active: active.length,
      featured: active.filter((p) => p.featured).length,
      avgTrust: props.length > 0 ? Math.round(props.reduce((a, p) => a + p.trustScore, 0) / props.length) : 0,
      totalValue: props.reduce((a, p) => a + p.price, 0),
      byDepartment: props.reduce((acc, p) => {
        acc[p.department] = (acc[p.department] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byStatusLegal: {
        Saneado: props.filter((p) => p.statusLegal === 'Saneado').length,
        'En Trámite': props.filter((p) => p.statusLegal === 'En Trámite').length,
        Posesión: props.filter((p) => p.statusLegal === 'Posesión').length,
      },
    })
  }

  const deleteProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchProperties()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const toggleActive = async (property: Property) => {
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !property.active }),
      })
      if (res.ok) await fetchProperties()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const toggleFeatured = async (property: Property) => {
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !property.featured }),
      })
      if (res.ok) await fetchProperties()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  return { properties, loading, stats, fetchProperties, deleteProperty, toggleActive, toggleFeatured }
}
