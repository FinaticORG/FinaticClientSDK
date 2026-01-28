import { NextResponse } from 'next/server';
import { getApiKey, getApiUrl, type EnvironmentMode, type EnvironmentType } from '@/lib/utils';

async function handleRequest(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') as EnvironmentMode | null) || 'live';
    const environment = (searchParams.get('environment') as EnvironmentType | null) || 'dev';

    // Get API key and URL from environment variables based on mode and environment
    const apiKey = getApiKey(mode, environment);
    const apiUrl = getApiUrl(environment, 'http://localhost:8000');

    console.log('Using API key:', apiKey ? 'present' : 'missing');
    console.log('Using API URL:', apiUrl);
    console.log('Using mode/environment:', mode, environment);

    if (!apiKey) {
      console.log('No Finatic API key found for selected mode and environment');
      return NextResponse.json(
        {
          error:
            'Server configuration error - missing Finatic API key for selected mode/environment',
        },
        { status: 500 }
      );
    }

    // Make request to Finatic API
    const response = await fetch(`${apiUrl}/api/beta/session/init`, {
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
