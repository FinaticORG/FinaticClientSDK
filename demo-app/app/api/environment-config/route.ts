import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') as 'sandbox' | 'live' | null;
    const environment = searchParams.get('environment') as 'dev' | 'staging' | 'prod' | null;

    if (!mode || !environment) {
      return NextResponse.json(
        { error: 'Mode and environment parameters are required' },
        { status: 400 }
      );
    }

    // Get API key based on mode
    const apiKeyEnvVar = mode === 'sandbox' ? 'FINATIC_API_KEY_SANDBOX' : 'FINATIC_API_KEY_LIVE';
    const apiKey = process.env[apiKeyEnvVar] || process.env.FINATIC_API_KEY;

    // Get API URL based on environment
    const apiUrlEnvVar = `FINATIC_API_URL_${environment.toUpperCase()}`;
    const apiUrl = process.env[apiUrlEnvVar] || process.env.FINATIC_API_URL || 'http://localhost:8000';

    // Get public API URL based on environment
    const publicApiUrlEnvVar = `NEXT_PUBLIC_FINATIC_API_URL_${environment.toUpperCase()}`;
    const publicApiUrl = process.env[publicApiUrlEnvVar] || process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';

    return NextResponse.json({
      apiKey: apiKey || null,
      apiUrl,
      publicApiUrl,
      mode,
      environment,
    });
  } catch (error) {
    console.error('Error getting environment config:', error);
    return NextResponse.json(
      { error: 'Failed to get environment configuration' },
      { status: 500 }
    );
  }
}
