import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Map camelCase from frontend to snake_case for Supabase
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const department = searchParams.get('department')
    const propertyType = searchParams.get('propertyType')
    const operationType = searchParams.get('operationType')
    const statusLegal = searchParams.get('statusLegal')
    const sortBy = searchParams.get('sortBy')
    const search = searchParams.get('search')
    const minTrust = searchParams.get('minTrust')

    let query = supabase
      .from('properties')
      .select('*')
      .eq('active', true)

    if (department && department !== 'all') query = query.eq('department', department)
    if (propertyType && propertyType !== 'all') query = query.eq('property_type', propertyType)
    if (operationType && operationType !== 'all') query = query.eq('operation_type', operationType)
    if (statusLegal && statusLegal !== 'all') query = query.eq('status_legal', statusLegal)
    if (minTrust) query = query.gte('trust_score', parseInt(minTrust))

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,district.ilike.%${search}%,province.ilike.%${search}%,department.ilike.%${search}%`
      )
    }

    // Sorting
    if (sortBy === 'price_asc' || sortBy === 'mejor_plusvalia') query = query.order('price', { ascending: true })
    else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
    else if (sortBy === 'trust_desc' || sortBy === 'mayor_seguridad') query = query.order('trust_score', { ascending: false })
    else if (sortBy === 'plusvalia') query = query.order('comparison_market', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }

    // Transform snake_case to camelCase for frontend
    const properties = (data || []).map((row: Record<string, unknown>) => {
      const transformed: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(row)) {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        transformed[camelKey] = value
      }
      return transformed
    })

    return NextResponse.json({ properties, total: properties.length })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}
