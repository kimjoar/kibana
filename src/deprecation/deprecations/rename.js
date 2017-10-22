import { get, noop, set } from 'lodash';
import { unset } from '../../utils';

export function rename(oldKey, newKey) {
  return (settings, log = noop) => {
    const value = get(settings, oldKey);
    if (value === undefined) {
      return;
    }

    unset(settings, oldKey);
    set(settings, newKey, value);

    log(`Config key "${oldKey}" is deprecated. It has been replaced with "${newKey}"`);
  };
}
