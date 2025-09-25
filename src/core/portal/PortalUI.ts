export class PortalUI {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLDivElement | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private sessionId: string | null = null;
  private portalOrigin: string | null = null;
  private options?: {
    onSuccess?: (userId: string) => void;
    onError?: (error: Error) => void;
    onClose?: () => void;
    onEvent?: (type: string, data: any) => void;
  };
  private originalBodyStyle: string | null = null;

  constructor(portalUrl: string) {
    this.createContainer();
  }

  private createContainer(): void {
    console.debug('[PortalUI] Creating container and iframe');
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
    // Let the portal handle its own styling - only set essential attributes
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

    // Add CSP meta tag to allow Google Fonts and other required resources
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    meta.setAttribute(
      'content',
      `
            default-src 'self' https:;
            style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net;
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data: https:;
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
            connect-src 'self' https:;
            frame-src 'self' https:;
        `
        .replace(/\s+/g, ' ')
        .trim()
    );
    this.iframe.contentDocument?.head.appendChild(meta);

    this.container.appendChild(this.iframe);
    document.body.appendChild(this.container);
    console.debug('[PortalUI] Container and iframe created successfully');
  }

  /**
   * Lock background scrolling by setting overflow: hidden on body
   */
  private lockScroll(): void {
    if (typeof document !== 'undefined' && document.body) {
      // Store original body style to restore later
      this.originalBodyStyle = document.body.style.cssText;

      // Add overflow: hidden to prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;

      console.debug('[PortalUI] Background scroll locked');
    }
  }

  /**
   * Unlock background scrolling by restoring original body style
   */
  private unlockScroll(): void {
    if (typeof document !== 'undefined' && document.body && this.originalBodyStyle !== null) {
      // Restore original body style
      document.body.style.cssText = this.originalBodyStyle;

      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);

      this.originalBodyStyle = null;
      console.debug('[PortalUI] Background scroll unlocked');
    }
  }

  public show(
    url: string,
    sessionId: string,
    options: {
      onSuccess?: (userId: string) => void;
      onError?: (error: Error) => void;
      onClose?: () => void;
      onEvent?: (type: string, data: any) => void;
    } = {}
  ): void {
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
    if (!this.portalOrigin || event.origin !== this.portalOrigin) {
      console.warn(
        '[PortalUI] Received message from unauthorized origin:',
        event.origin,
        'Expected:',
        this.portalOrigin
      );
      return;
    }

    const { type, userId, error, height, data } = event.data;
    console.log('[PortalUI] Received message:', event.data);

    switch (type) {
      case 'portal-success': {
        // Handle both direct userId and data.userId formats
        const successUserId = userId || (data && data.userId);
        this.handlePortalSuccess(successUserId);
        break;
      }

      case 'portal-error': {
        // Handle both direct error and data.message formats
        const errorMessage = error || (data && data.message);
        this.handlePortalError(errorMessage);
        break;
      }

      case 'portal-close':
        this.handlePortalClose();
        break;

      case 'event':
        this.handleGenericEvent(data);
        break;

      case 'resize':
        this.handleResize(height);
        break;

      // Legacy support for old message types
      case 'success':
        this.handleSuccess(userId);
        break;

      case 'error':
        this.handleError(error);
        break;

      case 'close':
        this.handleClose();
        break;

      default:
        console.warn('[PortalUI] Received unhandled message type:', type);
    }
  }

  private handlePortalSuccess(userId: string): void {
    if (!userId) {
      console.error('[PortalUI] Missing userId in portal-success message');
      return;
    }

    console.log('[PortalUI] Portal success - User connected:', userId);

    // Pass userId to parent (SDK will handle tokens internally)
    this.options?.onSuccess?.(userId);
  }

  private handlePortalError(error: string): void {
    console.error('[PortalUI] Portal error:', error);
    this.options?.onError?.(new Error(error || 'Unknown portal error'));
  }

  private handlePortalClose(): void {
    console.log('[PortalUI] Portal closed by user');
    this.options?.onClose?.();
    this.hide();
  }

  private handleGenericEvent(data: any): void {
    if (!data || !data.type) {
      console.warn('[PortalUI] Invalid event data:', data);
      return;
    }

    console.log('[PortalUI] Generic event received:', data.type, data.data);

    // Emit the event to be handled by the SDK
    // This will be implemented in FinaticConnect
    if (this.options?.onEvent) {
      this.options.onEvent(data.type, data.data);
    }
  }

  private handleSuccess(userId: string): void {
    if (!userId) {
      console.error('[PortalUI] Missing required fields in success message');
      return;
    }

    // Pass userId to parent
    this.options?.onSuccess?.(userId);
  }

  private handleError(error: string): void {
    console.error('[PortalUI] Received error:', error);
    this.options?.onError?.(new Error(error || 'Unknown error'));
  }

  private handleClose(): void {
    console.log('[PortalUI] Received close message');
    this.options?.onClose?.();
    this.hide();
  }

  private handleResize(height: number): void {
    if (height && this.iframe) {
      console.log('[PortalUI] Received resize message:', height);
      this.iframe.style.height = `${height}px`;
    }
  }
}
