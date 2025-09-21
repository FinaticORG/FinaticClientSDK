import { NextResponse } from "next/server";

async function handleRequest(request: Request) {
  try {
    // Log all headers for debugging
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    // Check if mock mode is enabled
    const isMockMode = process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true';
    
    if (isMockMode) {
      console.log("🔧 Mock mode enabled - returning mock token");
      
      // Return mock session init response (matching production format)
      const mockResponse = {
        success: true,
        message: "Session initialized successfully",
        data: {
          one_time_token: "mock_token_" + Date.now(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        }
      };
      
      return NextResponse.json(mockResponse);
    }
    
    // Get environment preference from request (query param or body)
    const url = new URL(request.url);
    const environmentParam = url.searchParams.get('environment');
    let requestBody = null;
    
    try {
      if (request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')) {
        requestBody = await request.json();
      }
    } catch (e) {
      // Ignore JSON parsing errors for non-JSON requests
    }
    
    // Determine environment from request parameter or body
    const requestedEnv = environmentParam || requestBody?.environment || 'sandbox'; // Default to sandbox for safety
    const useSandbox = requestedEnv === 'sandbox';
    
    // Get API keys from environment variables
    const liveApiKey = process.env.FINATIC_API_KEY;
    const sandboxApiKey = process.env.FINATIC_SANDBOX_API_KEY;
    const apiUrl = process.env.FINATIC_API_URL || 'http://localhost:8000';
    
    const apiKey = useSandbox ? sandboxApiKey : liveApiKey;
    const keyType = useSandbox ? 'sandbox' : 'live';
    
    console.log(`Using ${keyType} API key (requested: ${requestedEnv}):`, apiKey ? "present" : "missing");
    console.log("API Key prefix:", apiKey ? apiKey.substring(0, 15) + "..." : "none");
    console.log("Using API URL:", apiUrl);
    
    if (!apiKey) {
      const missingKey = useSandbox ? 'FINATIC_SANDBOX_API_KEY' : 'FINATIC_API_KEY';
      console.log(`No ${keyType} API key found in environment variables`);
      return NextResponse.json(
        { error: `Server configuration error - ${missingKey} not set` },
        { status: 500 }
      );
    }

    // Make request to Finatic API
    const response = await fetch(`${apiUrl}/api/v1/auth/session/init`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log("Finatic API response status:", response.status);
    const responseText = await response.text();
    console.log("Finatic API raw response:", responseText);

    if (!response.ok) {
      let errorMessage = "Failed to initialize session";
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        console.error("Failed to parse error response:", e);
        errorMessage = responseText || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse success response:", e);
      return NextResponse.json(
        { error: "Invalid response from Finatic API" },
        { status: 500 }
      );
    }
    
    // Return the response from Finatic API as is
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in getToken handler:", error);
    return NextResponse.json(
      { error: "Failed to initialize session" },
      { status: 500 }
    );
  }
}

// Export route handlers
export async function POST(request: Request) {
  return handleRequest(request);
}

export async function GET(request: Request) {
  return handleRequest(request);
} 