/* eslint-disable sort-keys */

import { createRenderer } from 'fela';
import webPreset from 'fela-preset-web';
import UnifiedFelaAdapter from '../src/UnifiedAdapter';
import {
  SYNTAX_UNIFIED_FULL,
  SYNTAX_FALLBACK,
  SYNTAX_AT_RULES,
  SYNTAX_PSEUDO,
  SYNTAX_FONT_FACE,
  SYNTAX_KEYFRAMES,
  SYNTAX_MEDIA_QUERY,
} from '../../../tests/mocks';

describe('aesthetic-adapter-fela/UnifiedAdapter', () => {
  let instance;

  beforeEach(() => {
    instance = new UnifiedFelaAdapter(createRenderer({
      plugins: [...webPreset],
    }));
  });

  it('transforms style declarations into class names', () => {
    expect(instance.transform('component', SYNTAX_UNIFIED_FULL)).toEqual({
      button: 'a b c d e f g h i j k l m n o p q r s t u v w x',
    });
  });

  it('converts unified syntax to native syntax', () => {
    expect(instance.convert(SYNTAX_UNIFIED_FULL)).toEqual({
      button: {
        margin: 0,
        padding: '6px 12px',
        border: '1px solid #2e6da4',
        borderRadius: 4,
        display: 'inline-block',
        cursor: 'pointer',
        fontFamily: '"Roboto"',
        fontWeight: 'normal',
        lineHeight: 'normal',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        textAlign: 'center',
        backgroundColor: '#337ab7',
        verticalAlign: 'middle',
        color: ['#fff', 'rgba(0, 0, 0, 0)'],
        animationName: 'k1',
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

  it('allows standard at-rules', () => {
    expect(instance.convert(SYNTAX_AT_RULES)).toEqual(SYNTAX_AT_RULES);
  });

  it('supports pseudos', () => {
    expect(instance.convert(SYNTAX_PSEUDO)).toEqual(SYNTAX_PSEUDO);
  });

  it('supports fallbacks', () => {
    expect(instance.convert(SYNTAX_FALLBACK)).toEqual({
      fallback: {
        background: ['red', 'linear-gradient(...)'],
        display: ['box', 'flex-box', 'flex'],
      },
    });
  });

  it('supports font faces', () => {
    expect(instance.convert(SYNTAX_FONT_FACE)).toEqual({
      font: {
        fontFamily: '"Roboto"',
        fontSize: 20,
      },
    });
  });

  it('supports animations', () => {
    expect(instance.convert(SYNTAX_KEYFRAMES)).toEqual({
      animation: {
        animationName: 'k1',
        animationDuration: '3s, 1200ms',
        animationIterationCount: 'infinite',
      },
    });
  });

  it('supports media queries', () => {
    expect(instance.convert(SYNTAX_MEDIA_QUERY)).toEqual({
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
  });
});
