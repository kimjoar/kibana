import { modifyUrl } from '../modify_url';

describe('modifyUrl()', () => {
  it('throws an error with invalid input', () => {
    expect(() => modifyUrl(1, () => {})).toThrow();
    expect(() => modifyUrl(undefined, () => {})).toThrow();
    expect(() => modifyUrl('http://localhost')).toThrow();
  });

  it('supports returning a new url spec', () => {
    expect(modifyUrl('http://localhost', () => ({}))).toEqual('');
  });

  it('supports modifying the passed object', () => {
    expect(modifyUrl('http://localhost', parsed => {
      parsed.port = 9999;
      parsed.auth = 'foo:bar';
    })).toEqual('http://foo:bar@localhost:9999/');
  });

  it('supports changing pathname', () => {
    expect(modifyUrl('http://localhost/some/path', parsed => {
      parsed.pathname += '/subpath';
    })).toEqual('http://localhost/some/path/subpath');
  });

  it('supports changing port', () => {
    expect(modifyUrl('http://localhost:5601', parsed => {
      parsed.port = (parsed.port * 1) + 1;
    })).toEqual('http://localhost:5602/');
  });

  it('supports changing protocol', () => {
    expect(modifyUrl('http://localhost', parsed => {
      parsed.protocol = 'mail';
      parsed.slashes = false;
      parsed.pathname = null;
    })).toEqual('mail:localhost');
  });
});
