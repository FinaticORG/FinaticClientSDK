import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';

const ENV_FILE_PATH = join(process.cwd(), '.env');

export async function GET() {
  try {
    // Check if .env file exists
    try {
      await access(ENV_FILE_PATH);
    } catch {
      // If .env doesn't exist, return empty object
      return NextResponse.json({});
    }

    // Read the .env file
    const envContent = await readFile(ENV_FILE_PATH, 'utf-8');

    // Parse environment variables
    const envVars: Record<string, string> = {};
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          envVars[key.trim()] = value;
        }
      }
    }

    return NextResponse.json(envVars);
  } catch (error) {
    console.error('Error reading environment file:', error);
    return NextResponse.json({ error: 'Failed to read environment file' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const envData = await request.json();

    // Read existing .env file if it exists
    let existingContent = '';
    try {
      await access(ENV_FILE_PATH);
      existingContent = await readFile(ENV_FILE_PATH, 'utf-8');
    } catch {
      // File doesn't exist, start with empty content
    }

    // Parse existing environment variables
    const existingVars: Record<string, string> = {};
    const lines = existingContent.split('\n');
    const generalComments: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        // Only preserve comments that are NOT section headers
        if (
          !trimmedLine.includes('Configuration') &&
          !trimmedLine.includes('Variables') &&
          !trimmedLine.includes('Mode')
        ) {
          generalComments.push(line);
        }
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          existingVars[key.trim()] = value;
        }
      }
    }

    // Merge with new data
    const updatedVars = { ...existingVars, ...envData };

    // Generate new .env content
    let newContent = '';

    // Add general comments (not section headers)
    if (generalComments.length > 0) {
      newContent += generalComments.join('\n') + '\n';
    }

    // Add Finatic API Configuration section
    // API Keys (mode-specific)
    const apiKeyVars = Object.keys(updatedVars).filter(
      (key) =>
        key === 'FINATIC_API_DEV_KEY' ||
        key === 'FINATIC_API_DEV_SANDBOX_KEY' ||
        key === 'FINATIC_API_STAGING_KEY' ||
        key === 'FINATIC_API_STAGING_SANDBOX_KEY' ||
        key === 'FINATIC_API_PRODUCTION_KEY' ||
        key === 'FINATIC_API_PRODUCTION_SANDBOX_KEY'
    );
    if (apiKeyVars.length > 0) {
      newContent += '\n# Finatic API Keys\n';
      if (updatedVars.FINATIC_API_DEV_KEY) {
        newContent += `FINATIC_API_DEV_KEY=${updatedVars.FINATIC_API_DEV_KEY}\n`;
      }
      if (updatedVars.FINATIC_API_DEV_SANDBOX_KEY) {
        newContent += `FINATIC_API_DEV_SANDBOX_KEY=${updatedVars.FINATIC_API_DEV_SANDBOX_KEY}\n`;
      }
      if (updatedVars.FINATIC_API_STAGING_KEY) {
        newContent += `FINATIC_API_STAGING_KEY=${updatedVars.FINATIC_API_STAGING_KEY}\n`;
      }
      if (updatedVars.FINATIC_API_STAGING_SANDBOX_KEY) {
        newContent += `FINATIC_API_STAGING_SANDBOX_KEY=${updatedVars.FINATIC_API_STAGING_SANDBOX_KEY}\n`;
      }
      if (updatedVars.FINATIC_API_PRODUCTION_KEY) {
        newContent += `FINATIC_API_PRODUCTION_KEY=${updatedVars.FINATIC_API_PRODUCTION_KEY}\n`;
      }
      if (updatedVars.FINATIC_API_PRODUCTION_SANDBOX_KEY) {
        newContent += `FINATIC_API_PRODUCTION_SANDBOX_KEY=${updatedVars.FINATIC_API_PRODUCTION_SANDBOX_KEY}\n`;
      }
    }

    // API URLs (environment-specific)
    const apiUrlVars = Object.keys(updatedVars).filter(
      (key) =>
        key === 'FINATIC_DEV_API_URL' ||
        key === 'FINATIC_STAGING_API_URL' ||
        key === 'FINATIC_PRODUCTION_API_URL'
    );
    if (apiUrlVars.length > 0) {
      newContent += '\n# Finatic API URLs (Server-side)\n';
      if (updatedVars.FINATIC_DEV_API_URL) {
        newContent += `FINATIC_DEV_API_URL=${updatedVars.FINATIC_DEV_API_URL}\n`;
      }
      if (updatedVars.FINATIC_STAGING_API_URL) {
        newContent += `FINATIC_STAGING_API_URL=${updatedVars.FINATIC_STAGING_API_URL}\n`;
      }
      if (updatedVars.FINATIC_PRODUCTION_API_URL) {
        newContent += `FINATIC_PRODUCTION_API_URL=${updatedVars.FINATIC_PRODUCTION_API_URL}\n`;
      }
    }

    // Add Next.js Public Variables section
    const publicVars = Object.keys(updatedVars).filter((key) => key.startsWith('NEXT_PUBLIC_'));
    if (publicVars.length > 0) {
      newContent += '\n# Next.js Public Variables (available in browser)\n';
      if (updatedVars.NEXT_PUBLIC_FINATIC_DEV_API_URL) {
        newContent += `NEXT_PUBLIC_FINATIC_DEV_API_URL=${updatedVars.NEXT_PUBLIC_FINATIC_DEV_API_URL}\n`;
      }
      if (updatedVars.NEXT_PUBLIC_FINATIC_STAGING_API_URL) {
        newContent += `NEXT_PUBLIC_FINATIC_STAGING_API_URL=${updatedVars.NEXT_PUBLIC_FINATIC_STAGING_API_URL}\n`;
      }
      if (updatedVars.NEXT_PUBLIC_FINATIC_PRODUCTION_API_URL) {
        newContent += `NEXT_PUBLIC_FINATIC_PRODUCTION_API_URL=${updatedVars.NEXT_PUBLIC_FINATIC_PRODUCTION_API_URL}\n`;
      }
    }

    // Add any other variables that don't fit the above categories
    const otherVars = Object.keys(updatedVars).filter(
      (key) => !key.startsWith('NEXT_PUBLIC_') && !key.startsWith('FINATIC_')
    );
    if (otherVars.length > 0) {
      newContent += '\n# Other Environment Variables\n';
      for (const key of otherVars) {
        newContent += `${key}=${updatedVars[key]}\n`;
      }
    }

    // Write the new .env file
    await writeFile(ENV_FILE_PATH, newContent.trim() + '\n', 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing environment file:', error);
    return NextResponse.json({ error: 'Failed to write environment file' }, { status: 500 });
  }
}
