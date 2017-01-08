/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import UnifiedSyntax from 'aesthetic/unified';
import injectAtRules from 'aesthetic/lib/helpers/injectAtRules';
import toArray from 'aesthetic/lib/helpers/toArray';
import JSS from 'jss';
import JSSAdapter from './NativeAdapter';

import type { StyleDeclarationMap, ClassNameMap, AtRuleMap, CSSStyle } from 'aesthetic';
import type { StyleSheetOptions } from 'jss';

export default class UnifiedJSSAdapter extends JSSAdapter {
  currentFontFaces: AtRuleMap = {};
  currentKeyframes: AtRuleMap = {};
  currentMediaQueries: AtRuleMap = {};
  syntax: UnifiedSyntax;

  constructor(jss: JSS, options: StyleSheetOptions = {}) {
    super(jss, options);

    this.syntax = new UnifiedSyntax();
    this.syntax.on('converting', this.onConverting);
    this.syntax.on('declaration', this.onDeclaration);
    this.syntax.on('fontFace', this.onFontFace);
    this.syntax.on('keyframe', this.onKeyframe);
    this.syntax.on('mediaQuery', this.onMediaQuery);
  }

  convert(declarations: StyleDeclarationMap): StyleDeclarationMap {
    const adaptedDeclarations = this.syntax.convert(declarations);

    injectAtRules(adaptedDeclarations, '@font-face', this.currentFontFaces);
    injectAtRules(adaptedDeclarations, '@keyframes', this.currentKeyframes);
    injectAtRules(adaptedDeclarations, '@media', this.currentMediaQueries);

    return adaptedDeclarations;
  }

  transform(styleName: string, declarations: StyleDeclarationMap): ClassNameMap {
    return super.transform(styleName, this.convert(declarations));
  }

  onConverting = () => {
    this.currentFontFaces = {};
    this.currentKeyframes = {};
    this.currentMediaQueries = {};
  };

  onDeclaration = (setName: string, properties: CSSStyle) => {
    // Prepend pseudos with an ampersand
    Object.keys(properties).forEach((propName: string) => {
      if (propName.charAt(0) === ':') {
        properties[`&${propName}`] = properties[propName];

        delete properties[propName];
      }
    });

    // Fallbacks
    if (this.syntax.fallbacks[setName]) {
      properties.fallbacks = Object.keys(this.syntax.fallbacks[setName])
        .reduce((list: CSSStyle[], propName: string) => (
          [
            ...list,
            ...toArray(this.syntax.fallbacks[setName][propName]).map((propValue: string) => ({
              [propName]: propValue,
            })),
          ]
        ), []);
    }
  };

  onFontFace = (setName: string, familyName: string, properties: CSSStyle) => {
    this.currentFontFaces[familyName] = properties;
  };

  onKeyframe = (setName: string, animationName: string, properties: CSSStyle) => {
    this.currentKeyframes[animationName] = properties;
  };

  onMediaQuery = (setName: string, mediaQuery: string, properties: CSSStyle) => {
    if (!this.currentMediaQueries[mediaQuery]) {
      this.currentMediaQueries[mediaQuery] = {};
    }

    const currentSet = this.currentMediaQueries[mediaQuery][setName];

    if (typeof currentSet === 'object' && !Array.isArray(currentSet)) {
      this.currentMediaQueries[mediaQuery][setName] = {
        ...currentSet,
        ...properties,
      };
    } else {
      this.currentMediaQueries[mediaQuery][setName] = properties;
    }
  };
}
