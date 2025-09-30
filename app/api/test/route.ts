import { NextRequest, NextResponse } from 'next/server'

// Simple test API to verify the backend structure is working
export async function GET(request: NextRequest) {
  try {
    // Test the API service
    console.log('API test endpoint called')
    
    return NextResponse.json({ 
      message: 'API is working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ error: 'API test failed' }, { status: 500 })
  }
}