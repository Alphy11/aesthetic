/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Adapter } from 'aesthetic';
import { css } from 'glamor';

import type { StyleDeclarations, ClassNames } from '../../types';

export default class GlamorAdapter extends Adapter {
  transform(styleName: string, declarations: StyleDeclarations): ClassNames {
    let sheet = this.sheets[styleName];

    if (!sheet) {
      sheet = {};

      Object.keys(declarations).forEach((setName: string) => {
        sheet[setName] = String(css(declarations[setName]));
      });

      this.sheets[styleName] = sheet;
    }

    return { ...sheet };
  }
}
