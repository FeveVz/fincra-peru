import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fincra2025'
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

// In-memory rate limiting (per IP)
const attempts: Map<string, { count: number; lockedUntil: number }> = new Map()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const record = attempts.get(ip)
  const now = Date.now()

  if (!record) {
    attempts.set(ip, { count: 0, lockedUntil: 0 })
    return { allowed: true, remaining: MAX_ATTEMPTS }
  }

  // Reset if lockout expired
  if (record.lockedUntil && now > record.lockedUntil) {
    record.count = 0
    record.lockedUntil = 0
  }

  // Check if currently locked out
  if (record.lockedUntil && now <= record.lockedUntil) {
    const remainingMs = record.lockedUntil - now
    const remainingMin = Math.ceil(remainingMs / 60000)
    return { allowed: false, remaining: -remainingMin }
  }

  const remaining = MAX_ATTEMPTS - record.count
  return { allowed: remaining > 0, remaining }
}

function recordFailedAttempt(ip: string) {
  const record = attempts.get(ip) || { count: 0, lockedUntil: 0 }
  record.count += 1
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS
  }
  attempts.set(ip, record)
}

function resetAttempts(ip: string) {
  attempts.delete(ip)
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limiting check
    const { allowed, remaining } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Demasiados intentos. Intenta de nuevo en ${Math.abs(remaining)} minutos.`,
          locked: true,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Contraseña requerida', remaining: remaining - 1 },
        { status: 400 }
      )
    }

    // Timing-safe comparison (basic)
    if (password === ADMIN_PASSWORD) {
      resetAttempts(ip)
      // Generate a session token (simple hash)
      const sessionToken = Buffer.from(
        `${ip}:${Date.now()}:${ADMIN_PASSWORD}`
      ).toString('base64')
      return NextResponse.json({
        success: true,
        token: sessionToken,
        message: 'Acceso concedido',
      })
    }

    recordFailedAttempt(ip)
    return NextResponse.json(
      {
        error: 'Contraseña incorrecta',
        remaining: MAX_ATTEMPTS - (attempts.get(ip)?.count || 1),
      },
      { status: 401 }
    )
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
