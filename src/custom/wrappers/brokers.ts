/**
 * Custom brokers wrapper - Extends generated wrapper.
 * 
 * This file is protected and will not be overwritten during regeneration.
 * Add your custom brokers logic here.
 */

// Import generated wrapper
import { BrokersWrapper } from '../../generated/wrappers/brokers';
import { BrokersApi } from '../../generated/api/brokers-api';
import type { Configuration } from '../../generated/configuration';
import type { SdkConfig } from '../../generated/config';
import { getSafeLogger } from '../../custom/FinaticConnect';

/**
 * Custom wrapper for brokers operations.
 * Uses safe logger that works in browser environments.
 * 
 * NOTE: Session headers are now handled in the generator for all broker endpoints.
 */
export class CustomBrokersWrapper extends BrokersWrapper {
  constructor(api: BrokersApi, config?: Configuration, sdkConfig?: SdkConfig) {
    super(api, config, sdkConfig);
    
    // Override the logger with our safe logger
    // This is needed because the generated BrokersWrapper uses pino directly
    // which fails in browser environments
    (this as any).logger = getSafeLogger(sdkConfig);
  }

  // Session headers are now automatically added by the generator for all broker endpoints
  // No custom method overrides needed
}
