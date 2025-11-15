/**
 * Custom session wrapper - Extends generated wrapper.
 * 
 * This file is protected and will not be overwritten during regeneration.
 * Add your custom session logic here.
 */

// Import generated wrapper
import { SessionWrapper } from '../../generated/wrappers/session';
import { SessionApi } from '../../generated/api/session-api';
import type { Configuration } from '../../generated/configuration';
import type { SdkConfig } from '../../generated/config';
import type { Logger } from '../../generated/utils/logger';
import { getSafeLogger } from '../../custom/FinaticConnect';

/**
 * Custom wrapper for session operations.
 * Uses safe logger that works in browser environments.
 */
export class CustomSessionWrapper extends SessionWrapper {
  constructor(api: SessionApi, config?: Configuration, sdkConfig?: SdkConfig) {
    super(api, config, sdkConfig);
    
    // Override the logger with our safe logger
    // This is needed because the generated SessionWrapper uses pino directly
    // which fails in browser environments
    (this as any).logger = getSafeLogger(sdkConfig);
  }
}
