/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import UnifiedSyntax from 'aesthetic/unified';
import {
  injectFallbacks,
  injectFontFaces,
  injectKeyframes,
  injectMediaQueries,
} from 'aesthetic-utils';
import FelaAdapter from './NativeAdapter';

import type { Renderer } from 'fela'; // eslint-disable-line
import type {
  FontFace,
  Keyframe,
  StyleDeclaration,
  StyleDeclarations,
  TransformedDeclarations,
} from '../../types';

export default class UnifiedFelaAdapter extends FelaAdapter {
  syntax: UnifiedSyntax;

  constructor(fela: Renderer, options?: Object = {}) {
    super(fela, options);

    this.syntax = new UnifiedSyntax()
      .on('declaration', this.handleDeclaration)
      .on('fontFace', this.handleFontFace)
      .on('keyframe', this.handleKeyframe);
  }

  convert(declarations: StyleDeclarations): StyleDeclarations {
    return this.syntax.convert(declarations);
  }

  transform<T: Object>(styleName: string, declarations: T): TransformedDeclarations {
    return super.transform(styleName, this.convert(declarations));
  }

  handleDeclaration = (selector: string, properties: StyleDeclaration) => {
    // Font faces
    // http://fela.js.org/docs/basics/Fonts.html
    // http://fela.js.org/docs/basics/Renderer.html#renderfont
    if ('fontFamily' in properties) {
      injectFontFaces(properties, this.syntax.fontFacesCache, {
        join: true,
      });
    }

    // Animation keyframes
    // http://fela.js.org/docs/basics/Keyframes.html
    // http://fela.js.org/docs/basics/Renderer.html#renderkeyframe
    if ('animationName' in properties) {
      injectKeyframes(properties, this.syntax.keyframesCache, {
        join: true,
      });
    }

    // Media queries
    // http://fela.js.org/docs/basics/Rules.html#3-media-queries
    if (this.syntax.mediaQueries[selector]) {
      injectMediaQueries(properties, this.syntax.mediaQueries[selector]);
    }

    // Fallbacks
    // https://github.com/rofrischmann/fela/tree/master/packages/fela-plugin-fallback-value#example
    if (this.syntax.fallbacks[selector]) {
      injectFallbacks(properties, this.syntax.fallbacks[selector]);
    }
  };

  handleFontFace = (selector: string, familyName: string, fontFaces: FontFace[]) => {
    this.syntax.fontFacesCache[familyName] = fontFaces.map((face) => {
      const { src, ...props } = face;

      return this.fela.renderFont(familyName, src, props);
    });
  }

  handleKeyframe = (selector: string, animationName: string, keyframe: Keyframe) => {
    this.syntax.keyframesCache[animationName] = this.fela.renderKeyframe(() => keyframe);
  };
}
