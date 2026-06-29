import { describe, expect, it } from 'vitest';

import { appendStageToURL } from './url-utils';

describe('appendStageToURL', () => {
  it('omits stage when no stages are provided', () => {
    expect(appendStageToURL('https://portal.example.com/?token=abc')).toBe(
      'https://portal.example.com/?token=abc',
    );
  });

  it('appends a single stage filter', () => {
    expect(
      appendStageToURL('https://portal.example.com/?token=abc', ['production']),
    ).toBe('https://portal.example.com/?token=abc&stage=production');
  });

  it('uses stage=all when every stage is selected', () => {
    expect(
      appendStageToURL('https://portal.example.com/?token=abc', [
        'production',
        'beta',
        'alpha',
      ]),
    ).toBe('https://portal.example.com/?token=abc&stage=all');
  });
});
