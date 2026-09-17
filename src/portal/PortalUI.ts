/**
 * Portal UI manager for Client SDK.
 *
 * Handles iframe creation, postMessage events, and portal lifecycle.
 * Generated - do not edit directly.
 */

export const PORTAL_LIFECYCLE_SCHEMA_VERSION = 1 as const;

export type PortalLifecycleSchemaVersion = typeof PORTAL_LIFECYCLE_SCHEMA_VERSION;

export type PortalLifecycleStage =
  'portal_authenticated' | 'broker_connection_created' | 'push_agent_state_changed';

export type PortalConnectorState =
  | 'REGISTERING'
  | 'AWAITING_FIRST_HEARTBEAT'
  | 'ONLINE_NO_DATA'
  | 'LIVE_DATA'
  | 'STALE_ONLINE_NO_DATA'
  | 'STALE_LIVE_DATA'
  | 'COOLDOWN'
  | 'REVOKED'
  | 'UNKNOWN';

export type PortalLifecycleEventPayload =
  | {
      schemaVersion: PortalLifecycleSchemaVersion;
      stage: 'portal_authenticated';
      userId: string;
    }
  | {
      schemaVersion: PortalLifecycleSchemaVersion;
      stage: 'broker_connection_created';
      brokerId: string;
      connectionId: string;
    }
  | {
      schemaVersion: PortalLifecycleSchemaVersion;
      stage: 'push_agent_state_changed';
      brokerId: string;
      connectionId: string;
      state: PortalConnectorState;
      dataReady?: boolean;
    };

export interface PortalEventPayloadMap {
  'broker.connected': unknown;
  'broker.disconnected': unknown;
  'broker.permissions_updated': unknown;
  'account.grant.created': unknown;
  'account.grant.updated': unknown;
  'account.grant.revoked': unknown;
  'portal.lifecycle': PortalLifecycleEventPayload;
}

export type KnownPortalEventName = keyof PortalEventPayloadMap;

/**
 * Connect can forward partner-defined events in addition to the events known
 * by this SDK version, so event names intentionally remain open-ended.
 */
export type PortalEventName = KnownPortalEventName | (string & {});

export type PortalEventArguments = [eventName: PortalEventName, payload?: unknown];

/**
 * Preserve the original callback contract so existing contextual two-parameter
 * handlers and partner-defined event names remain source-compatible. Use
 * `isPortalLifecycleEventPayload` to narrow schema-v1 lifecycle payloads.
 */
export type PortalEventCallback = (eventName: PortalEventName, payload?: unknown) => void;

const PORTAL_CONNECTOR_STATES = new Set<PortalConnectorState>([
  'REGISTERING',
  'AWAITING_FIRST_HEARTBEAT',
  'ONLINE_NO_DATA',
  'LIVE_DATA',
  'STALE_ONLINE_NO_DATA',
  'STALE_LIVE_DATA',
  'COOLDOWN',
  'REVOKED',
  'UNKNOWN',
]);

