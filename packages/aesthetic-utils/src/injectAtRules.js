/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import type { AtRuleMap, CSSStyle } from 'aesthetic';

export default function injectAtRules(
  properties: CSSStyle,
  atName: string,
  atRules: AtRuleMap,
) {
  // Font faces don't have IDs in their declaration,
  // so we need to handle this differently.
  if (atName === '@font-face') {
    const fonts = Object.keys(atRules).map(key => atRules[key]);

    if (fonts.length) {
      properties[atName] = (fonts.length > 1) ? fonts : fonts[0];
    }

  // All other at-rules work the same.
  } else {
    Object.keys(atRules).forEach((key: string) => {
      properties[`${atName} ${key}`] = atRules[key];
    });
  }
}
