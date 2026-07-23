/**
 * Finatic Client SDK — browser bootstrap over ``finatic.v1``.
 *
 * All versioned API methods live on {@link V1Wrapper} via ``finatic.v1``.
 */

import { Configuration } from './openapi';
import { V1Api } from './openapi/api/v1-api';
import { SdkConfig, SdkConfigOverrides, getConfig } from './config';
import { EventEmitter } from './utils/events';
import { PortalUI } from './portal/PortalUI';
import { getLogger, type Logger } from './utils/logger';
import { V1Wrapper } from './wrappers/v1';

export interface FinaticConnectOptions {
  token: string;
  sdkConfig?: SdkConfigOverrides;
}

export class FinaticConnect extends EventEmitter {
  private static instance: FinaticConnect | null = null;

  private config: Configuration;
  private sdkConfig: SdkConfig;
  private options: FinaticConnectOptions;
  private portalUI?: PortalUI;
  private logger: Logger;
  public v1: V1Wrapper;

  constructor(options: FinaticConnectOptions) {
    super();
    this.options = options;
    this.sdkConfig = getConfig(options.sdkConfig);
    this.config = new Configuration({
      basePath: this.sdkConfig.baseUrl,
      baseOptions: { headers: this.sdkConfig.headers },
    });
    this.logger = console;
    this.v1 = new V1Wrapper(new V1Api(this.config), this.config, this.sdkConfig);
    this.rebuildClients();
  }

