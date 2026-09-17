import { PortalUI } from '../src/portal/PortalUI';

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
      innerWidth: 1280,
      innerHeight: 800,
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
    const onEvent = jest.fn();

    const portalUI = new PortalUI('https://portal.example.com/connect');
    const hideSpy = jest.spyOn(portalUI, 'hide');
    portalUI.show('https://portal.example.com/connect', 'session-id', {
      onSuccess,
      onError,
      onClose,
      onEvent,
    });

    const iframe = (portalUI as any).iframe as {
      style: { height: string };
      setAttribute: jest.Mock;
    };
    expect(iframe.style.height).toBe('280px');
    expect(iframe.setAttribute).toHaveBeenCalledWith(
      'sandbox',
      expect.stringContaining('allow-downloads'),
    );

    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: { type: 'portal-resize', height: 420 },
    });
    expect(iframe.style.height).toBe('420px');

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
      data: {
        type: 'portal-event',
        eventName: 'account.grant.created',
        payload: {
          brokerId: 'alpaca',
          accountId: 'account-1',
          grantId: 'grant-1',
        },
      },
    });
    expect(onEvent).toHaveBeenCalledWith('account.grant.created', {
      brokerId: 'alpaca',
      accountId: 'account-1',
      grantId: 'grant-1',
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(hideSpy).not.toHaveBeenCalled();

    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: {
        type: 'portal-event',
        eventName: 123,
        payload: { ignored: true },
      },
    });
    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: { type: 'portal-close' },
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
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it('closes directly once and ignores pre-open, repeated, and re-entrant closes', () => {
    const portalUI = new PortalUI('https://portal.example.com/connect');
    const onClose = jest.fn(() => portalUI.close());

    portalUI.close();
    expect(onClose).not.toHaveBeenCalled();

    portalUI.show('https://portal.example.com/connect', 'session-id', { onClose });
    portalUI.close();
    portalUI.close();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect((portalUI as any).container.style.display).toBe('none');
    expect((portalUI as any).iframe.src).toBe('');
    expect((portalUI as any).options).toBeUndefined();
    expect(window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('forwards every valid schema-v1 lifecycle stage and connector state', () => {
    const onEvent = jest.fn();
    const portalUI = new PortalUI('https://portal.example.com/connect');
    portalUI.show('https://portal.example.com/connect', 'session-id', { onEvent });

    const payloads = [
      {
        schemaVersion: 1,
        stage: 'portal_authenticated',
        userId: 'user-1',
      },
      {
        schemaVersion: 1,
        stage: 'broker_connection_created',
        brokerId: 'mt5',
        connectionId: 'connection-1',
      },
      ...[
        'REGISTERING',
        'AWAITING_FIRST_HEARTBEAT',
        'ONLINE_NO_DATA',
        'LIVE_DATA',
        'STALE_ONLINE_NO_DATA',
        'STALE_LIVE_DATA',
        'COOLDOWN',
        'REVOKED',
        'UNKNOWN',
      ].map((state) => ({
        schemaVersion: 1,
        stage: 'push_agent_state_changed',
        brokerId: 'mt5',
        connectionId: 'connection-1',
        state,
        ...(state === 'LIVE_DATA' || state === 'STALE_LIVE_DATA'
          ? { dataReady: true }
          : state === 'ONLINE_NO_DATA' || state === 'STALE_ONLINE_NO_DATA'
            ? { dataReady: false }
            : {}),
      })),
    ];

    for (const payload of payloads) {
      (portalUI as any).handleMessage({
        origin: 'https://portal.example.com',
        data: { type: 'portal-event', eventName: 'portal.lifecycle', payload },
      });
    }

    expect(onEvent).toHaveBeenCalledTimes(payloads.length);
    payloads.forEach((payload, index) => {
      expect(onEvent).toHaveBeenNthCalledWith(index + 1, 'portal.lifecycle', payload);
    });
  });

  it('rejects malformed, unsupported, secret-bearing, and wrong-origin lifecycle events', () => {
    const onEvent = jest.fn();
    const portalUI = new PortalUI('https://portal.example.com/connect');
    portalUI.show('https://portal.example.com/connect', 'session-id', { onEvent });

    const invalidPayloads = [
      null,
      { schemaVersion: 2, stage: 'portal_authenticated', userId: 'user-1' },
      { schemaVersion: 1, stage: 'unknown', userId: 'user-1' },
      { schemaVersion: 1, stage: 'portal_authenticated' },
      { schemaVersion: 1, stage: 'portal_authenticated', userId: 'user-1', accessToken: 'secret' },
      {
        schemaVersion: 1,
        stage: 'broker_connection_created',
        brokerId: 'mt5',
        connectionId: '',
      },
      {
        schemaVersion: 1,
        stage: 'push_agent_state_changed',
        brokerId: 'mt5',
        connectionId: 'connection-1',
        state: 'NOT_A_STATE',
      },
      {
        schemaVersion: 1,
        stage: 'push_agent_state_changed',
        brokerId: 'mt5',
        connectionId: 'connection-1',
        state: 'ONLINE_NO_DATA',
        dataReady: true,
      },
      {
        schemaVersion: 1,
        stage: 'push_agent_state_changed',
        brokerId: 'mt5',
        connectionId: 'connection-1',
        state: 'LIVE_DATA',
        dataReady: 'yes',
      },
      {
        schemaVersion: 1,
        stage: 'push_agent_state_changed',
        brokerId: 'mt5',
        connectionId: 'connection-1',
        state: 'LIVE_DATA',
        dataReady: true,
        connectorSecret: 'secret',
      },
    ];

    for (const payload of invalidPayloads) {
      (portalUI as any).handleMessage({
        origin: 'https://portal.example.com',
        data: { type: 'portal-event', eventName: 'portal.lifecycle', payload },
      });
    }

    (portalUI as any).handleMessage({
      origin: 'https://different.example.com',
      data: {
        type: 'portal-event',
        eventName: 'portal.lifecycle',
        payload: { schemaVersion: 1, stage: 'portal_authenticated', userId: 'user-1' },
      },
    });

    expect(onEvent).not.toHaveBeenCalled();
  });

  it('retains generic runtime forwarding for non-lifecycle event names', () => {
    const onEvent = jest.fn();
    const portalUI = new PortalUI('https://portal.example.com/connect');
    portalUI.show('https://portal.example.com/connect', 'session-id', { onEvent });

    (portalUI as any).handleMessage({
      origin: 'https://portal.example.com',
      data: {
        type: 'portal-event',
        eventName: 'partner.custom-event',
        payload: { value: 1 },
      },
    });

    expect(onEvent).toHaveBeenCalledWith('partner.custom-event', { value: 1 });
  });

  it('finishes cleanup when the close callback throws', () => {
    const portalUI = new PortalUI('https://portal.example.com/connect');
    portalUI.show('https://portal.example.com/connect', 'session-id', {
      onClose: () => {
        throw new Error('host callback failed');
      },
    });

    expect(() => portalUI.close()).toThrow('host callback failed');
    expect((portalUI as any).container.style.display).toBe('none');
    expect((portalUI as any).iframe.src).toBe('');
    expect((portalUI as any).sessionId).toBeNull();
    expect((portalUI as any).options).toBeUndefined();

    expect(() => portalUI.close()).not.toThrow();
  });
});
