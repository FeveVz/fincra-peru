import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - fetch single property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const transformed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(property as Record<string, unknown>)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      transformed[camelKey] = value
    }

    return NextResponse.json({ property: transformed })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}

// PUT - update property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Map camelCase to snake_case
    const row: Record<string, unknown> = {}
    if (body.title !== undefined) row.title = body.title
    if (body.slug !== undefined) row.slug = body.slug
    if (body.description !== undefined) row.description = body.description
    if (body.operationType !== undefined) row.operation_type = body.operationType
    if (body.propertyType !== undefined) row.property_type = body.propertyType
    if (body.department !== undefined) row.department = body.department
    if (body.province !== undefined) row.province = body.province
    if (body.district !== undefined) row.district = body.district
    if (body.address !== undefined) row.address = body.address || null
    if (body.latitude !== undefined) row.latitude = body.latitude || null
    if (body.longitude !== undefined) row.longitude = body.longitude || null
    if (body.zone !== undefined) row.zone = body.zone || null
    if (body.areaTotal !== undefined) row.area_total = parseFloat(body.areaTotal)
    if (body.areaBuilt !== undefined) row.area_built = body.areaBuilt ? parseFloat(body.areaBuilt) : null
    if (body.areaFront !== undefined) row.area_front = body.areaFront ? parseFloat(body.areaFront) : null
    if (body.price !== undefined) {
      row.price = parseFloat(body.price)
      if (body.areaTotal) row.precio_m2 = parseFloat(body.price) / parseFloat(body.areaTotal)
    }
    if (body.trustScore !== undefined) row.trust_score = parseInt(body.trustScore)
    if (body.statusLegal !== undefined) row.status_legal = body.statusLegal
    if (body.cargasLegales !== undefined) row.cargas_legales = body.cargasLegales || null
    if (body.impuestoPredial !== undefined) row.impuesto_predial = body.impuestoPredial ? parseFloat(body.impuestoPredial) : null
    if (body.certificadoBusqueda !== undefined) row.certificado_busqueda = body.certificadoBusqueda || null
    if (body.comparisonMarket !== undefined) row.comparison_market = body.comparisonMarket ? parseFloat(body.comparisonMarket) : null
    if (body.urbanServices !== undefined) row.urban_services = body.urbanServices || '{}'
    if (body.dormitorios !== undefined) row.dormitorios = body.dormitorios ? parseInt(body.dormitorios) : null
    if (body.banos !== undefined) row.banos = body.banos ? parseInt(body.banos) : null
    if (body.estacionamiento !== undefined) row.estacionamiento = body.estacionamiento ? parseInt(body.estacionamiento) : null
    if (body.pisos !== undefined) row.pisos = body.pisos ? parseInt(body.pisos) : null
    if (body.anoConstruccion !== undefined) row.ano_construccion = body.anoConstruccion ? parseInt(body.anoConstruccion) : null
    if (body.materialConstruccion !== undefined) row.material_construccion = body.materialConstruccion || null
    if (body.imageUrl !== undefined) row.image_url = body.imageUrl || null
    if (body.imageGallery !== undefined) row.image_gallery = body.imageGallery || '[]'
    if (body.kuulaUrl !== undefined) row.kuula_url = body.kuulaUrl || null
    if (body.droneVideoUrl !== undefined) row.drone_video_url = body.droneVideoUrl || null
    if (body.features !== undefined) row.features = body.features || '[]'
    if (body.featured !== undefined) row.featured = body.featured
    if (body.active !== undefined) row.active = body.active

    row.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('properties')
      .update(row)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const transformed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      transformed[camelKey] = value
    }

    return NextResponse.json({ property: transformed })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

// DELETE - delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
