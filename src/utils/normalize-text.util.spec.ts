import { normalizeText } from './normalize-text.util';

describe('normalizeText', () => {
  it.each([
    ['áéíóúüÁÉÍÓÚÜ', 'AEIOUUAEIOUU'],
    ['ñ Ñ', 'N N'],
    ['  hola   mundo  ', 'HOLA MUNDO'],
    ['José García', 'JOSE GARCIA'],
    ['café\n\n  con\tleche', 'CAFE CON LECHE'],
    ['123   números   45', '123 NUMEROS 45'],
    ['東京', '東京'],
    ['a\u0301 e\u0301 i\u0301', 'A E I'],
  ])('normalize «%s» → «%s»', (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });

  it.each(['', '   ', '\n\t  '])(
    'returns empty string when the input is «%s»',
    (input) => {
      expect(normalizeText(input)).toBe('');
    },
  );

  it('No change the input string', () => {
    const original = 'café';
    const copy = original.slice();
    normalizeText(original);
    expect(original).toBe(copy);
  });

  it('Keep symbols and unmutable sintaxis', () => {
    const txt = '¡hola, mundo!';
    expect(normalizeText(txt)).toBe('¡HOLA, MUNDO!');
  });
});
