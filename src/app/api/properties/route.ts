import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - list all properties
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

    // Transform snake_case to camelCase
    const properties = (data || []).map((row: Record<string, unknown>) => {
      const transformed: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(row)) {
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

// POST - create property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const row: Record<string, unknown> = {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
      description: body.description,
      operation_type: body.operationType || 'venta',
      property_type: body.propertyType,
      department: body.department,
      province: body.province,
      district: body.district,
      address: body.address || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      zone: body.zone || null,
      area_total: parseFloat(body.areaTotal),
      area_built: body.areaBuilt ? parseFloat(body.areaBuilt) : null,
      area_front: body.areaFront ? parseFloat(body.areaFront) : null,
      price: parseFloat(body.price),
      precio_m2: parseFloat(body.price) / parseFloat(body.areaTotal),
      trust_score: parseInt(body.trustScore) || 50,
      status_legal: body.statusLegal || 'En Trámite',
      cargas_legales: body.cargasLegales || null,
      impuesto_predial: body.impuestoPredial ? parseFloat(body.impuestoPredial) : null,
      certificado_busqueda: body.certificadoBusqueda || null,
      comparison_market: body.comparisonMarket ? parseFloat(body.comparisonMarket) : null,
      urban_services: body.urbanServices || '{}',
      dormitorios: body.dormitorios ? parseInt(body.dormitorios) : null,
      banos: body.banos ? parseInt(body.banos) : null,
      estacionamiento: body.estacionamiento ? parseInt(body.estacionamiento) : null,
      pisos: body.pisos ? parseInt(body.pisos) : null,
      ano_construccion: body.anoConstruccion ? parseInt(body.anoConstruccion) : null,
      material_construccion: body.materialConstruccion || null,
      image_url: body.imageUrl || null,
      image_gallery: body.imageGallery || '[]',
      kuula_url: body.kuulaUrl || null,
      drone_video_url: body.droneVideoUrl || null,
      features: body.features || '[]',
      featured: body.featured || false,
      active: body.active !== false,
    }

    const { data, error } = await supabase
      .from('properties')
      .insert(row)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const transformed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      transformed[camelKey] = value
    }

    return NextResponse.json({ property: transformed }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
