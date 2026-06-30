import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

describe('MarketDataWrapper contract', () => {
  it('market data wrapper is not currently generated', () => {
    const file = path.resolve(__dirname, '../../src/wrappers/market-data.ts');
    expect(existsSync(file)).toBe(false);
  });

  it('current generated api modules expose session without legacy beta broker/company clients', () => {
    const sessionApi = readFileSync(
      path.resolve(__dirname, '../../src/openapi/api/session-api.ts'),
      'utf8',
    );
    const companyApi = path.resolve(__dirname, '../../src/openapi/api/company-api.ts');
    const brokersApi = path.resolve(__dirname, '../../src/openapi/api/brokers-api.ts');

    expect(sessionApi).toContain('export class SessionApi');
    expect(existsSync(companyApi)).toBe(false);
    expect(existsSync(brokersApi)).toBe(false);
  });
});
