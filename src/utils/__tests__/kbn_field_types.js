import Chance from 'chance';

const chance = new Chance();
import {
  KbnFieldType,
  getKbnFieldType,
  castEsToKbnFieldTypeName,
  getKbnTypeNames
} from '../kbn_field_types';

describe('utils/kbn_field_types', () => {
  describe('KbnFieldType', () => {
    it('defaults', () => {
      expect(new KbnFieldType())
        .toEqual(expect.objectContaining({
          name: undefined,
          sortable: false,
          filterable: false,
          esTypes: []
        }));
    });

    it('assigns name, sortable, filterable, and esTypes options to itself', () => {
      const name = chance.word();
      const sortable = chance.bool();
      const filterable = chance.bool();
      const esTypes = chance.n(chance.word, 3);

      expect(new KbnFieldType({ name, sortable, filterable, esTypes }))
        .toEqual(expect.objectContaining({
          name,
          sortable,
          filterable,
          esTypes
        }));
    });

    it('prevents modification', () => {
      const type = new KbnFieldType();
      expect(() => type.name = null).toThrow();
      expect(() => type.sortable = null).toThrow();
      expect(() => type.filterable = null).toThrow();
      expect(() => type.esTypes = null).toThrow();
      expect(() => type.esTypes.push(null)).toThrow();
    });

    it('allows extension', () => {
      const type = new KbnFieldType();
      type.$hashKey = '123';
      expect(type).toHaveProperty('$hashKey', '123');
    });
  });

  describe('getKbnFieldType()', () => {
    it('returns a KbnFieldType instance by name', () => {
      expect(getKbnFieldType('string')).toBeInstanceOf(KbnFieldType);
    });

    it('returns undefined for invalid name', () => {
      expect(getKbnFieldType(chance.sentence())).toBe(undefined);
    });
  });

  describe('castEsToKbnFieldTypeName()', () => {
    it('returns the kbnFieldType name that matches the esType', () => {
      expect(castEsToKbnFieldTypeName('keyword')).toBe('string');
      expect(castEsToKbnFieldTypeName('float')).toBe('number');
    });

    it('returns unknown for unknown es types', () => {
      expect(castEsToKbnFieldTypeName(chance.sentence())).toBe('unknown');
    });
  });

  describe('getKbnTypeNames()', () => {
    it('returns a list of all kbnFieldType names', () => {
      expect(getKbnTypeNames().sort()).toEqual([
        '_source',
        'attachment',
        'boolean',
        'conflict',
        'date',
        'geo_point',
        'geo_shape',
        'ip',
        'murmur3',
        'number',
        'string',
        'unknown',
      ]);
    });
  });
});
