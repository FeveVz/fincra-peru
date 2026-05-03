import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const department = searchParams.get('department')
    const propertyType = searchParams.get('propertyType')
    const operationType = searchParams.get('operationType')
    const statusLegal = searchParams.get('statusLegal')
    const sortBy = searchParams.get('sortBy') // price_asc, price_desc, trust_desc, plusvalia
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const minTrust = searchParams.get('minTrust')

    const where: Record<string, unknown> = { active: true }

    if (department && department !== 'all') where.department = department
    if (propertyType && propertyType !== 'all') where.propertyType = propertyType
    if (operationType && operationType !== 'all') where.operationType = operationType
    if (statusLegal && statusLegal !== 'all') where.statusLegal = statusLegal
    if (minTrust) where.trustScore = { gte: parseInt(minTrust) }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, unknown> = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      where.price = priceFilter
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { district: { contains: search } },
        { province: { contains: search } },
        { department: { contains: search } },
      ]
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' }
    if (sortBy === 'price_asc') orderBy = { price: 'asc' }
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' }
    else if (sortBy === 'trust_desc') orderBy = { trustScore: 'desc' }
    else if (sortBy === 'plusvalia') orderBy = { comparisonMarket: 'desc' }
    else if (sortBy === 'mejor_plusvalia') orderBy = { comparisonMarket: 'desc' }
    else if (sortBy === 'mayor_seguridad') orderBy = { trustScore: 'desc' }

    const properties = await db.property.findMany({
      where,
      orderBy,
    })

    return NextResponse.json({ properties, total: properties.length })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}
