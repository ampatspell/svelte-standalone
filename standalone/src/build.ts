import { build, defineConfig, loadConfigFromFile, type PluginOption } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import resolve from '@rollup/plugin-node-resolve';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import strip from '@rollup/plugin-strip';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const prod = false;
const mode: string | undefined = undefined;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const pathFor = (name: string) => path.join(root, '/', name);

const parseAlias = (alias: Record<string, string> | undefined) => {
  if (!alias) return undefined;
  return Object.fromEntries(
    Object.entries(alias).map(([key, value]) => {
      const newKey = key.replace('/*', ''); // Remove '/*' from the key
      const newValue = path.resolve(root, value.replace('/*', '')); // Resolve the path
      return [newKey, newValue];
    }),
  );
};

const getProd = (prod: boolean) =>
  prod
    ? [
        strip({
          functions: ['console.log', 'console.warn', 'console.error', 'assert.*'],
        }),
        terser({
          compress: {
            drop_console: true,
            unused: true,
            reduce_vars: true,
            pure_funcs: ['console.debug', 'debug'],
          },
          output: {
            comments: false,
          },
        }),
      ]
    : [];

const plugins = () =>
  [
    svelte({
      configFile: pathFor('svelte.config.js'),
    }),
    // visualizer({
    //   template: 'sunburst',
    //   filename: pathFor('standalone/dist/entrypoint-status.html'),
    //   title: `entrypoint status`,
    // }),
    libInjectCss(),
  ] as PluginOption[];

const svelteAliases = async () => {
  const href = pathToFileURL(pathFor('svelte.config.js')).href;
  const imported = (await import(href)) as {
    default: { kit: { alias: Record<string, string> } };
  };
  return imported.default?.kit?.alias;
};

const run = async () => {
  process.chdir(root);
  const config = await loadConfigFromFile(
    { command: 'build', mode: mode ?? 'production' },
    pathFor('vite.config'),
    '.',
  )!;
  const viteConfig = config?.config;

  const componentName = 'entrypoint';

  const defined = defineConfig({
    plugins: plugins(),
    build: {
      minify: true,
      emptyOutDir: false,
      lib: {
        formats: ['umd'],
        entry: 'src/lib/index.ts',
        name: componentName,
        fileName: componentName,
      },
      outDir: path.resolve(root, 'standalone/dist'),
      rollupOptions: {
        output: {
          chunkFileNames: 'chunks/[name].[hash].js',
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: `${componentName}.min.js`,
        },
        plugins: [resolve({ browser: true, dedupe: ['svelte'] }), ...getProd(prod)],
      },
    },
    resolve: {
      alias: {
        ...parseAlias(await svelteAliases()),
        ...parseAlias(viteConfig?.resolve?.alias as Record<string, string>),
      },
    },
    mode: viteConfig?.mode,
    envPrefix: viteConfig?.envPrefix,
    define: viteConfig?.define,
    envDir: viteConfig?.envDir,
  });

  await build({ ...defined, configFile: false, mode });
};

run().catch((err) => console.error(err));
