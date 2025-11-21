/**
 * Portal UI manager for Client SDK.
 * 
 * Handles iframe creation, postMessage events, and portal lifecycle.
 * Generated - do not edit directly.
 */

export interface PortalUIOptions {
  onSuccess?: (userId: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export class PortalUI {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLDivElement | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private sessionId: string | null = null;
  private portalOrigin: string | null = null;
  private options?: PortalUIOptions;
  private originalBodyStyle: string | null = null;

  constructor(portalUrl: string) {
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
      width: 90%;
      max-width: 500px;
      height: 90%;
      max-height: 600px;
      border: none;
      border-radius: 24px;
    `;

    // Set security headers
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-same-origin');
    this.iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    this.iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    );

    this.container.appendChild(this.iframe);
    document.body.appendChild(this.container);
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
    } catch (e) {
      this.portalOrigin = null;
    }

    this.sessionId = sessionId;
    this.options = options;
    this.container!.style.display = 'block';
    this.iframe!.src = url;

    // Lock background scrolling
    this.lockScroll();

    // Set up message handler
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
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
    this.sessionId = null;

    // Unlock background scrolling
    this.unlockScroll();
  }

  private handleMessage(event: MessageEvent): void {
    // Verify origin matches the portal URL
    // Allow messages from the portal origin or if portalOrigin is not set (for development)
    if (this.portalOrigin && event.origin !== this.portalOrigin) {
      // Log ignored messages for debugging (only in development)
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        console.debug('[Finatic SDK] Ignoring message from different origin:', {
          expected: this.portalOrigin,
          received: event.origin,
          messageType: event.data?.type
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

      case 'portal-resize':
        // Handle resize messages (optional - can be used to adjust iframe height)
        // Portal sends: { type: 'portal-resize', height: number }
        const resizeHeight = (event.data as any).height;
        if (typeof resizeHeight === 'number' && this.iframe) {
          // Optionally adjust iframe height based on portal content
          this.iframe.style.height = `${resizeHeight}px`;
        }
        break;

      default:
        // Ignore unknown message types
        break;
    }
  }
}
