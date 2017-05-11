/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

/* eslint-disable react/sort-comp, react/no-unused-prop-types, react/require-default-props */

import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import Aesthetic from './Aesthetic';

import type {
  TransformedStylesMap,
  StyleDeclarationOrCallback,
  WrappedComponent,
  HOCComponent,
  HOCOptions,
} from '../../types';

type PropsAndState = {
  classNames?: TransformedStylesMap,
  theme?: string,
};

// Keep track in production
let instanceID = 0;

export default function style(
  aesthetic: Aesthetic,
  styles: StyleDeclarationOrCallback = {},
  options: HOCOptions = {},
): (WrappedComponent) => HOCComponent {
  return function wrapStyles(Component: WrappedComponent): HOCComponent {
    let styleName = options.styleName || Component.displayName;

    // Function/constructor name aren't always available when code is minified,
    // so only use it in development.
    if (process.env.NODE_ENV === 'development') {
      styleName = styleName || Component.name;

      if (!(aesthetic instanceof Aesthetic)) {
        throw new Error('An instance of `Aesthetic` is required.');

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

    // When in production, we should generate a random string to use as the style name.
    // If we don't do this, any minifiers that mangle function names would break
    // Aesthetic's caching layer.
    } else {
      instanceID += 1;

      // eslint-disable-next-line no-magic-numbers
      styleName = styleName || `${Math.random().toString(32).substr(2)}${instanceID}`;
    }

    const {
      stylesPropName = aesthetic.options.stylesPropName,
      themePropName = aesthetic.options.themePropName,
      extendable = aesthetic.options.extendable,
      extendFrom,
      pure = false,
    } = options;
    const ParentComponent = (pure && React.PureComponent) ? React.PureComponent : React.Component;

    // Set base styles
    aesthetic.setStyles(styleName, styles, extendFrom);

    class StyledComponent extends ParentComponent {
      props: PropsAndState;
      state: PropsAndState;

      static displayName: string = `Aesthetic(${styleName})`;

      static styleName: string = styleName;

      static wrappedComponent: WrappedComponent = Component;

      static propTypes = {
        [themePropName]: PropTypes.string,
      };

      static contextTypes = {
        themeName: PropTypes.string,
      };

      // Allow consumers to customize styles
      static extendStyles(
        customStyles: StyleDeclarationOrCallback,
        extendOptions: HOCOptions = {},
      ): HOCComponent {
        if (process.env.NODE_ENV === 'development') {
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
      componentWillReceiveProps(nextProps: PropsAndState) {
        const theme = this.getTheme(nextProps);

        if (theme !== this.state[themePropName]) {
          this.transformStyles(theme);
        }
      }

      getTheme(props: PropsAndState): string {
        return props[themePropName] || this.context.themeName || '';
      }

      transformStyles(theme: string) {
        this.setState({
          [themePropName]: theme,
          [stylesPropName]: aesthetic.transformStyles(styleName, theme),
        });
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
