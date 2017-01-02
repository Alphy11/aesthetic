import { expect } from 'chai';
import Styletron from 'styletron-client';
import StyletronAdapter from '../src/StyletronAdapter';
import {
  FONT_ROBOTO,
  KEYFRAME_FADE,
  SYNTAX_FULL,
  SYNTAX_AT_RULES,
  SYNTAX_PSEUDO,
  SYNTAX_FONT_FACE,
  SYNTAX_KEYFRAMES,
  SYNTAX_MEDIA_QUERY,
} from '../../../tests/mocks';

describe('StyletronAdapter', () => {
  const style = document.createElement('style');
  document.head.appendChild(style);
  let instance;

  beforeEach(() => {
    instance = new StyletronAdapter(new Styletron([style]));
  });

  it('can customize the styletron instance through the constructor', () => {
    const inst = new Styletron([style]);
    instance = new StyletronAdapter(inst);

    expect(instance.styletron).to.deep.equal(inst);
  });

  it('transforms style declarations into class names', () => {
    expect(instance.transform('component', SYNTAX_FULL)).to.deep.equal({
      button: 'button_1jj865m',
    });
  });

  it('converts unified syntax to native syntax', () => {
    expect(instance.convert('component', SYNTAX_FULL)).to.deep.equal({
      button: {
        margin: 0,
        padding: '6px 12px',
        border: '1px solid #2e6da4',
        borderRadius: 4,
        display: 'inline-block',
        cursor: 'pointer',
        fontFamily: [FONT_ROBOTO],
        fontWeight: 'normal',
        lineHeight: 'normal',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        textAlign: 'center',
        backgroundColor: '#337ab7',
        verticalAlign: 'middle',
        color: 'rgba(0, 0, 0, 0)',
        animationName: [KEYFRAME_FADE],
        animationDuration: '.3s',
        ':hover': {
          backgroundColor: '#286090',
          borderColor: '#204d74',
        },
        '::before': {
          content: '"★"',
          display: 'inline-block',
          verticalAlign: 'middle',
          marginRight: 5,
        },
        '@media (max-width: 600px)': {
          padding: '4px 8px',
        },
      },
    });
  });

  it.skip('allows standard at-rules');

  it('supports pseudos', () => {
    expect(instance.convert('component', SYNTAX_PSEUDO)).to.deep.equal(SYNTAX_PSEUDO);

    expect(instance.transform('component', SYNTAX_PSEUDO)).to.deep.equal({
      pseudo: 'pseudo_1217cca',
    });
  });

  it.skip('supports unified fallbacks');

  it.skip('supports native fallbacks');

  it.skip('supports unified font faces');

  it.skip('supports native font faces');

  it.skip('supports unified animations');

  it.skip('supports native animations');

  it('supports unified media queries', () => {
    expect(instance.convert('component', SYNTAX_MEDIA_QUERY)).to.deep.equal({
      media: {
        color: 'red',
        '@media (max-width: 1000px)': {
          color: 'green',
        },
        '@media (min-width: 300px)': {
          color: 'blue',
        },
      },
    });

    expect(instance.transform('component', SYNTAX_MEDIA_QUERY)).to.deep.equal({
      media: 'media_1dsrhwv',
    });
  });

  it('supports native media queries', () => {
    instance.disableUnifiedSyntax();

    const nativeSyntax = {
      media: {
        color: 'red',
        '@media (min-width: 300px)': {
          color: 'blue',
        },
        '@media (max-width: 1000px)': {
          color: 'green',
        },
      },
    };

    expect(instance.convert('component', nativeSyntax)).to.deep.equal(nativeSyntax);

    expect(instance.transform('component', nativeSyntax)).to.deep.equal({
      media: 'media_1dsrhwv',
    });
  });
});
