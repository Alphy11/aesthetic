# Aesthetic v0.0.2
[![Build Status](https://travis-ci.org/milesj/aesthetic.svg?branch=master)](https://travis-ci.org/milesj/aesthetic)

Abstract library to support a range of styling options for React components.

TODO

## Installation

Aesthetic requires React as a peer dependency.

```
npm install aesthetic react --save
// Or
yarn add aesthetic react
```

## Documentation

* [Initial Setup](#initial-setup)
  * [Webpack](#webpack)
  * [Browserify](#browserify)
* [Style Adapters](#style-adapters)
* [Creating A Styler](#creating-a-styler)
* [Defining Components](#defining-components)
  * [Overwriting Styles](#overwriting-styles)
  * [Combining Classes](#combining-classes)
* [Styling Components](#styling-components)
  * [External Classes](#external-classes)
  * [Style Objects](#style-objects)
  * [Style Functions](#style-functions)
* [Theming Components](#theming-components)
  * [Using Theme Styles](#using-theme-styles)
  * [Activating Themes](#activating-themes)
* [Unified Syntax](#unified-syntax)
  * [Properties](#properties)
  * [Pseudos](#pseudos)
  * [Fallbacks](#fallbacks)
  * [Media Queries](#media-queries)
  * [Font Faces](#font-faces)
  * [Animations](#animations)
  * [Selectors](#selectors)
* [Competitors Comparison](#competitors-comparison)
  * [Features](#features)
  * [Adapters](#adapters)

### Initial Setup

Aesthetic makes heavy use of `process.env.NODE_ENV` for logging errors in development.
These errors will be entirely removed in production if the following build steps are configured.

#### Webpack

[DefinePlugin](https://webpack.github.io/docs/list-of-plugins.html#defineplugin) plugin
is required when using Webpack.

```javascript
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
}),
```

#### Browserify

[Envify](https://github.com/hughsk/envify) transformer is required when using Browserify.

```javascript
envify({
  NODE_ENV: process.env.NODE_ENV || 'production',
});
```

### Style Adapters

An adapter in the context of Aesthetic is a third-party library that supports CSS in JavaScript,
whether it be injecting CSS styles based off JavaScript objects, importing CSS during a build
process, or simply referencing CSS class names.

The following libraries and their features are officially supported by Aesthetic.

| Adapter | Unified Syntax | Pseudos | Fallbacks | Fonts | Animations | Media Queries |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| [CSS class names](#external-classes) | | ✓ | ✓ | ✓ | ✓ | ✓ |
| [CSS modules][css-modules] | | ✓ | ✓ | ✓ | ✓ | ✓ |
| [Aphrodite][aphrodite] | ✓ | ✓ | | ✓ | ✓ | ✓ |
| [Glamor][glamor] | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| [JSS][jss] | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

And the following libraries are not supported.

* [CSSX](https://github.com/krasimir/cssx) -
  Does not generate unique class names during compilation and instead
  uses the literal class names and or tag names defined in the style declaration.
  This allows for global style collisions, which we want to avoid.
* [Radium](https://github.com/FormidableLabs/radium) -
  Uses inline styles instead of compiling class names and attaching CSS styles to the DOM.

### Creating A Styler

To start using Aesthetic, a styler function must be created. This styler function
acts as a factory for the creation of higher-order-components
([HOC](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e)).
These HOC's are used in transforming styles via adapters and passing down CSS
class names to the original wrapped component.

To begin, we must create an instance of `Aesthetic` with an [adapter](#style-adapters),
pass it to `createStyler`, and export the new function. I suggest doing this an a file
that can be imported for reusability.

```javascript
import Aesthetic, { createStyler } from 'aesthetic';
import JSSAdapter from 'aesthetic-jss'; // Or your chosen adapter

export default createStyler(new Aesthetic(new JSSAdapter()));
```

Once we have a styler function, we can import it and wrap our React components.
The styler function accepts a [style declaration](#styling-components) as its first argument,
and an object of configurable options as the second. The following options are supported.

* `styleName` (string) - The unique style name of the component. This name is primarily
  used in logging and caching. Defaults to the component name.
* `lockStyling` (boolean) - Will lock styles from being written after the default styles
  have been set. Defaults to `true`.
* `classNamesPropName` (string) - Name of the prop in which the compiled class names
  object is passed to. Defaults to `classNames`.
* `themePropName` (string) - Name of the prop in which the theme name is passed to.
  Defaults to `theme`.

```javascript
export default style({
  button: { ... },
}, {
  styleName: 'CustomButton',
  lockStyling: false,
  classNamesPropName: 'classes',
  themePropName: 'appTheme',
})(Button);
```

### Defining Components

Now that we have a styler function, we can start styling our components by wrapping
the component declaration with the styler function and passing an object of styles.
When this component is rendered, the style object is transformed into an object of class names,
and passed to the `classNames` prop.

```javascript
import React, { PropTypes } from 'react';
import { ClassNamesPropType } from 'aesthetic';
import style from '../path/to/style';

function Button({ children, classNames, icon }) {
  return (
    <button type="button" className={classNames.button}>
      {icon && (
        <span className={classNames.icon}>{icon}</span>
      )}

      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  classNames: ClassNamesPropType,
  icon: PropTypes.node,
};

export default style({
  button: { ... },
  icon: { ... }
})(Button);
```

#### Overwriting Styles

Since styles are isolated and colocated within a component, they can be impossible to
customize, especially if the component comes from a third-party library. If a component
hasn't been locked via the `lockStyling` option, styles can be customized by calling
the static `setStyles` method on the wrapped component instance.

```javascript
import Button from '../Button';

Button.setStyles({
  button: {
    padding: '5px 10px',
    fontWeight: 'bold',
    // ...
  },
});
```

Any previous styles that were overwritten will be available when using a
[style function](#style-functions).

> `setStyles` can only be called once, as styles are immediately locked.
> This avoids unwanted style injections.

#### Combining Classes

When multiple class names need to be applied to a single element, the `classes`
function provided by Aesthetic can be used. This function accepts an arbitrary
number of arguments, all of which can be strings, arrays, or objects that evaluate to true.

```javascript
import { classes } from 'aesthetic';

classes(
  'foo',
  expression && 'bar',
  {
    baz: false,
    qux: true,
  },
); // foo qux
```

Using our button style examples above, let's add an active state and can combine classes
like so. Specificity is important, so define styles from top to bottom!

```javascript
function Button({ children, classNames, icon, active = false }) {
  return (
    <button
      type="button"
      className={classes(
        classNames.button,
        active && classNames.button__active,
      )}
    >
      {icon && (
        <span className={classNames.icon}>{icon}</span>
      )}

      {children}
    </button>
  );
}
```

### Styling Components

As mentioned previously, to style a component, an object or function must be passed
as the first argument to the [styler function](#creating-a-styler). This object
represents a mapping of elements (and modifiers) to declarations. For example:

```javascript
style({
  button: { ... },
  button__active: { ... },
  icon: { ... },
})(Button)
```

The following types of declarations are permitted.

#### External Classes

External CSS class names can be referenced by passing a string of the class name.

```javascript
style({
  button: 'button',
  button__active: 'button--active',
  icon: 'button__icon',
})(Button)
```

To make use of class names, the provided `ClassNameAdapter` must be used.

```javascript
import Aesthetic, { createStyler, ClassNameAdapter } from 'aesthetic';

export default createStyler(new Aesthetic(new ClassNameAdapter()));
```

#### Style Objects

CSS styles can be defined using an object of properties to values. These objects are
transformed using [adapters](#style-adapters) and optionally support the
[unified syntax](#unified-syntax) defined by Aesthetic.

```javascript
style({
  button: {
    background: '#eee',
    // ...
  },
  button__active: {
    background: '#fff',
    // ...
  },
  icon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    // ...
  },
})(Button)
```

#### Style Functions

Style functions are simply functions that return a style object. The benefits of using a
function is that it provides the [current theme](#using-themes) as the first argument,
and the [previous styles](#overwriting-styles) as the second argument.

```javascript
style(function (theme, prevStyles) {
  // ...
})(Button)
```

### Theming Components

Themes are great in that they enable components to be styled in different ways based
on pre-defined style guide parameters, like font size, color hex codes, and more.

To make use of a theme, register it through the `Aesthetic` instance using `registerTheme`.
This method accepts a name, an object of parameters, and an optional
[style object](#style-objects) used for globals (like font faces and animation keyframes).

```javascript
aesthetic.registerTheme('dark', {
  unit: 'em',
  unitSize: 8,
  spacing: 5,
  font: 'Roboto',
}, {
  '@font-face': {
    roboto: {
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: 'normal',
      src: "url('roboto.woff2') format('roboto')",
    },
  },
});
```

> Global styles are immediately compiled and attached the DOM. Be wary of conflicts.

#### Using Theme Styles

Once a theme has been registered, we can access the style parameters by using a
[style function](#style-functions). The parameters object is passed as the first
argument to the function.

```javascript
style((theme) => ({
  button: {
    fontSize: `${theme.unitSize}${theme.unit}`,
    fontFamily: theme.font,
    padding: theme.spacing,
  },
}))(Component);
```

#### Activating Themes

To activate and inform components to use a specific theme, we must use the `ThemeProvider`,
which accepts a `name` of the theme.

```javascript
import { ThemeProvider } from 'aesthetic';

<ThemeProvider name="default">
  // All components within here will use the "default" theme

  <ThemeProvider name="dark">
    // And all components here will use "dark"
  </ThemeProvider>
</ThemeProvider>
```

Or by passing a `theme` prop to an individual component.

```javascript
<Button theme="dark">Save</Button>
```

### Unified Syntax

Aesthetic provides an optional unified CSS-in-JS syntax. This unified syntax permits
easy [drop-in replacements](https://en.wikipedia.org/wiki/Drop-in_replacement) between
adapters that utilize CSS-in-JS objects.

**Pros**
* Easily swap between CSS-in-JS adapters (for either performance or extensibility reasons)
  without having to rewrite all CSS object syntax.
* Only have to learn one form of syntax.

**Cons**
* Slight overhead (like milliseconds) converting the unified syntax to the adapters native
  syntax. However, Aesthetic caches heavily.
* Must learn a new form of syntax (hopefully the last one).

**Why a new syntax?**

While implementing adapters and writing tests for all their syntax and use cases, I noticed
that all adapters shared about 90-95% of the same syntax. That remaining percentage could
easily be abstracted away by a library, and hence, this unified syntax was created. In the end,
it was mostly for fun, but can easily be disabled if need be.

**Why a different at-rule structure?**

The major difference between the unified syntax and native adapters syntax, is that at-rules
in the unified syntax are now multi-dimensional objects indexed by the name of the at-rule
(`@media`), while at-rules in the native syntax are single objects indexed by the at-rule
declaration (`@media (min-width: 100px)`).

Supporting the native syntax incurred an linear (`O(n)`) lookup, as we would have to loop
through each object recursively to find all at-rules, while the unified syntax is a simple
constant (`O(1)`) lookup as we know the names ahead of time. This constant time lookup is
what enables a fast conversion process between the unified and native syntaxes.

**What if I want to use the adapter's syntax?**

If you'd like to use the native syntax of your chosen adapter, simply call
`disableUnifiedSyntax()` on the instance of your adapter.

#### Properties

Standard structure for defining properties.

* Supports camel case property names.
* Units can be written is literal numbers.

```javascript
button: {
  margin: 0,
  padding: 5,
  display: 'inline-block',
  lineHeight: 'normal',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: '#ccc',
  color: '#000',
},
buttonGroup: {
  // ...
},
```

> JSS requires the `jss-default-unit`, `jss-camel-case`, and `jss-nested`
> plugins for unified syntax support.

#### Pseudos

Pseudo elements and classes are defined inside an element as nested objects.

```javascript
button: {
  // ...
  ':hover': {
    backgroundColor: '#eee',
  },
  '::before': {
    content: '"★"',
    display: 'inline-block',
    marginRight: 5,
  },
},
```

#### Fallbacks

Property fallbacks for old browsers are defined under the `@fallbacks` object.
Each property accepts a single value or an array of values.

```javascript
wrapper: {
  // ...
  background: 'linear-gradient(...)',
  display: 'flex',
  '@fallbacks': {
    background: 'red',
    display: ['box', 'flex-box'],
  },
},
```

> Aphrodite does not support fallback styles.

#### Media Queries

Media queries are defined inside an element using a `@media` object.

```javascript
tooltip: {
  // ...
  maxWidth: 300,
  '@media': {
    '(min-width: 400px)': {
      maxWidth: 'auto',
    },
  },
},
```

#### Font Faces

Font faces are defined outside the element using a `@font-face` object
and are referenced by font family name.

```javascript
'@font-face': {
  roboto: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'normal',
    src: "url('roboto.woff2') format('roboto')",
  },
},
button: {
  // ...
  fontFamily: 'Roboto',
},
tooltip: {
  // ...
  fontFamily: 'Roboto, sans-serif',
},
```

#### Animations

Animation keyframes are defined outside the element using a `@keyframes` object
and are referenced by animation name (the object key).

```javascript
'@keyframes': {
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
},
button: {
  // ...
  animationName: 'fade',
  animationDuration: '3s',
},
```

#### Selectors

Parent, child, and sibling selectors are purposefully not supported. Use unique and
isolated element names and style declarations instead.

### Competitors Comparison

A brief comparison of Aesthetic to competing React style abstraction libraries.

#### Features

| | aesthetic | [react-with-styles][react-with-styles] | [styled-components][styled-components] | [radium][radium] |
| --- | :---: | :---: | :---: | :---: |
| Abstraction | HOC | HOC | Template Literals | HOC |
| Type | Classes | Classes, Inline styles | Classes | Inline styles |
| Unified Syntax | ✓ | | | |
| Caching | ✓ | | ✓ | N/A |
| Themes | ✓ | ✓ | ✓ | |
| Style Overwriting | ✓ | | | ||

#### Adapters

| | aesthetic | [react-with-styles][react-with-styles] | [styled-components][styled-components] | [radium][radium] |
| --- | :---: | :---: | :---: | :---: |
| [CSS class names](#external-classes) | ✓ | | | |
| [CSS Modules][css-modules] | ✓ | | | |
| [Aphrodite][aphrodite] | ✓ | ✓ | | |
| [Glamor][glamor] | ✓ | | ✓ | |
| [JSS][jss] | ✓ | ✓ | | |
| [React Native][react-native] | | ✓ | | ||

[css-modules]: https://github.com/milesj/aesthetic/tree/master/packages/aesthetic-css-modules
[aphrodite]: https://github.com/milesj/aesthetic/tree/master/packages/aesthetic-aphrodite
[glamor]: https://github.com/milesj/aesthetic/tree/master/packages/aesthetic-glamor
[jss]: https://github.com/milesj/aesthetic/tree/master/packages/aesthetic-jss
[radium]: https://github.com/FormidableLabs/radium
[react-native]: https://github.com/facebook/react-native
[react-with-styles]: https://github.com/airbnb/react-with-styles
[styled-components]: https://github.com/styled-components/styled-components
