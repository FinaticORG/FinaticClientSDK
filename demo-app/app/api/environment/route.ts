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
    if (updatedVars.FINATIC_API_KEY || updatedVars.FINATIC_API_URL) {
      newContent += '\n# Finatic API Configuration\n';
      if (updatedVars.FINATIC_API_KEY) {
        newContent += `FINATIC_API_KEY=${updatedVars.FINATIC_API_KEY}\n`;
      }
      if (updatedVars.FINATIC_API_URL) {
        newContent += `FINATIC_API_URL=${updatedVars.FINATIC_API_URL}\n`;
      }
    }

    // Add Next.js Public Variables section
    const publicVars = Object.keys(updatedVars).filter(key => key.startsWith('NEXT_PUBLIC_'));
    if (publicVars.length > 0) {
      newContent += '\n# Next.js Public Variables (available in browser)\n';
      if (updatedVars.NEXT_PUBLIC_FINATIC_API_URL) {
        newContent += `NEXT_PUBLIC_FINATIC_API_URL=${updatedVars.NEXT_PUBLIC_FINATIC_API_URL}\n`;
      }
    }

    // Add Mock Mode Configuration section
    const mockVars = Object.keys(updatedVars).filter(
      key => key.includes('MOCK') || key.includes('USE_MOCKS')
    );
    if (mockVars.length > 0) {
      newContent += '\n# Mock Mode Configuration\n';
      if (updatedVars.NEXT_PUBLIC_FINATIC_USE_MOCKS !== undefined) {
        newContent += `NEXT_PUBLIC_FINATIC_USE_MOCKS=${updatedVars.NEXT_PUBLIC_FINATIC_USE_MOCKS}\n`;
      }
      if (updatedVars.NEXT_PUBLIC_FINATIC_MOCK_API_ONLY !== undefined) {
        newContent += `NEXT_PUBLIC_FINATIC_MOCK_API_ONLY=${updatedVars.NEXT_PUBLIC_FINATIC_MOCK_API_ONLY}\n`;
      }
    }

    // Add any other variables that don't fit the above categories
    const otherVars = Object.keys(updatedVars).filter(
      key =>
        !key.startsWith('NEXT_PUBLIC_') &&
        !key.includes('FINATIC_API') &&
        !key.includes('MOCK') &&
        !key.includes('USE_MOCKS')
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
