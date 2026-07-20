import { coerceEnumValue } from '../../src/utils/enum-coercion';
import { convertToPlainObject } from '../../src/utils/plain-object';
import {
  appendAssetTypesToURL,
  appendBrokerFilterToURL,
  appendKindToURL,
  appendStageToURL,
  appendThemeToURL,
} from '../../src/utils/url-utils';
import { unwrapAxiosResponse } from '../../src/utils/response-utils';

describe('SDK utility branches', () => {
  it('applies portal URL filters and preserves invalid URLs', () => {
    const base = 'https://portal.example.test/connect?existing=1';

    expect(appendThemeToURL(base, 'dark')).toContain('theme=dark');
    expect(appendThemeToURL(base, { preset: 'light' })).toContain('theme=light');
    expect(appendThemeToURL(base, { custom: { color: 'blue' } })).toContain('themeObject=');
    expect(appendThemeToURL('not a url', 'dark')).toBe('not a url');

    expect(appendBrokerFilterToURL(base, ['schwab', 'fidelity'])).toContain('brokers=');
    expect(appendBrokerFilterToURL(base, [])).toBe(base);
    expect(appendBrokerFilterToURL('not a url', ['schwab'])).toBe('not a url');

    expect(appendKindToURL(base, 'broker')).toContain('type=broker');
    expect(appendKindToURL(base)).toBe(base);
    expect(appendKindToURL('not a url', 'exchange')).toBe('not a url');

    expect(appendAssetTypesToURL(base, ['equity', 'options'])).toContain(
      'capabilities=equity%2Coptions',
    );
    expect(appendAssetTypesToURL(base, [])).toBe(base);
    expect(appendAssetTypesToURL('not a url', ['equity'])).toBe('not a url');

    expect(appendStageToURL(base, ['production', 'beta', 'alpha'])).toContain('stage=all');
    expect(appendStageToURL(base, ['production', 'production'])).toContain('stage=production');
    expect(appendStageToURL(base, [])).toBe(base);
    expect(appendStageToURL('not a url', ['production'])).toBe('not a url');
  });

  it('coerces enums, unwraps responses, and converts model-like objects', () => {
    const Status = {
      Pending: 'PENDING',
      Complete: 'COMPLETE',
    } as const;

    expect(coerceEnumValue(undefined, Status, 'status')).toBeUndefined();
    expect(coerceEnumValue('complete', Status, 'status')).toBe('COMPLETE');
    expect(coerceEnumValue('Pending', Status, 'status')).toBe('PENDING');
    expect(() => coerceEnumValue('bad', Status, 'status')).toThrow('Invalid status');

    expect(unwrapAxiosResponse({ data: { ok: true } })).toEqual({ ok: true });
    expect(unwrapAxiosResponse('plain')).toBe('plain');

    class GeneratedModel {
      public keep = 'yes';
      public _id = 'internal';
      public metadata = null;
      public nested = [{ _id: 'nested', value: 1 }];
    }

    expect(convertToPlainObject(new GeneratedModel())).toEqual({
      keep: 'yes',
      nested: [{ value: 1 }],
    });
    expect(convertToPlainObject(null)).toBeNull();
  });
});
