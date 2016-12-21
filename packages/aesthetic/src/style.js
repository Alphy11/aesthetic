/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import React, { PropTypes } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import Aesthetic from './Aesthetic';

import type {
  StyleDeclarations,
  WrappedComponent,
  HOCComponent,
  HOCOptions,
} from './types';

export default function style(
  aesthetic: Aesthetic,
  defaultStyles: StyleDeclarations = {},
  options: HOCOptions = {},
): (WrappedComponent) => HOCComponent {
  return function wrapStyles(Component: WrappedComponent): HOCComponent {
    // $FlowIssue These properties may not exist
    const styleName: string = options.styleName || Component.displayName || Component.name;
    const {
      stylesPropName = 'styles',
      themePropName = 'theme',
      lockStyling = true,
    } = options;

    if (!styleName) {
      throw new Error(
        'A component name could not be derived. Please provide a unique ' +
        'name through `options.styleName` or with a component\'s `displayName`.',
      );
    }

    // Set default styles
    aesthetic.setStyles(styleName, defaultStyles);

    if (lockStyling) {
      aesthetic.lockStyling(styleName);
    }

    class StyledComponent extends React.Component<*, *, *> {
      static displayName: string = `Aesthetic(${styleName})`;
      static styleName: string = styleName;
      static wrappedComponent: WrappedComponent = Component;

      static propTypes = {
        // eslint-disable-next-line react/no-unused-prop-types
        [themePropName]: PropTypes.string,
      };

      static contextTypes = {
        themeName: PropTypes.string,
      };

      // Allow consumers to set styles
      static setStyles(declarations: StyleDeclarations, merge: boolean = false) {
        aesthetic
          .setStyles(styleName, declarations, merge)
          .lockStyling(styleName);
      }

      // And to merge styles
      static mergeStyles(declarations: StyleDeclarations) {
        StyledComponent.setStyles(declarations, true);
      }

      // Start transforming styles before we mount
      componentWillMount() {
        const theme = this.getTheme();
        const styles = aesthetic.transformStyles(styleName, theme);

        this.setState({
          [themePropName]: theme,
          [stylesPropName]: styles,
        });
      }

      getTheme() {
        return this.props[themePropName] || this.context.themeName || '';
      }

      render() {
        return (
          <Component {...this.props} {...this.state} />
        );
      }
    }

    return hoistNonReactStatics(StyledComponent, Component);
  };
}
