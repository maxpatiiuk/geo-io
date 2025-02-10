import React from 'react';

import type { GetSet } from '../lib/types';
import type { Mode } from '../components/UserInterface/Components';

const prefix = 'geo-io-';

/**
 * Like React.useState, but initial value is read from localStorage
 * and all changes are written back to localStorage
 *
 * @remarks
 * Useful for remembering user preference or caching async operations
 */
function useGenericCache<T>(name: string, defaultValue: T): GetSet<T> {
  const [state, setState] = React.useState<T>(() => {
    const cached = localStorage.getItem(`${prefix}${name}`);
    return cached === null ? defaultValue : JSON.parse(cached);
  });

  const setCachedState = React.useCallback(
    (newValue: T) => {
      localStorage.setItem(`${prefix}${name}`, JSON.stringify(newValue));
      setState(newValue);
    },
    [name],
  );

  React.useEffect(() => {
    globalThis.addEventListener('storage', ({ storageArea, key, newValue }) => {
      // "key" is null only when running `localStorage.clear()`
      if (
        storageArea !== globalThis.localStorage ||
        key === null ||
        !key.startsWith(prefix) ||
        newValue === null
      ) {
        return;
      }
      const activeName = key.slice(prefix.length);
      if (activeName !== name) {
        return;
      }

      const currentValue = JSON.stringify(state);
      if (currentValue === newValue) {
        return;
      }

      /*
       * Safe to assume only JSON values would be in localStorage, as that's
       * what genericSet() does
       */
      setState(JSON.parse(newValue) as T);
    });
  }, []);

  return [state, setCachedState];
}

export const useHighScore = (mode: Mode): GetSet<number> =>
  useGenericCache(`highScore-${mode}`, 0);
