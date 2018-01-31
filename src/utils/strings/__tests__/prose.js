import { formatListAsProse } from '../prose';

describe('utils formatListAsProse()', () => {
  it('throw TypeError for non array arguments', () => {
    const expectedError = 'requires an array';

    expect(() => formatListAsProse(0)).toThrowError(expectedError);
    expect(() => formatListAsProse(1)).toThrowError(expectedError);
    expect(() => formatListAsProse({})).toThrowError(expectedError);
    expect(() => formatListAsProse(() => {})).toThrowError(expectedError);
    expect(() => formatListAsProse((a, b) => b)).toThrowError(expectedError);
    expect(() => formatListAsProse(/foo/)).toThrowError(expectedError);
    expect(() => formatListAsProse(null)).toThrowError(expectedError);
    expect(() => formatListAsProse(undefined)).toThrowError(expectedError);
    expect(() => formatListAsProse(false)).toThrowError(expectedError);
    expect(() => formatListAsProse(true)).toThrowError(expectedError);
  });

  describe('defaults', () => {
    it('joins items together with "and" and commas', () => {
      expect(formatListAsProse([1, 2])).toEqual('1 and 2');
      expect(formatListAsProse([1, 2, 3])).toEqual('1, 2, and 3');
      expect(formatListAsProse([4, 3, 2, 1])).toEqual('4, 3, 2, and 1');
    });
  });

  describe('inclusive=true', () => {
    it('joins items together with "and" and commas', () => {
      expect(formatListAsProse([1, 2], { inclusive: true })).toEqual('1 and 2');
      expect(formatListAsProse([1, 2, 3], { inclusive: true })).toEqual('1, 2, and 3');
      expect(formatListAsProse([4, 3, 2, 1], { inclusive: true })).toEqual('4, 3, 2, and 1');
    });
  });

  describe('inclusive=false', () => {
    it('joins items together with "or" and commas', () => {
      expect(formatListAsProse([1, 2], { inclusive: false })).toEqual('1 or 2');
      expect(formatListAsProse([1, 2, 3], { inclusive: false })).toEqual('1, 2, or 3');
      expect(formatListAsProse([4, 3, 2, 1], { inclusive: false })).toEqual('4, 3, 2, or 1');
    });
  });
});
