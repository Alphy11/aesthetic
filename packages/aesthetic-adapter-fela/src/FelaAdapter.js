/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Adapter } from 'aesthetic';
import createStyleElement from 'aesthetic/lib/helpers/createStyleElement';
import injectAtRules from 'aesthetic/lib/helpers/injectAtRules';
import injectFallbacks from 'aesthetic/lib/helpers/injectFallbacks';
import injectRuleByLookup from 'aesthetic/lib/helpers/injectRuleByLookup';
import { createRenderer } from 'fela';
import { render } from 'fela-dom';

import type { StyleDeclarationMap, ClassNameMap } from 'aesthetic';
import type { Renderer, RendererConfig } from 'fela';

const SRC_PATTERN = /src\((?:'|")?([^()])(?:'|")?\)/;

export default class FelaAdapter extends Adapter {
  fela: Renderer;

  constructor(config: RendererConfig = {}) {
    super();

    this.styleTag = createStyleElement('fela');
    this.fela = createRenderer(config);

    if (this.styleTag) {
      render(this.fela, this.styleTag);
    }
  }

  convertProperties(setName: string, properties: CSSStyle): CSSStyle {
    const nextProperties = super.convertProperties(setName, properties);

    // Font faces
    if ('fontFamily' in nextProperties) {
      injectRuleByLookup(nextProperties, 'fontFamily', this.fontFaceNames, true);
    }

    // Animation keyframes
    if ('animationName' in nextProperties) {
      injectRuleByLookup(nextProperties, 'animationName', this.keyframeNames, true);
    }

    // Media queries
    if (this.mediaQueries[setName]) {
      injectAtRules(nextProperties, '@media', this.mediaQueries[setName]);
    }

    // Fallbacks
    if (this.fallbacks[setName]) {
      injectFallbacks(nextProperties, this.fallbacks[setName]);
    }

    return nextProperties;
  }

  onExtractedFontFace(setName: string, familyName: string, properties: CSSStyle) {
    const files = [];
    let match;

    // eslint-disable-next-line no-cond-assign
    while (match = properties.src.match(SRC_PATTERN)) {
      files.push(match[1]);
    }

    this.fontFaceNames[familyName] = this.fela.renderFont(familyName, files, properties);
  }

  onExtractedKeyframe(setName: string, animationName: string, properties: CSSStyle) {
    this.keyframeNames[animationName] = this.fela.renderKeyframe(() => properties);
  }

  transformStyles(styleName: string, declarations: StyleDeclarationMap): ClassNameMap {
    const classNames = {};

    Object.keys(declarations).forEach((setName: string) => {
      classNames[setName] = this.fela.renderRule(() => declarations[setName]);
    });

    return classNames;
  }
}
