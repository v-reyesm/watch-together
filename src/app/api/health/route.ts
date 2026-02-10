import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    status: 'ok',
    message: 'API is healthy',
    timestamp,
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0'
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
}