/* eslint-disable sort-keys */

import { StyleSheet, StyleSheetTestUtils } from 'aphrodite';
import { StyleSheet as NoImpStyleSheet } from 'aphrodite/no-important';
import AphroditeAdapter from '../src/NativeAdapter';
import {
  FONT_ROBOTO_FLAT_SRC,
  KEYFRAME_FADE,
  SYNTAX_NATIVE_PARTIAL,
  SYNTAX_PSEUDO,
} from '../../../tests/mocks';

describe('aesthetic-adapter-aphrodite/NativeAdapter', () => {
  let instance;

  beforeEach(() => {
    StyleSheetTestUtils.suppressStyleInjection();
    instance = new AphroditeAdapter(StyleSheet);
  });

  afterEach(() => {
    StyleSheetTestUtils.clearBufferAndResumeStyleInjection();
  });

  it('errors for no React Native support', () => {
    instance.native = true;

    expect(() => instance.transform()).toThrowError('Aphrodite does not support React Native.');
  });

  it('can customize the aphrodite instance through the constructor', () => {
    const extension = { selectorHandler() {} };
    instance = new AphroditeAdapter(StyleSheet.extend([extension]));

    expect(instance.aphrodite).not.toEqual(StyleSheet);
  });

  it('supports no important mode', () => {
    instance = new AphroditeAdapter(NoImpStyleSheet);

    expect(instance.aphrodite).not.toEqual(StyleSheet);
  });

  it('transforms style declarations into class names', () => {
    expect(instance.transform('component', SYNTAX_NATIVE_PARTIAL)).toEqual({
      button: 'button_13l44zh',
    });
  });

  it('supports pseudos', () => {
    expect(instance.transform('component', SYNTAX_PSEUDO)).toEqual({
      pseudo: 'pseudo_q2zd6k',
    });
  });

  it.skip('supports fallbacks');

  it('supports font faces', () => {
    const nativeSyntax = {
      font: {
        fontFamily: FONT_ROBOTO_FLAT_SRC,
        fontSize: 20,
      },
    };

    expect(instance.transform('component', nativeSyntax)).toEqual({
      font: 'font_nxcmiz',
    });
  });

  it('supports animations', () => {
    const nativeSyntax = {
      animation: {
        animationDuration: '3s, 1200ms',
        animationIterationCount: 'infinite',
        animationName: KEYFRAME_FADE,
      },
    };

    expect(instance.transform('component', nativeSyntax)).toEqual({
      animation: 'animation_mab5hn',
    });
  });

  it('supports media queries', () => {
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

    expect(instance.transform('component', nativeSyntax)).toEqual({
      media: 'media_1yqe7pa',
    });
  });
});
