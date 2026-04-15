/**
 * Hand-authored FinaticConnect extension.
 *
 * This class intentionally remains source-controlled and can be customized
 * without relying on the old src/custom folder structure.
 */

import { FinaticConnect as GeneratedFinaticConnect } from './FinaticConnectCore';

export class FinaticConnect extends GeneratedFinaticConnect {
  // Marker to verify hand-authored class is being used
  static readonly __CUSTOM_CLASS__ = true;
}
