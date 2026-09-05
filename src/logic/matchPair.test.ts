import { DISHES } from '../data/dishes';
import { matchPair, splitPhrase } from './matchPair';

describe('splitPhrase', () => {
  test('splits on "and"', () => {
    expect(splitPhrase('egusi and pounded yam')).toEqual(['egusi', 'pounded yam']);
  });

  test('splits on "with", "&" and commas', () => {
    expect(splitPhrase('amala with ewedu')).toEqual(['amala', 'ewedu']);
    expect(splitPhrase('eba & okra')).toEqual(['eba', 'okra']);
    expect(splitPhrase('banga, fufu')).toEqual(['banga', 'fufu']);
  });

  test('does not split a dish whose own name contains "and"', () => {
    // "Ewedu & gbegiri" is one dish; "rice and peas" is one dish.
    expect(splitPhrase('rice and peas')).toEqual(['rice and peas']);
  });

  test('ignores case and extra whitespace', () => {
    expect(splitPhrase('  EGUSI   AND   EBA ')).toEqual(['egusi', 'eba']);
  });
});

describe('matchPair', () => {
  test('matches a soup and a swallow as a pair', () => {
    const r = matchPair('egusi and pounded yam', DISHES);
    expect(r.kind).toBe('pair');
    if (r.kind !== 'pair') throw new Error('expected a pair');
    expect(r.soup.id).toBe('egusi');
    expect(r.swallow.id).toBe('pounded-yam');
  });

  test('order does not matter — swallow first still resolves correctly', () => {
    const r = matchPair('eba and egusi', DISHES);
    expect(r.kind).toBe('pair');
    if (r.kind !== 'pair') throw new Error('expected a pair');
    expect(r.soup.id).toBe('egusi');
    expect(r.swallow.id).toBe('eba');
  });

  test('a lone soup is partial, and names what is missing', () => {
    const r = matchPair('egusi', DISHES);
    expect(r.kind).toBe('partial');
    if (r.kind !== 'partial') throw new Error('expected partial');
    expect(r.dish.id).toBe('egusi');
    expect(r.missing).toBe('swallow');
  });

  test('a lone swallow asks for a soup', () => {
    const r = matchPair('amala', DISHES);
    expect(r.kind).toBe('partial');
    if (r.kind !== 'partial') throw new Error('expected partial');
    expect(r.missing).toBe('soup');
  });

  test('a rice dish is a single, not half a pair', () => {
    const r = matchPair('jollof rice', DISHES);
    expect(r.kind).toBe('single');
    if (r.kind !== 'single') throw new Error('expected single');
    expect(r.dish.id).toBe('jollof');
  });

  test('an unknown dish returns none, carrying the query back', () => {
    const r = matchPair('spaghetti bolognese', DISHES);
    expect(r.kind).toBe('none');
    if (r.kind !== 'none') throw new Error('expected none');
    expect(r.query).toBe('spaghetti bolognese');
  });

  test('empty input is none, not a crash', () => {
    expect(matchPair('   ', DISHES).kind).toBe('none');
  });

  test('matches ingredients too, so "melon seed" finds egusi', () => {
    const r = matchPair('melon seed and eba', DISHES);
    expect(r.kind).toBe('pair');
    if (r.kind !== 'pair') throw new Error('expected a pair');
    expect(r.soup.id).toBe('egusi');
  });

  test('a multi-word dish name matches as one dish', () => {
    const r = matchPair('ewedu & gbegiri and amala', DISHES);
    expect(r.kind).toBe('pair');
    if (r.kind !== 'pair') throw new Error('expected a pair');
    expect(r.soup.id).toBe('ewedu-gbegiri');
    expect(r.swallow.id).toBe('amala');
  });
});
