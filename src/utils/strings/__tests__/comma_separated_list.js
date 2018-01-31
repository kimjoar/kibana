import { parseCommaSeparatedList } from '../comma_separated_list';

describe('utils parseCommaSeparatedList()', () => {
  it('supports non-string values', () => {
    expect(parseCommaSeparatedList(0)).toEqual([]);
    expect(parseCommaSeparatedList(1)).toEqual(['1']);
    expect(parseCommaSeparatedList({})).toEqual(['[object Object]']);
    expect(parseCommaSeparatedList(() => {})).toEqual(['() => {}']);
    expect(parseCommaSeparatedList((a, b) => b)).toEqual(['(a', 'b) => b']);
    expect(parseCommaSeparatedList(/foo/)).toEqual(['/foo/']);
    expect(parseCommaSeparatedList(null)).toEqual([]);
    expect(parseCommaSeparatedList(undefined)).toEqual([]);
    expect(parseCommaSeparatedList(false)).toEqual([]);
    expect(parseCommaSeparatedList(true)).toEqual(['true']);
  });

  it('returns argument untouched if it is an array', () => {
    const inputs = [
      [],
      [1],
      ['foo,bar']
    ];
    for (const input of inputs) {
      const json = JSON.stringify(input);
      expect(parseCommaSeparatedList(input)).toBe(input);
      expect(json).toBe(JSON.stringify(input));
    }
  });

  it('trims whitspace around elements', () => {
    expect(parseCommaSeparatedList('1 ,    2,    3     ,    4')).toEqual(['1', '2', '3', '4']);
  });

  it('ignored empty elements between multiple commas', () => {
    expect(parseCommaSeparatedList('foo , , ,,,,, ,      ,bar')).toEqual(['foo', 'bar']);
  });
});
