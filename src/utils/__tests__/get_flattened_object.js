import { getFlattenedObject } from '../get_flattened_object';

describe('getFlattenedObject()', () => {
  it('throws when rootValue is not an object or is an array', () => {
    expect(() => getFlattenedObject(1)).toThrowError('received 1');
    expect(() => getFlattenedObject(Infinity)).toThrowError('received Infinity');
    expect(() => getFlattenedObject(NaN)).toThrowError('received NaN');
    expect(() => getFlattenedObject(false)).toThrowError('received false');
    expect(() => getFlattenedObject(null)).toThrowError('received null');
    expect(() => getFlattenedObject(undefined)).toThrowError('received undefined');
    expect(() => getFlattenedObject([])).toThrowError('received');
  });

  it('flattens objects', () => {
    expect(getFlattenedObject({ a: 'b' })).toEqual({ a: 'b' });
    expect(getFlattenedObject({ a: { b: 'c' } })).toEqual({ 'a.b': 'c' });
    expect(getFlattenedObject({ a: { b: 'c' }, d: { e: 'f' } })).toEqual({ 'a.b': 'c', 'd.e': 'f' });
  });

  it('does not flatten arrays', () => {
    expect(getFlattenedObject({ a: ['b'] })).toEqual({ a: ['b'] });
    expect(getFlattenedObject({ a: { b: ['c', 'd'] } })).toEqual({ 'a.b': ['c', 'd'] });
  });
});
