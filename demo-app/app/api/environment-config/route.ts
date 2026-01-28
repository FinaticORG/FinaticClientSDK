import { NextRequest, NextResponse } from 'next/server';
import {
  getApiKey,
  getApiUrl,
  getPublicApiUrl,
  type EnvironmentMode,
  type EnvironmentType,
} from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') as EnvironmentMode | null;
    const environment = searchParams.get('environment') as EnvironmentType | null;

    if (!mode || !environment) {
      return NextResponse.json(
        { error: 'Mode and environment parameters are required' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey(mode, environment);
    const apiUrl = getApiUrl(environment, 'http://localhost:8000');
    const publicApiUrl = getPublicApiUrl(environment, 'http://localhost:8000');

    return NextResponse.json({
      apiKey: apiKey || null,
      apiUrl,
      publicApiUrl,
      mode,
      environment,
    });
  } catch (error) {
    console.error('Error getting environment config:', error);
    return NextResponse.json({ error: 'Failed to get environment configuration' }, { status: 500 });
  }
}
