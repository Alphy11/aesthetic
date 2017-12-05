/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

/* eslint-disable react/require-default-props */

import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import Aesthetic from './Aesthetic';

import type {
  HOCComponent,
  HOCOptions,
  HOCWrappedComponent,
  StyleCallback,
  StyleDeclarations,
  TransformedDeclarations,
} from '../../types';

type StyleProps = {
  theme?: string,
};

type StyleState = {
  classNames?: TransformedDeclarations,
  theme?: string,
};

// Keep track in production
let instanceID = 0;

export default function style(
  aesthetic: Aesthetic,
  styles: StyleCallback | StyleDeclarations = {},
  options?: HOCOptions = {},
): (HOCWrappedComponent) => HOCComponent {
  return function wrapStyles(Component: HOCWrappedComponent): HOCComponent {
    let styleName = options.styleName || Component.displayName || Component.name;

    /*
     * Function/constructor name aren't always available when code is minified,
     * so only use it in development.
     */
    if (__DEV__) {
      if (!(aesthetic instanceof Aesthetic)) {
        throw new TypeError('An instance of `Aesthetic` is required.');

      } else if (!styleName) {
        /* istanbul ignore next Hard to test */
        throw new Error(
          'A component name could not be derived. Please provide a unique ' +
          'name using `options.styleName` or `displayName`.',
        );

      } else if (aesthetic.styles[styleName]) {
        throw new Error(
          `A component has already been styled under the name "${styleName}". ` +
          'Either rename the component or define `options.styleName`.',
        );
      }

    /*
     * When in production, we should generate a random string to use as the style name.
     * If we don't do this, any minifiers that mangle function names would break
     * Aesthetic's caching layer.
     */
    } else {
      instanceID += 1;
      styleName = `${Math.random().toString(32).substr(2)}${instanceID}`;
    }

    const {
      extendable = aesthetic.options.extendable,
      extendFrom = '',
      pure = aesthetic.options.pure,
      stylesPropName = aesthetic.options.stylesPropName,
      themePropName = aesthetic.options.themePropName,
    } = options;
    const ParentComponent = (pure && React.PureComponent) ? React.PureComponent : React.Component;

    // Set base styles
    aesthetic.setStyles(styleName, styles, extendFrom);

    // $FlowIgnore Silence polymorphic errors
    class StyledComponent extends ParentComponent<StyleProps, StyleState> {
      static displayName: ?string = `Aesthetic(${styleName})`;

      static styleName: string = styleName;

      static WrappedComponent: HOCWrappedComponent = Component;

      static propTypes = {
        [themePropName]: PropTypes.string,
      };

      static contextTypes = {
        themeName: PropTypes.string,
      };

      // Allow consumers to customize styles
      static extendStyles(
        customStyles?: StyleCallback | StyleDeclarations = {},
        extendOptions?: HOCOptions = {},
      ): HOCComponent {
        if (__DEV__) {
          if (!extendable) {
            throw new Error(`${styleName} is not extendable.`);
          }
        }

        return style(
          aesthetic,
          customStyles,
          {
            ...options,
            ...extendOptions,
            extendFrom: styleName,
          },
        )(Component);
      }

      // Start transforming styles before we mount
      componentWillMount() {
        this.transformStyles(this.getTheme(this.props));
      }

      // Re-transform if the theme changes
      componentWillReceiveProps(nextProps: StyleProps) {
        const theme = this.getTheme(nextProps);

        if (theme !== this.state[themePropName]) {
          this.transformStyles(theme);
        }
      }

      getTheme(props: StyleProps): string {
        return props[themePropName] ||
          this.context.themeName ||
          aesthetic.options.defaultTheme ||
          '';
      }

      transformStyles(theme: string) {
        this.setState({
          [stylesPropName]: aesthetic.transformStyles(styleName, theme),
          [themePropName]: theme,
        });
      }

      render(): React$Node {
        return (
          <Component {...this.props} {...this.state} />
        );
      }
    }

    return hoistNonReactStatics(StyledComponent, Component);
  };
}
