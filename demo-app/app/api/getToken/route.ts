import { NextResponse } from 'next/server';

async function handleRequest(request: Request) {
  try {
    // Get mode and environment from request headers or query params
    const url = new URL(request.url);
    const mode = (url.searchParams.get('mode') || request.headers.get('x-finatic-mode') || 'live') as 'sandbox' | 'live';
    const environment = (url.searchParams.get('environment') || request.headers.get('x-finatic-environment') || 'dev') as 'dev' | 'staging' | 'prod';

    // Log all headers for debugging
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Environment config - Mode:', mode, 'Environment:', environment);

    // Check if mock mode is enabled
    const isMockMode = process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true';

    if (isMockMode) {
      console.log('🔧 Mock mode enabled - returning mock token');

      // Return mock session init response (matching production format)
      const mockResponse = {
        success: true,
        message: 'Session initialized successfully',
        data: {
          one_time_token: 'mock_token_' + Date.now(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        },
      };

      return NextResponse.json(mockResponse);
    }

    // Get API key from environment variables based on mode
    const apiKeyEnvVar = mode === 'sandbox' ? 'FINATIC_API_KEY_SANDBOX' : 'FINATIC_API_KEY_LIVE';
    const apiKey = process.env[apiKeyEnvVar] || process.env.FINATIC_API_KEY;
    
    // Get API URL from environment variables based on environment
    const apiUrlEnvVar = `FINATIC_API_URL_${environment.toUpperCase()}`;
    const apiUrl = process.env[apiUrlEnvVar] || process.env.FINATIC_API_URL || 'http://localhost:8000';

    console.log('Using server-side API key:', apiKey ? 'present' : 'missing');
    console.log('Using API URL:', apiUrl);

    if (!apiKey) {
      console.log('No Finatic API key found in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error - FINATIC_API_KEY not set' },
        { status: 500 }
      );
    }

    // Make request to Finatic API
    const response = await fetch(`${apiUrl}/api/v1/session/init`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('Finatic API response status:', response.status);
    const responseText = await response.text();
    console.log('Finatic API raw response:', responseText);

    if (!response.ok) {
      let errorMessage = 'Failed to initialize session';
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorMessage = responseText || errorMessage;
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse success response:', e);
      return NextResponse.json({ error: 'Invalid response from Finatic API' }, { status: 500 });
    }

    // Return the response from Finatic API as is
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in getToken handler:', error);
    return NextResponse.json({ error: 'Failed to initialize session' }, { status: 500 });
  }
}

// Export route handlers
export async function POST(request: Request) {
  return handleRequest(request);
}

export async function GET(request: Request) {
  return handleRequest(request);
}
