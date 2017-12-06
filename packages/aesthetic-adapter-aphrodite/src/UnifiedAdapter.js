/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import UnifiedSyntax from 'aesthetic/unified';
import { injectFontFaces, injectKeyframes, injectMediaQueries } from 'aesthetic-utils';
import AphroditeAdapter from './NativeAdapter';

import type { GlobalDeclaration, StyleDeclaration, TransformedDeclarations } from '../../types';

export default class UnifiedAphroditeAdapter extends AphroditeAdapter {
  syntax: UnifiedSyntax;

  constructor(aphrodite: Object, options?: Object = {}) {
    super(aphrodite, options);

    this.syntax = new UnifiedSyntax()
      .on('declaration', this.handleDeclaration);
  }

  transform<T: Object>(styleName: string, declarations: T): TransformedDeclarations {
    return super.transform(styleName, this.syntax.convert(declarations));
  }

  transformGlobals(declarations: GlobalDeclaration) {
    super.transformGlobals(this.syntax.convert(declarations, true));
  }

  handleDeclaration = (selector: string, properties: StyleDeclaration) => {
    // Font faces
    // https://github.com/Khan/aphrodite#font-faces
    if ('fontFamily' in properties) {
      injectFontFaces(properties, this.syntax.fontFaces, {
        format: true,
      });
    }

    // Animation keyframes
    // https://github.com/Khan/aphrodite#animations
    if ('animationName' in properties) {
      injectKeyframes(properties, this.syntax.keyframes);
    }

    // Media queries
    // https://github.com/Khan/aphrodite#api
    if (this.syntax.mediaQueries[selector]) {
      injectMediaQueries(properties, this.syntax.mediaQueries[selector]);
    }

    // Fallbacks
    // Aphrodite does not support fallbacks.
  };
}
