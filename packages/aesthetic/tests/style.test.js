import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Aesthetic from '../src/Aesthetic';
import ThemeProvider from '../src/ThemeProvider';
import style from '../src/style';
import { TestAdapter, TEST_CLASS_NAMES } from '../../../tests/mocks';

function BaseComponent() {
  return null;
}

describe('style()', () => {
  let aesthetic;

  beforeEach(() => {
    aesthetic = new Aesthetic(new TestAdapter());
  });

  it('inherits name from component `constructor.name`', () => {
    const Wrapped = style(aesthetic)(BaseComponent);

    expect(Wrapped.displayName).to.equal('Aesthetic(BaseComponent)');
    expect(Wrapped.styleName).to.equal('BaseComponent');
  });

  it('inherits name from component `displayName`', () => {
    class DisplayComponent extends React.Component {
      static displayName = 'CustomDisplayName';
      render() {
        return null;
      }
    }

    const Wrapped = style(aesthetic)(DisplayComponent);

    expect(Wrapped.displayName).to.equal('Aesthetic(CustomDisplayName)');
    expect(Wrapped.styleName).to.equal('CustomDisplayName');
  });

  it('inherits style name from `options.styleName`', () => {
    const Wrapped = style(aesthetic, {}, {
      styleName: 'CustomStyleName',
    })(BaseComponent);

    expect(Wrapped.displayName).to.equal('Aesthetic(CustomStyleName)');
    expect(Wrapped.styleName).to.equal('CustomStyleName');
  });

  it('stores the original component as a static property', () => {
    const Wrapped = style(aesthetic)(BaseComponent);

    expect(Wrapped.wrappedComponent).to.equal(BaseComponent);
  });

  it('sets default styles on the `Aesthetic` instance', () => {
    expect(aesthetic.styles.BaseComponent).to.be.an('undefined');

    style(aesthetic, {
      button: {
        display: 'inline-block',
        padding: 5,
      },
    })(BaseComponent);

    expect(aesthetic.styles.BaseComponent).to.deep.equal({
      button: {
        display: 'inline-block',
        padding: 5,
      },
    });
  });

  it('automatically locks styles on the `Aesthetic` instance', () => {
    expect(aesthetic.locked.BaseComponent).to.be.an('undefined');

    style(aesthetic, {
      button: {
        display: 'inline-block',
        padding: 5,
      },
    })(BaseComponent);

    expect(aesthetic.locked.BaseComponent).to.equal(true);
  });

  it('doesnt lock styles if `options.lockStyling` is false', () => {
    expect(aesthetic.locked.BaseComponent).to.be.an('undefined');

    style(aesthetic, {
      button: {
        display: 'inline-block',
        padding: 5,
      },
    }, {
      lockStyling: false,
    })(BaseComponent);

    expect(aesthetic.locked.BaseComponent).to.be.an('undefined');
  });

  it('defines static styling methods', () => {
    const Wrapped = style(aesthetic)(BaseComponent);

    expect(Wrapped.setStyles).to.be.an('function');
    expect(Wrapped.mergeStyles).to.be.an('function');
  });

  it('can set styles using `setStyles`', () => {
    const Wrapped = style(aesthetic, {
      button: {
        display: 'inline-block',
        padding: 5,
      },
    }, {
      lockStyling: false,
    })(BaseComponent);

    expect(aesthetic.styles.BaseComponent).to.deep.equal({
      button: {
        display: 'inline-block',
        padding: 5,
      },
    });

    Wrapped.setStyles({
      notButton: {
        color: 'red',
      },
    });

    expect(aesthetic.styles.BaseComponent).to.deep.equal({
      notButton: {
        color: 'red',
      },
    });
  });

  it('can merge styles using `mergeStyles`', () => {
    const Wrapped = style(aesthetic, {
      button: {
        display: 'inline-block',
        padding: 5,
      },
    }, {
      lockStyling: false,
    })(BaseComponent);

    expect(aesthetic.styles.BaseComponent).to.deep.equal({
      button: {
        display: 'inline-block',
        padding: 5,
      },
    });

    Wrapped.mergeStyles({
      button: {
        padding: 10,
      },
      notButton: {
        color: 'red',
      },
    });

    expect(aesthetic.styles.BaseComponent).to.deep.equal({
      button: {
        display: 'inline-block',
        padding: 10,
      },
      notButton: {
        color: 'red',
      },
    });
  });

  it('locks styles after using `setStyles`', () => {
    const Wrapped = style(aesthetic, {
      button: {
        display: 'inline-block',
        padding: 5,
      },
    }, {
      lockStyling: false,
    })(BaseComponent);

    expect(aesthetic.locked.BaseComponent).to.be.an('undefined');

    Wrapped.setStyles({
      notButton: {
        color: 'red',
      },
    });

    expect(aesthetic.locked.BaseComponent).to.equal(true);
  });

  it('inherits theme name from prop', () => {
    function ThemeComponent(props) {
      expect(props.theme).to.equal('foo');
      return null;
    }

    const Wrapped = style(aesthetic)(ThemeComponent);

    shallow(<Wrapped theme="foo" />).dive();
  });

  it('inherits theme name from context', () => {
    function ThemeComponent(props) {
      expect(props.theme).to.equal('foo');
      return null;
    }

    const Wrapped = style(aesthetic)(ThemeComponent);

    shallow(<ThemeProvider name="foo"><Wrapped /></ThemeProvider>).dive();
  });

  it('transforms styles on mount', () => {
    function StylesComponent(props) {
      expect(props.styles).to.deep.equal(TEST_CLASS_NAMES);
      return null;
    }

    const Wrapped = style(aesthetic, {
      header: { color: 'red' },
      footer: { color: 'blue' },
    })(StylesComponent);

    expect(aesthetic.classNames.StylesComponent).to.be.an('undefined');

    shallow(<Wrapped />).dive();

    expect(aesthetic.classNames.StylesComponent).to.deep.equal(TEST_CLASS_NAMES);
  });

  it('can customize the theme prop type using `options.themePropName`', () => {
    function ThemeComponent(props) {
      expect(props.someThemeNameHere).to.equal('foo');
      return null;
    }

    const Wrapped = style(aesthetic, {}, {
      themePropName: 'someThemeNameHere',
    })(ThemeComponent);

    expect(Wrapped.propTypes).to.have.ownProperty('someThemeNameHere');

    shallow(<Wrapped someThemeNameHere="foo" />).dive();
  });

  it('can customize the styles prop type using `options.stylesPropName`', () => {
    function StylesComponent(props) {
      expect(props.classNames).to.deep.equal(TEST_CLASS_NAMES);
      return null;
    }

    const Wrapped = style(aesthetic, {
      header: { color: 'red' },
      footer: { color: 'blue' },
    }, {
      stylesPropName: 'classNames',
    })(StylesComponent);

    shallow(<Wrapped />).dive();
  });

  it('errors if the same style name is used', () => {
    expect(() => {
      style(aesthetic)(BaseComponent);
      style(aesthetic)(BaseComponent);
    }).to.throw(Error, 'A component has already been styled under the name "BaseComponent". Either rename the component or define `options.styleName`.');
  });
});
