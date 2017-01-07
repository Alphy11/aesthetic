/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import UnifiedSyntax from 'aesthetic/unified';
import injectAtRules from 'aesthetic/lib/helpers/injectAtRules';
import injectFallbacks from 'aesthetic/lib/helpers/injectFallbacks';
import injectRuleByLookup from 'aesthetic/lib/helpers/injectRuleByLookup';
import FelaAdapter from './NativeAdapter';

import type { StyleDeclarationMap, ClassNameMap } from 'aesthetic';
import type { RendererConfig } from 'fela';

const SRC_PATTERN = /src\((?:'|")?([^()])(?:'|")?\)/;

export default class UnifiedFelaAdapter extends FelaAdapter {
  syntax: UnifiedSyntax;

  constructor(config: RendererConfig = {}) {
    super(config);

    this.syntax = new UnifiedSyntax();
    this.syntax.on('declaration', this.onDeclaration);
    this.syntax.on('fontFace', this.onFontFace);
    this.syntax.on('keyframe', this.onKeyframe);
  }

  convert(declarations: StyleDeclarationMap): StyleDeclarationMap {
    return this.syntax.convert(declarations);
  }

  transform(styleName: string, declarations: StyleDeclarationMap): ClassNameMap {
    return super.transform(styleName, this.convert(declarations));
  }

  onDeclaration = (setName: string, properties: CSSStyle) => {
    // Font faces
    if ('fontFamily' in properties) {
      injectRuleByLookup(properties, 'fontFamily', this.syntax.fontFaceNames, true);
    }

    // Animation keyframes
    if ('animationName' in properties) {
      injectRuleByLookup(properties, 'animationName', this.syntax.keyframeNames, true);
    }

    // Media queries
    if (this.syntax.mediaQueries[setName]) {
      injectAtRules(properties, '@media', this.syntax.mediaQueries[setName]);
    }

    // Fallbacks
    if (this.syntax.fallbacks[setName]) {
      injectFallbacks(properties, this.syntax.fallbacks[setName]);
    }
  };

  onFontFace = (setName: string, familyName: string, properties: CSSStyle) => {
    const files = [];
    let match;

    // eslint-disable-next-line no-cond-assign
    while (match = properties.src.match(SRC_PATTERN)) {
      files.push(match[1]);
    }

    this.syntax.fontFaceNames[familyName] = this.fela.renderFont(familyName, files, properties);
  }

  onKeyframe = (setName: string, animationName: string, properties: CSSStyle) => {
    this.syntax.keyframeNames[animationName] = this.fela.renderKeyframe(() => properties);
  };
}
