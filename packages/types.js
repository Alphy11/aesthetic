/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

/* eslint-disable */

import React from 'react';

export type CSSStyle = { [key: string]: string | number | boolean | CSSStyle | CSSStyle[] };

export type StyleDeclaration = string | CSSStyle;

export type StyleDeclarations = { [key: string]: StyleDeclaration };

export type ClassNames = { [key: string]: string };

export type WrappedComponent = ReactClass<*>;

export type HOCComponent = ReactClass<*>;

export type HOCOptions = {
  lockStyling?: boolean,
  styleName?: string,
  stylesPropName?: string,
  themePropName?: string,
};
