/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Adapter } from 'aesthetic';
import Styletron from 'styletron-client';
import { injectStyle } from 'styletron-utils';
import deepMerge from 'lodash.merge';

import type { StyleDeclarations, ClassNames } from '../../types';

export default class StyletronAdapter extends Adapter {
  styletron: Styletron;

  constructor(styletron: Styletron) {
    super();

    this.styletron = styletron || new Styletron();
  }

  convertProperties(setName: string, properties: CSSStyle): CSSStyle {
    const nextProperties = super.convertProperties(setName, properties);

    // Media queries
    if (this.mediaQueries[setName]) {
      deepMerge(nextProperties, this.formatAtRules('@media', this.mediaQueries[setName]));
    }

    return nextProperties;
  }

  transformStyles(styleName: string, declarations: StyleDeclarations): ClassNames {
    const classNames = {};

    Object.keys(declarations).forEach((setName: string) => {
      classNames[setName] = `${styleName}-${injectStyle(this.styletron, declarations[setName])}`;
    });

    return classNames;
  }
}
