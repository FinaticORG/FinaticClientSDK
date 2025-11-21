import { NextResponse } from 'next/server';

async function handleRequest(request: Request) {
  try {
    // Check if mock mode is enabled
    const isMockMode = process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true';

    if (isMockMode) {
      console.log('🔧 Mock mode enabled - returning mock token');

      // Return mock session init response (matching new FinaticResponse format)
      const mockResponse = {
        _id: 'mock_' + Date.now(),
        success: {
          data: {
            one_time_token: 'mock_token_' + Date.now(),
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          },
          meta: {
            trace_id: 'mock_trace_' + Date.now(),
          },
        },
        error: null,
        warning: null,
      };

      return NextResponse.json(mockResponse);
    }

    // Get API key and URL from environment variables (simplified)
    const apiKey = process.env.FINATIC_API_KEY;
    const apiUrl = process.env.FINATIC_API_URL || 'http://localhost:8000';

    console.log('Using API key:', apiKey ? 'present' : 'missing');
    console.log('Using API URL:', apiUrl);

    if (!apiKey) {
      console.log('No Finatic API key found (FINATIC_API_KEY not set)');
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

    // Return the response from Finatic API as is (already in FinaticResponse format)
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
