/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Adapter } from 'aesthetic';

import type { TransformedDeclarations } from '../../types';

export default class ReactNativeAdapter extends Adapter {
  native: boolean = true;

  /**
   * Simply return the style declarations as-is because the RN `Aesthetic`
   * instance will automatically wrap it with RN `StyleSheet`.
   */
  transform<S: Object>(styleName: string, declarations: S): TransformedDeclarations {
    return declarations;
  }
}
