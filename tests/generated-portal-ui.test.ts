import { PortalUI } from '../src/generated/portal/PortalUI';

function createElement(tag: string): any {
  return {
    tag,
    style: { cssText: '', overflow: '', position: '', width: '', top: '', height: '' },
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
    src: '',
  };
}

describe('Generated PortalUI coverage', () => {
  const originalWindow = global.window;
  const originalDocument = global.document;

  beforeEach(() => {
    const body = {
      style: { cssText: '', overflow: '', position: '', width: '', top: '' },
      appendChild: jest.fn(),
    };

    (global as any).document = {
      body,
      createElement: jest.fn((tag: string) => createElement(tag)),
    };

    (global as any).window = {
      scrollY: 0,
      location: { hostname: 'localhost' },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scrollTo: jest.fn(),
    };
  });

  afterEach(() => {
    (global as any).window = originalWindow;
    (global as any).document = originalDocument;
  });

  it('exercises show/hide and message handling branches', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const onClose = jest.fn();

    const portalUI = new PortalUI('https://portal.example.com/connect');
    portalUI.show('https://portal.example.com/connect', 'session-id', {
      onSuccess,
      onError,
      onClose,
    });

    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: { type: 'portal-success', userId: 'user-1' },
    });
    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: { type: 'portal-error', error: 'boom' },
    });
    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: { type: 'portal-resize', height: 420 },
    });
    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: { type: 'portal-close' },
    });
    (portalUI as any).handleMessage({
      origin: 'https://different.example.com',
      data: { type: 'portal-success', userId: 'ignored' },
    });
    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: { type: 'unknown-message-type' },
    });

    portalUI.hide();

    expect(onSuccess).toHaveBeenCalledWith('user-1');
    expect(onError).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
