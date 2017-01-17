/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { StyleSheet } from 'react-native';
import Adapter from '../../Adapter';

import type { StyleDeclarationMap, TransformedStylesMap } from '../../types';

export default class ReactNativeAdapter extends Adapter {
  native: boolean = true;

  transform(styleName: string, declarations: StyleDeclarationMap): TransformedStylesMap {
    return StyleSheet.create(declarations);
  }
}
