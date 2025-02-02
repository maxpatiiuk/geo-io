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
