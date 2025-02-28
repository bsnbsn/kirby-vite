import type { Plugin, ViteDevServer } from 'vite'
import { relative, resolve, sep } from 'node:path'
import { writeFile, readFile, unlink, access } from 'node:fs/promises'
import { liveReload } from 'vite-plugin-live-reload'

export interface Config {
  /**
   * Wether templates, snippets, controllers, models and content changes should
   * be watched and cause a reload. Either enable/disable it or provide your own
   * paths to watch.
   * @see https://github.com/arnoson/vite-plugin-live-reload
   * @default true
   */
  watch?: boolean | string[]

  /**
   * The directory the `.dev` file is placed.
   * @default process.cwd()
   */
  devDir?: string

  /**
   * Kirby's config root.
   * @default 'site/config'
   */
  kirbyConfigDir?: string
}

const phpConfigTemplate = (config: Record<string, any>) => `<?php
// This is an auto-generated file. Please avoid making changes here.
// Configure your settings in the "vite.config.js" file instead.
return [
${Object.entries(config)
  .map(([key, value]) => {
    if (typeof value === 'string') value = `'${value}'`
    return `  '${key}' => ${value}`
  })
  .join(',\n')}
];`

let exitHandlersBound = false

export default (
  {
    watch = true,
    devDir = process.cwd(),
    kirbyConfigDir = 'site/config',
  } = {} as Config
): Plugin => {
  const devPath = resolve(devDir, '.dev')

  return {
    name: 'vite-plugin-kirby',

    config() {
      return { build: { manifest: true } }
    },

    async configResolved({ build, plugins, root }) {
      // Share some essential Vite config with Kirby.
      let { outDir, assetsDir } = build

      // PHP needs the `outDir` relative to the project's root (cwd).
      outDir = relative(process.cwd(), resolve(root, outDir))
      outDir = outDir.replace(/\//g, sep)

      const file = `${kirbyConfigDir}/vite.config.php`
      const legacy = !!plugins.find((v) => v.name === 'vite:legacy-config')
      const config = phpConfigTemplate({ outDir, assetsDir, legacy })

      // Only write the config file if it does't exist or has older content.
      try {
        await access(file)
        const oldConfig = await readFile(file, 'utf-8')
        if (config !== oldConfig) await writeFile(file, config)
      } catch (err) {
        await writeFile(file, config)
      }
    },

    configureServer(server: ViteDevServer) {
      const { config } = server

      server.httpServer?.once('listening', () => {
        if (!config.server.origin) {
          const { https, port, host = 'localhost' } = config.server
          const resolvedHost = host === true ? '0.0.0.0' : host
          const protocol = https ? 'https' : 'http'
          config.server.origin = `${protocol}://${resolvedHost}:${port}`
        }

        writeFile(devPath, `VITE_SERVER=${config.server.origin}`)
      })

      if (!exitHandlersBound) {
        const clean = () => {
          unlink(devPath).catch((_e: Error) => {})
        }

        process.on('exit', clean)
        process.on('SIGINT', process.exit)
        process.on('SIGTERM', process.exit)
        process.on('SIGHUP', process.exit)

        exitHandlersBound = true
      }

      if (watch) {
        const defaultPaths = [
          '../site/(templates|snippets|controllers|models|layouts)/**/*.php',
          '../content/**/*',
        ]
        const paths = watch === true ? defaultPaths : watch
        // @ts-ignore
        liveReload(paths).configureServer(server)
      }
    },

    buildStart() {},
  }
}
