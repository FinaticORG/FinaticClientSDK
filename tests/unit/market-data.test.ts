import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

describe('MarketDataWrapper contract', () => {
  it('market data wrapper is not currently generated', () => {
    const file = path.resolve(__dirname, '../../src/wrappers/market-data.ts');
    expect(existsSync(file)).toBe(false);
  });

  it('current public api modules still include session/company/brokers', () => {
    const sessionApi = readFileSync(
      path.resolve(__dirname, '../../src/openapi/api/session-api.ts'),
      'utf8',
    );
    const companyApi = readFileSync(
      path.resolve(__dirname, '../../src/openapi/api/company-api.ts'),
      'utf8',
    );
    const brokersApi = readFileSync(
      path.resolve(__dirname, '../../src/openapi/api/brokers-api.ts'),
      'utf8',
    );
    expect(sessionApi).toContain('export class SessionApi');
    expect(companyApi).toContain('export class CompanyApi');
    expect(brokersApi).toContain('export class BrokersApi');
  });
});
