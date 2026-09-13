/**
 * Portal UI manager for Client SDK.
 *
 * Handles iframe creation, postMessage events, and portal lifecycle.
 * Generated - do not edit directly.
 */

export type PortalEventName =
  | 'broker.connected'
  | 'broker.disconnected'
  | 'broker.permissions_updated'
  | 'account.grant.created'
  | 'account.grant.updated'
  | 'account.grant.revoked';

export type PortalEventCallback = (eventName: string, payload?: unknown) => void;

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
  private options?: PortalUIOptions;
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
    this.lastContentHeightPx = null;

    // Unlock background scrolling
    this.unlockScroll();
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
        this.options?.onClose?.();
        this.hide();
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
        if (typeof portalEvent.eventName === 'string') {
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
