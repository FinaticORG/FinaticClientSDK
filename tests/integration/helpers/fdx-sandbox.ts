/**
 * FDX Phase 7 sandbox helpers for Client SDK live-stack integration tests.
 */

import { createHash, randomUUID } from 'crypto';

import axios from 'axios';
import { Client } from 'pg';

import type { FinaticV1Response } from '../../../src/wrappers/v1';

const SANDBOX_USER_ID_NAMESPACE = '2221c296-b144-5ebc-847b-08412e806b8c';

function uuidV5(name: string, namespaceUuid: string): string {
  const namespaceBytes = Buffer.from(namespaceUuid.replace(/-/g, ''), 'hex');
  const hash = createHash('sha1').update(namespaceBytes).update(name, 'utf8').digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const DEVICE_HEADERS: Record<string, string> = {
  'user-agent': 'finatic-client-sdk-integration',
  'accept-language': 'en-US',
  'sec-ch-ua': '"Chromium";v="124"',
  'sec-ch-ua-platform': '"Linux"',
};

export const DEFAULT_API_BASE_URL = process.env['FINATIC_API_BASE_URL'] ?? 'http://127.0.0.1:8000';
export const DEFAULT_DATABASE_URL =
  process.env['FINATIC_DATABASE_URL'] ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export function integrationEnabled(): boolean {
  return process.env['FINATIC_INTEGRATION'] === '1';
}

export function sandboxUserIdFromEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email cannot be empty');
  }
  return uuidV5(normalizedEmail, SANDBOX_USER_ID_NAMESPACE);
}

export interface SandboxBootstrapResult {
  sandboxApiKey: string;
  accountId: string;
  cleanup: () => Promise<void>;
}

export async function bootstrapSandboxApiKey(): Promise<SandboxBootstrapResult> {
  const existingApiKey = process.env['FINATIC_SANDBOX_API_KEY'];
  if (existingApiKey) {
    return {
      sandboxApiKey: existingApiKey,
      accountId: process.env['FINATIC_SANDBOX_ACCOUNT_ID'] ?? '',
      cleanup: async () => undefined,
    };
  }

  const sandboxApiKey = `fntc_sandbox_test_${randomUUID().replace(/-/g, '')}`;
  const sandboxApiKeyHash = createHash('sha256').update(sandboxApiKey).digest('hex');
  const accountId = randomUUID();
  const testEmail = `sandbox-${accountId.slice(0, 8)}@test.company`;

  const databaseClient = new Client({ connectionString: DEFAULT_DATABASE_URL });
  await databaseClient.connect();
  try {
    await databaseClient.query(
      `
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password,
          email_confirmed_at, created_at, updated_at, confirmation_token,
          email_change_token_new, recovery_token
        ) VALUES (
          $1::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          $2, '', NOW(), NOW(), NOW(), '', '', ''
        )
        ON CONFLICT (id) DO NOTHING
      `,
      [accountId, testEmail]
    );
    await databaseClient.query(
      `
        INSERT INTO accounts (
          id, name, email, is_personal_account, primary_owner_user_id,
          public_data, sandbox_api_key_hash, sandbox_key_created_at,
          sandbox_key_expires_at, trading_enabled
        ) VALUES (
          $1::uuid, $2, $3, true, $1::uuid,
          '{}'::jsonb, $4, NOW(), NULL, true
        )
        ON CONFLICT (id) DO UPDATE SET
          sandbox_api_key_hash = EXCLUDED.sandbox_api_key_hash,
          sandbox_key_created_at = EXCLUDED.sandbox_key_created_at,
          trading_enabled = EXCLUDED.trading_enabled
      `,
      [accountId, 'Client SDK Integration Sandbox Company', testEmail, sandboxApiKeyHash]
    );
  } finally {
    await databaseClient.end();
  }

  return {
    sandboxApiKey,
    accountId,
    cleanup: async () => {
      const cleanupClient = new Client({ connectionString: DEFAULT_DATABASE_URL });
      await cleanupClient.connect();
      try {
        await cleanupClient.query('DELETE FROM accounts WHERE id = $1::uuid', [accountId]);
        await cleanupClient.query('DELETE FROM auth.users WHERE id = $1::uuid', [accountId]);
      } finally {
        await cleanupClient.end();
      }
    },
  };
}

export async function assertApiReachable(baseUrl: string = DEFAULT_API_BASE_URL): Promise<void> {
  try {
    await axios.get(`${baseUrl}/api/v1/sessions`, {
      validateStatus: () => true,
      timeout: 5_000,
    });
  } catch {
    throw new Error(
      `finaticAPI not reachable at ${baseUrl}. Start the local stack before FINATIC_INTEGRATION=1 tests.`
    );
  }
}

export async function bootstrapSandboxOneTimeToken(
  apiKey: string,
  baseUrl: string = DEFAULT_API_BASE_URL
): Promise<string> {
  const response = await axios.post(`${baseUrl}/api/v1/session/init`, undefined, {
    headers: {
      'x-api-key': apiKey,
      'X-Finatic-Environment': 'sandbox',
      ...DEVICE_HEADERS,
    },
    validateStatus: () => true,
  });
  if (response.status !== 200) {
    throw new Error(`Session init failed: ${response.status} ${JSON.stringify(response.data)}`);
  }

  const data = response.data?.success?.data ?? response.data?.data;
  const token = data?.one_time_token ?? data?.oneTimeToken;
  if (typeof token !== 'string' || !token) {
    throw new Error(`Session init returned no one-time token: ${JSON.stringify(response.data)}`);
  }
  return token;
}

export function assertClientV1Success<T>(response: FinaticV1Response<T>): T {
  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }
  if (!response.success?.data) {
    throw new Error(`Missing success data: ${JSON.stringify(response)}`);
  }
  return response.success.data;
}
