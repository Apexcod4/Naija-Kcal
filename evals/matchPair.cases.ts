import { PairMatch } from '../src/logic/matchPair';

/**
 * Hard cases for the text-to-pair matcher.
 *
 * These are deliberately NOT the synthetic examples in matchPair.test.ts.
 * They are how people actually type and speak about Nigerian food: Pidgin,
 * abbreviations, quantities inline, regional names, dish names the table
 * does not contain, and phrasings taken from real logs (the "amala and egusi
 * soup with stock fish" and "akpu and edikaikong" cases come from
 * screenshots of a shipping competitor).
 *
 * An eval is a measurement, not a pass/fail gate. The number that matters is
 * how it moves, not whether every case passes today.
 */
export type EvalCase = {
  input: string;
  /** What a correct matcher should return. */
  expect:
    | { kind: 'pair'; soup: string; swallow: string }
    | { kind: 'single'; id: string }
    | { kind: 'partial'; id: string }
    | { kind: 'none' };
  why: string;
};

export const CASES: EvalCase[] = [
  // --- Straightforward pairs, in the phrasings people actually use
  {
    input: 'egusi and pounded yam',
    expect: { kind: 'pair', soup: 'egusi', swallow: 'pounded-yam' },
    why: 'canonical phrasing',
  },
  {
    input: 'amala and ewedu',
    expect: { kind: 'pair', soup: 'ewedu-gbegiri', swallow: 'amala' },
    why: 'soup named by half its compound name',
  },
  {
    input: 'eba and okra soup',
    expect: { kind: 'pair', soup: 'okra', swallow: 'eba' },
    why: 'the word "soup" appended to a soup name',
  },
  {
    input: 'efo riro with semo',
    expect: { kind: 'pair', soup: 'efo-riro', swallow: 'semo' },
    why: '"with" instead of "and"',
  },
  {
    input: 'EBA AND EGUSI',
    expect: { kind: 'pair', soup: 'egusi', swallow: 'eba' },
    why: 'shouting',
  },

  // --- Quantities inline, which is how people actually speak a log
  {
    input: '2 wraps of eba and 1 ladle of egusi',
    expect: { kind: 'pair', soup: 'egusi', swallow: 'eba' },
    why: 'quantities inline — units are set on the Portion screen, not here',
  },
  {
    input: 'one wrap amala, two ladles ewedu',
    expect: { kind: 'pair', soup: 'ewedu-gbegiri', swallow: 'amala' },
    why: 'spelled-out quantities and a comma separator',
  },

  // --- Real phrasings lifted from a shipping competitor's logs
  {
    input: 'amala and egusi soup with stock fish',
    expect: { kind: 'pair', soup: 'egusi', swallow: 'amala' },
    why: 'a garnish named after the pair must not derail the match',
  },
  {
    input: 'akpu and edikaikong',
    expect: { kind: 'pair', soup: 'afang', swallow: 'fufu' },
    why: 'regional names: akpu is fufu, edikaikong is near afang. Neither is aliased.',
  },
  {
    input: 'yam and stew',
    expect: { kind: 'none' },
    why: 'boiled yam and stew are absent; "yam" must not silently match pounded yam',
  },

  // --- Pidgin and abbreviation
  {
    input: 'eba n egusi',
    expect: { kind: 'pair', soup: 'egusi', swallow: 'eba' },
    why: '"n" for "and"',
  },
  {
    input: 'abula',
    expect: { kind: 'partial', id: 'ewedu-gbegiri' },
    why: 'abula is the common name for ewedu & gbegiri; it appears in the unit label only',
  },
  {
    input: 'swallow and soup',
    expect: { kind: 'none' },
    why: 'category words, not dishes — must not pick an arbitrary one',
  },

  // --- Misspellings, which are constant on a phone keyboard
  {
    input: 'eguzi and eba',
    expect: { kind: 'pair', soup: 'egusi', swallow: 'eba' },
    why: 'one-character misspelling of the most common soup',
  },
  {
    input: 'pounded yam and ogbono',
    expect: { kind: 'pair', soup: 'ogbono', swallow: 'pounded-yam' },
    why: 'swallow first, multi-word',
  },

  // --- Singles and non-pairs
  {
    input: 'jollof rice',
    expect: { kind: 'single', id: 'jollof' },
    why: 'rice is not half a pair',
  },
  {
    input: 'suya',
    expect: { kind: 'single', id: 'suya' },
    why: 'street food, single item',
  },
  {
    input: 'rice and peas',
    expect: { kind: 'single', id: 'rice-and-peas' },
    why: 'a dish whose own name contains a separator',
  },
  {
    input: 'moi moi and pap',
    expect: { kind: 'single', id: 'moi-moi' },
    why: 'pap is absent. Street food is not half a pair, so single is correct           — this case originally expected partial, which was a flawed judge.',
  },


  // --- Adversarial: real Nigerian soups one character apart. These exist to
  // prove fuzzy matching would be unsafe here, not to be fixed by it.
  {
    input: 'ora and eba',
    expect: { kind: 'partial', id: 'eba' },
    why: 'Ora soup is a real dish absent from the table and is ONE edit from Oha. Guessing Oha would log the wrong soup.',
  },
  {
    input: 'efo and eba',
    expect: { kind: 'pair', soup: 'efo-riro', swallow: 'eba' },
    why: 'positive control: efo is an explicit alias, so it must still resolve',
  },

  // --- Should not match
  {
    input: 'spaghetti bolognese',
    expect: { kind: 'none' },
    why: 'not a dish this app knows',
  },
  {
    input: '',
    expect: { kind: 'none' },
    why: 'empty input',
  },
];

/** Did the matcher produce what the case expects? */
export function scores(actual: PairMatch, expected: EvalCase['expect']): boolean {
  if (actual.kind !== expected.kind) return false;

  switch (expected.kind) {
    case 'pair':
      return (
        actual.kind === 'pair' &&
        actual.soup.id === expected.soup &&
        actual.swallow.id === expected.swallow
      );
    case 'single':
    case 'partial':
      return (
        (actual.kind === 'single' || actual.kind === 'partial') &&
        actual.dish.id === expected.id
      );
    case 'none':
      return actual.kind === 'none';
  }
}
