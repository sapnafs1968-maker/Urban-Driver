import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    application: 'Urban Driver',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    demo_mode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE || 'true',
    timestamp: new Date().toISOString(),
  });
}
