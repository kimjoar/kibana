import readPkg from 'read-pkg';
import path from 'path';

export function readPackageJson(dir, depName = '') {
  return readPkg(path.join(dir, depName, 'package.json'), { normalize: false });
}