const DATA_READY_STATES = new Set<PortalConnectorState>(['LIVE_DATA', 'STALE_LIVE_DATA']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasExactKeys(
  value: Record<string, unknown>,
  requiredKeys: readonly string[],
  optionalKeys: readonly string[] = []
): boolean {
  const allowedKeys = new Set([...requiredKeys, ...optionalKeys]);
  return (
    requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every((key) => allowedKeys.has(key))
  );
}

export function isPortalLifecycleEventPayload(
  payload: unknown
): payload is PortalLifecycleEventPayload {
  if (
    !isRecord(payload) ||
    payload['schemaVersion'] !== PORTAL_LIFECYCLE_SCHEMA_VERSION ||
    typeof payload['stage'] !== 'string'
  ) {
    return false;
  }

  switch (payload['stage']) {
    case 'portal_authenticated':
      return (
        hasExactKeys(payload, ['schemaVersion', 'stage', 'userId']) &&
        isNonEmptyString(payload['userId'])
      );

    case 'broker_connection_created':
      return (
        hasExactKeys(payload, ['schemaVersion', 'stage', 'brokerId', 'connectionId']) &&
        isNonEmptyString(payload['brokerId']) &&
        isNonEmptyString(payload['connectionId'])
      );

    case 'push_agent_state_changed': {
      if (
        !hasExactKeys(
          payload,
          ['schemaVersion', 'stage', 'brokerId', 'connectionId', 'state'],
          ['dataReady']
        ) ||
        !isNonEmptyString(payload['brokerId']) ||
        !isNonEmptyString(payload['connectionId']) ||
        typeof payload['state'] !== 'string' ||
        !PORTAL_CONNECTOR_STATES.has(payload['state'] as PortalConnectorState)
      ) {
        return false;
      }

      const hasDataReady = Object.prototype.hasOwnProperty.call(payload, 'dataReady');
      if (hasDataReady && typeof payload['dataReady'] !== 'boolean') {
        return false;
      }
      if (
        payload['dataReady'] === true &&
        !DATA_READY_STATES.has(payload['state'] as PortalConnectorState)
      ) {
        return false;
      }

      return true;
    }

    default:
      return false;
  }
}

export interface PortalUIOptions {
  onSuccess?: (userId: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onEvent?: PortalEventCallback;
}

/** Compact starting pane so the iframe grows to content instead of opening at 94dvh. */
export const EMBEDDED_PORTAL_INITIAL_HEIGHT_PX = 280;

/** Keep the host overlay from covering the full window. */
export const EMBEDDED_PORTAL_HOST_HEIGHT_RATIO = 0.94;

const EMBEDDED_PORTAL_MAX_WIDTH_PX = 448;

export class PortalUI {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLDivElement | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private viewportResizeHandler: (() => void) | null = null;
  private lastContentHeightPx: number | null = null;
  private sessionId: string | null = null;
  private portalOrigin: string | null = null;
  private options: PortalUIOptions | undefined;
  private originalBodyStyle: string | null = null;

  constructor(_portalUrl: string) {
    this.createContainer();
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 9999;
    `;

    this.iframe = document.createElement('iframe');
    this.iframe.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(94vw, 28rem);
      max-width: min(94vw, 28rem);
      height: ${EMBEDDED_PORTAL_INITIAL_HEIGHT_PX}px;
      max-height: 94dvh;
      min-width: 0;
      min-height: 0;
      border: none;
      border-radius: 24px;
      overflow: hidden;
      transition: height 180ms ease;
    `;

    // Set security headers
    // allow-popups-to-escape-sandbox: broker OAuth must open a real top-level
    // window; without it, some hosts trap or block the popup and Connect's
    // legacy fallback navigated the portal iframe itself to the broker.
    this.iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-downloads'
    );
    this.iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    this.iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    );

    this.container.appendChild(this.iframe);
    document.body.appendChild(this.container);
    this.applyResponsiveIframeBox();
  }

  /**
   * Sizes the portal iframe to content height, growing from a compact start.
   * Tall content caps at 94dvh and scrolls inside Connect.
   */
  private applyResponsiveIframeBox(contentHeightPx?: number): void {
    if (!this.iframe || typeof window === 'undefined') {
      return;
    }

    if (typeof contentHeightPx === 'number' && Number.isFinite(contentHeightPx)) {
      this.lastContentHeightPx = Math.max(0, Math.ceil(contentHeightPx));
    }

    const hostWidthPx =
      typeof window.innerWidth === 'number' && window.innerWidth > 0
        ? window.innerWidth
        : EMBEDDED_PORTAL_MAX_WIDTH_PX;
    const hostHeightPx =
      typeof window.innerHeight === 'number' && window.innerHeight > 0 ? window.innerHeight : 720;
    const maximumWidthPx = Math.min(
      Math.round(hostWidthPx * EMBEDDED_PORTAL_HOST_HEIGHT_RATIO),
      EMBEDDED_PORTAL_MAX_WIDTH_PX
    );
    const maximumHeightPx = Math.round(hostHeightPx * EMBEDDED_PORTAL_HOST_HEIGHT_RATIO);
    const nextHeightPx = Math.min(
      this.lastContentHeightPx ?? EMBEDDED_PORTAL_INITIAL_HEIGHT_PX,
      maximumHeightPx
    );

    this.iframe.style.width = `${maximumWidthPx}px`;
    this.iframe.style.maxWidth = `${maximumWidthPx}px`;
    this.iframe.style.height = `${nextHeightPx}px`;
    this.iframe.style.maxHeight = `${maximumHeightPx}px`;
    this.iframe.style.transition = 'height 180ms ease';
  }

  private lockScroll(): void {
    if (typeof document !== 'undefined' && document.body) {
      this.originalBodyStyle = document.body.style.cssText;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    }
  }

  private unlockScroll(): void {
    if (typeof document !== 'undefined' && document.body && this.originalBodyStyle !== null) {
      document.body.style.cssText = this.originalBodyStyle;
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
      this.originalBodyStyle = null;
    }
  }

  public show(url: string, sessionId: string, options: PortalUIOptions = {}): void {
    if (!this.iframe || !this.container) {
      this.createContainer();
    }

    // Set portalOrigin to the actual portal URL's origin
    try {
      this.portalOrigin = new URL(url).origin;
    } catch {
      this.portalOrigin = null;
    }

    this.sessionId = sessionId;
    this.options = options;
    this.container!.style.display = 'block';
    this.iframe!.src = url;
    this.applyResponsiveIframeBox();

    // Lock background scrolling
    this.lockScroll();

    // Set up message handler
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
    this.viewportResizeHandler = () => this.applyResponsiveIframeBox();
    window.addEventListener('resize', this.viewportResizeHandler);
  }

  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (this.iframe) {
      this.iframe.src = '';
    }
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    if (this.viewportResizeHandler) {
      window.removeEventListener('resize', this.viewportResizeHandler);
      this.viewportResizeHandler = null;
    }
    this.sessionId = null;
    this.portalOrigin = null;
    this.options = undefined;
    this.lastContentHeightPx = null;

    // Unlock background scrolling
    this.unlockScroll();
  }

  /**
   * Closes the active portal through the same callback and cleanup path used
   * by the embedded portal's close control.
   */
  public close(): void {
    if (!this.sessionId) {
      return;
    }

    const onClose = this.options?.onClose;

    // Consume active state before notifying the host so repeated or re-entrant
    // close requests cannot emit duplicate close callbacks.
    this.sessionId = null;
    this.options = undefined;

    try {
      onClose?.();
    } finally {
      this.hide();
    }
  }

  private handleMessage(event: MessageEvent): void {
    // Verify origin matches the portal URL
    // Allow messages from the portal origin or if portalOrigin is not set (for development)
    if (this.portalOrigin && event.origin !== this.portalOrigin) {
      // Log ignored messages for debugging (only in development)
      if (
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ) {
        console.debug('[Finatic SDK] Ignoring message from different origin:', {
          expected: this.portalOrigin,
          received: event.origin,
          messageType: event.data?.type,
        });
      }
      return;
    }

    // Only process messages that look like portal messages
    if (!event.data || typeof event.data !== 'object' || !event.data.type) {
      return;
    }

    const { type, userId, error, data } = event.data;

    switch (type) {
      case 'portal-success': {
        // Handle both direct userId and data.userId formats
        const successUserId = userId || (data && data.userId);
        if (successUserId) {
          this.options?.onSuccess?.(successUserId);
        }
        break;
      }

      case 'portal-error': {
        // Handle both direct error and data.message formats
        const errorMessage = error || (data && data.message) || 'Unknown portal error';
        this.options?.onError?.(new Error(errorMessage));
        break;
      }

      case 'portal-close':
        this.close();
        break;

      case 'portal-resize': {
        const resizeHeight = (event.data as { height?: unknown }).height;
        if (typeof resizeHeight === 'number') {
          this.applyResponsiveIframeBox(resizeHeight);
        }
        break;
      }

      case 'portal-event': {
        const portalEvent = event.data as {
          eventName?: unknown;
          payload?: unknown;
        };
        if (portalEvent.eventName === 'portal.lifecycle') {
          if (isPortalLifecycleEventPayload(portalEvent.payload)) {
            this.options?.onEvent?.('portal.lifecycle', portalEvent.payload);
          }
        } else if (typeof portalEvent.eventName === 'string') {
          this.options?.onEvent?.(portalEvent.eventName, portalEvent.payload);
        }
        break;
      }

      default:
        // Ignore unknown message types
        break;
    }
  }
}
