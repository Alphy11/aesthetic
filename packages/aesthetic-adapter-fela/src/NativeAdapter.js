/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Adapter } from 'aesthetic';
import { createStyleElement } from 'aesthetic-utils';
import { createRenderer } from 'fela';
import { render } from 'fela-dom';

import type { Renderer } from 'fela'; // eslint-disable-line
import type { StyleDeclarationMap, TransformedStylesMap } from '../../types';

export default class FelaAdapter extends Adapter {
  bypassNativeStyleSheet: boolean = true;

  fela: Renderer;

  constructor(fela: Renderer, options: Object = {}) {
    super(options);

    this.fela = fela || createRenderer();

    /*
     * React Native does not require a DOM render
     * How to make fela-dom optional though?
     */
    if (this.fela.subscribe) {
      render(this.fela, createStyleElement('fela'));
    }
  }

  transform(styleName: string, declarations: StyleDeclarationMap): TransformedStylesMap {
    const output = {};

    Object.keys(declarations).forEach((setName: string) => {
      const value = declarations[setName];

      if (typeof value === 'string') {
        output[setName] = this.native ? {} : value;
      } else {
        output[setName] = this.fela.renderRule(() => value);
      }
    });

    return output;
  }
}
