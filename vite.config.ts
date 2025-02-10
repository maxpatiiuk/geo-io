import { defineConfig, type Plugin } from 'vite';
import type { ResolveIdResult } from 'rollup';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFile } from 'node:fs/promises';

export default defineConfig({
  base: '/geo-io',
  plugins: [react(), tailwindcss(), useArcgisCoreCdnInProduction()],
  server: {
    open: true,
  },
});

/**
 * Optional optimization - makes build time much faster at a cost of some
 * app startup performance.
 */
function useArcgisCoreCdnInProduction(): Plugin {
  let arcgisCoreVersion = '';
  return {
    name: 'use-arcgis-core-cdn-in-production',
    apply: 'build',
    async configResolved(): Promise<void> {
      const packageJson = await readFile(
        'node_modules/@arcgis/core/package.json',
        'utf-8',
      );
      const { version } = JSON.parse(packageJson) as { version: string };
      arcgisCoreVersion = version.split('.').slice(0, 2).join('.');
    },
    // Resolve id before Vite does so
    enforce: 'pre',
    resolveId(specifier): ResolveIdResult | undefined {
      if (specifier.startsWith('@arcgis/core/')) {
        return {
          external: true,
          id: `https://js.arcgis.com/${arcgisCoreVersion}/${specifier}`,
        };
      }
      return;
    },
  };
}
