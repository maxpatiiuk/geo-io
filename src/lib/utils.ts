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