  static async init(
    token: string,
    userId?: string,
    sdkConfig?: SdkConfigOverrides
  ): Promise<FinaticConnect> {
    const logger = console;

    logger.debug?.('FinaticConnect.init() called', {
      token: token ? `${token.substring(0, 20)}...` : 'missing',
      userId,
      hasSdkConfig: !!sdkConfig,
    });

    try {
      const baseClass = FinaticConnect as unknown as { instance: FinaticConnect | null };

      if (baseClass.instance && !baseClass.instance.v1.getSessionId()) {
        logger.debug?.('Clearing existing instance without sessionId');
        baseClass.instance = null;
      }

      let instance: FinaticConnect;

      if (!baseClass.instance) {
        logger.debug?.('Creating new FinaticConnect instance');
        const connectOptions: FinaticConnectOptions = {
          token,
          ...(sdkConfig !== undefined && { sdkConfig }),
        };

        instance = new FinaticConnect(connectOptions);
        baseClass.instance = instance;

        logger.debug?.('Calling v1.startSession() inside init() with provided token');
        await instance.v1.startSession(token, userId);
        logger.debug?.('v1.startSession() completed in init()');
      } else {
        logger.debug?.('Using existing FinaticConnect instance');
        instance = baseClass.instance;
        if (sdkConfig) {
          instance.configure(sdkConfig);
        }
      }

      const sessionId = instance.v1.getSessionId();
      if (!sessionId) {
        const error = new Error(
          'Session initialization failed: v1.startSession() did not return a session_id. ' +
            'Please check that the API endpoint returned a valid session response.'
        );
        logger.error?.('FinaticConnect.init() failed - no sessionId', error, {});
        throw error;
      }

      logger.debug?.('FinaticConnect.init() completed successfully', { sessionId });
      return instance;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session not initialized')) {
        throw new Error(
          `Failed to initialize Finatic session: ${error.message}. ` +
            'Please check the API response and ensure the one-time token is valid.'
        );
      }
      throw error;
    }
  }

  static reset(): void {
    (FinaticConnect as unknown as { instance: FinaticConnect | null }).instance = null;
  }

  getConfig(): SdkConfig {
    return {
      ...this.sdkConfig,
      headers: { ...this.sdkConfig.headers },
      portalConfig: {
        ...this.sdkConfig.portalConfig,
        iframeStyle: { ...this.sdkConfig.portalConfig.iframeStyle },
      },
    };
  }

  configure(sdkConfig: SdkConfigOverrides): SdkConfig {
    const mergedConfig: SdkConfig = {
      ...this.sdkConfig,
      ...sdkConfig,
      headers: {
        ...this.sdkConfig.headers,
        ...(sdkConfig.headers ?? {}),
      },
      portalConfig: {
        ...this.sdkConfig.portalConfig,
        ...(sdkConfig.portalConfig ?? {}),
        iframeStyle: {
          ...this.sdkConfig.portalConfig.iframeStyle,
          ...(sdkConfig.portalConfig?.iframeStyle ?? {}),
        },
      },
    };

    if (sdkConfig.environment) {
      const presetOverrides: SdkConfigOverrides = { ...mergedConfig };
      if (!Object.prototype.hasOwnProperty.call(sdkConfig, 'baseUrl')) {
        delete presetOverrides.baseUrl;
      }
      if (!sdkConfig.portalConfig?.baseUrl) {
        presetOverrides.portalConfig = { ...mergedConfig.portalConfig };
        delete presetOverrides.portalConfig.baseUrl;
      }
      this.sdkConfig = getConfig(presetOverrides);
    } else {
      this.sdkConfig = mergedConfig;
    }

    this.options = {
      ...this.options,
      sdkConfig: this.sdkConfig,
    };
    this.rebuildClients();
    this.emit('config:changed', this.getConfig());
    return this.getConfig();
  }

  private rebuildClients(): void {
    this.config = new Configuration({
      basePath: this.sdkConfig.baseUrl || 'https://api.finatic.dev',
      baseOptions: { headers: this.sdkConfig.headers },
    });

    try {
      this.logger = getLogger(this.sdkConfig);
    } catch {
      this.logger = console;
    }

    const previousSessionId = this.v1.getSessionId();
    const previousCompanyId = this.v1.getCompanyId();
    const previousCsrfToken = this.v1.getCsrfToken();
    const previousUserId = this.v1.getUserId();

    this.v1 = new V1Wrapper(new V1Api(this.config), this.config, this.sdkConfig);

    if (previousSessionId && previousCompanyId) {
      this.v1.setSessionContext(previousSessionId, previousCompanyId, previousCsrfToken || '');
    }
    if (previousUserId) {
      this.v1.setUserId(previousUserId);
    }
  }

  async openPortal(options?: {
    theme?: string | { preset?: string; custom?: Record<string, unknown> };
    brokers?: string[];
    kind?: 'broker' | 'exchange';
    asset_types?: string[];
    stage?: ('production' | 'beta' | 'alpha')[];
    email?: string;
    mode?: 'light' | 'dark';
    onSuccess?: (userId: string) => void;
    onError?: (error: Error) => void;
    onClose?: () => void;
  }): Promise<void>;
  async openPortal(
    params?: {
      theme?: string | { preset?: string; custom?: Record<string, unknown> };
      brokers?: string[];
      kind?: 'broker' | 'exchange';
      asset_types?: string[];
      stage?: ('production' | 'beta' | 'alpha')[];
      email?: string;
      mode?: 'light' | 'dark';
    },
    onSuccess?: (userId: string) => void,
    onError?: (error: Error) => void,
    onClose?: () => void
  ): Promise<void>;
  async openPortal(
    optionsOrParams?:
      | {
          theme?: string | { preset?: string; custom?: Record<string, unknown> };
          brokers?: string[];
          kind?: 'broker' | 'exchange';
          asset_types?: string[];
          stage?: ('production' | 'beta' | 'alpha')[];
          email?: string;
          mode?: 'light' | 'dark';
          onSuccess?: (userId: string) => void;
          onError?: (error: Error) => void;
          onClose?: () => void;
        }
      | {
          theme?: string | { preset?: string; custom?: Record<string, unknown> };
          brokers?: string[];
          kind?: 'broker' | 'exchange';
          asset_types?: string[];
          stage?: ('production' | 'beta' | 'alpha')[];
          email?: string;
          mode?: 'light' | 'dark';
        },
    onSuccess?: (userId: string) => void,
    onError?: (error: Error) => void,
    onClose?: () => void
  ): Promise<void> {
    if (!this.v1.getSessionId()) {
      throw new Error('Session not initialized. Call FinaticConnect.init() first.');
    }

    const isNewPattern = typeof onSuccess !== 'function';

    let params:
      | {
          theme?: string | { preset?: string; custom?: Record<string, unknown> };
          brokers?: string[];
          kind?: 'broker' | 'exchange';
          asset_types?: string[];
          stage?: ('production' | 'beta' | 'alpha')[];
          email?: string;
          mode?: 'light' | 'dark';
        }
      | undefined;
    let successCallback: ((userId: string) => void) | undefined;
    let errorCallback: ((error: Error) => void) | undefined;
    let closeCallback: (() => void) | undefined;

    if (isNewPattern) {
      const options = (optionsOrParams || {}) as {
        theme?: string | { preset?: string; custom?: Record<string, unknown> };
        brokers?: string[];
        kind?: 'broker' | 'exchange';
        asset_types?: string[];
        stage?: ('production' | 'beta' | 'alpha')[];
        email?: string;
        mode?: 'light' | 'dark';
        onSuccess?: (userId: string) => void;
        onError?: (error: Error) => void;
        onClose?: () => void;
      };
      const {
        onSuccess: optOnSuccess,
        onError: optOnError,
        onClose: optOnClose,
        ...portalParams
      } = options;
      params = portalParams;
      successCallback = optOnSuccess;
      errorCallback = optOnError;
      closeCallback = optOnClose;
    } else {
      params = optionsOrParams as
        | {
            theme?: string | { preset?: string; custom?: Record<string, unknown> };
            brokers?: string[];
            kind?: 'broker' | 'exchange';
            asset_types?: string[];
            stage?: ('production' | 'beta' | 'alpha')[];
            email?: string;
            mode?: 'light' | 'dark';
          }
        | undefined;
      successCallback = onSuccess;
      errorCallback = onError;
      closeCallback = onClose;
    }

    const portalUrl = await this.v1.getPortalUrl(params);

    if (!this.portalUI) {
      this.portalUI = new PortalUI(this.sdkConfig.baseUrl || 'https://api.finatic.dev');
    }

    const sessionId = this.v1.getSessionId()!;
    this.portalUI.show(portalUrl, sessionId, {
      onSuccess: (resolvedUserId: string) => {
        this.v1.setUserId(resolvedUserId);
        this.emit('portal:success', resolvedUserId);
        successCallback?.(resolvedUserId);
      },
      onError: (error: Error) => {
        this.emit('portal:error', error);
        errorCallback?.(error);
      },
      onClose: () => {
        this.emit('portal:close');
        closeCallback?.();
      },
    });
  }
}
