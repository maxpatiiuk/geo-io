import type { RA } from './types';

export const expose =
  import.meta.env.MODE !== 'development'
    ? (value: Readonly<Record<string, unknown>>): void => {
        const global = globalThis as GlobalThisWithDevOnly;
        global._ ??= {};
        Object.entries(value).forEach(([key, value]) => {
          global._![key] = value;
        });
      }
    : undefined;

type GlobalThisWithDevOnly = typeof globalThis & {
  _?: Record<string, unknown>;
};

export const GET = 0;
export const SET = 1;

export function listen<EventName extends keyof GlobalEventHandlersEventMap>(
  element: EventTarget,
  eventName: EventName,
  callback: (event: GlobalEventHandlersEventMap[EventName]) => void,
  catchAll: AddEventListenerOptions | boolean = false,
): () => void {
  element.addEventListener(
    eventName,
    callback as (event: Event) => void,
    catchAll,
  );
  return (): void =>
    element.removeEventListener(
      eventName,
      callback as (event: Event) => void,
      catchAll,
    );
}

export const isDebug = (): boolean =>
  new URL(document.location.href).searchParams.get('debug') !== null;

/**
 * Based on https://underscorejs.org/docs/modules/throttle.html
 *
 * It was then modified to modernize and simplify the code, as well as, to
 * add the types
 */
export function throttle<ARGUMENTS extends RA<unknown>>(
  callback: (...rest: ARGUMENTS) => void,
  wait: number,
): (...rest: ARGUMENTS) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let previousArguments: ARGUMENTS | undefined;
  let previousTimestamp = 0;

  function later(): void {
    previousTimestamp = Date.now();
    timeout = undefined;
    callback(...previousArguments!);
  }

  return (...rest: ARGUMENTS): void => {
    const now = Date.now();
    const remaining = wait - (now - previousTimestamp);
    previousArguments = rest;
    if (remaining <= 0 || remaining > wait) {
      if (timeout !== undefined) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      previousTimestamp = now;
      callback(...previousArguments);
    } else if (timeout === undefined) {
      timeout = setTimeout(later, remaining);
    }
  };
}
