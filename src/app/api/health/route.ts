import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[Healthcheck] GET /api/health - Request received')
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Business Strategy Automation',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0'
    }
    
    console.log('[Healthcheck] Response:', JSON.stringify(response))
    
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('[Healthcheck] Error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// HEADメソッドもサポート（Railwayのヘルスチェックで使用される場合がある）
export async function HEAD() {
  console.log('[Healthcheck] HEAD /api/health - Request received')
  return new NextResponse(null, { status: 200 })
} 