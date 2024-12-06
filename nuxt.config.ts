import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'
import { localPath } from './utils/index.server'
import type { RuntimeConfig } from 'nuxt/schema'
import { flatten } from 'flat'

type ConfigurableValue<T> = T extends Record<string, unknown> ? Configurable<T> : T;
type Configurable<T> = {
  [K in keyof T]: ConfigurableValue<T[K]> | [ConfigurableValue<T[K]>, 'client' | 'server' | 'both']
}

const layerOptions = createLayerConfig({
  auth: {
    enabled: true,
    jwtSecret: 'local_value_should_be_overridden_with_env_var',
    jwtExpiresIn: [60 * 60 * 24, 'both'], // 1d
    unprotectedRoutes: ['signin', 'signup'],
    signupKind: 'base',
    fallbackRoute: ['/signin', 'both'],
  },
})

export default defineNuxtConfig({
  build: {
    transpile: [
      '@juggle/resize-observer',
      ...(process.env.NODE_ENV === 'production'
        ? ['naive-ui', 'vueuc', '@css-render/vue3-ssr', '@hapi', '@sideway']
        : []),
    ],
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nuxtjs-naive-ui', 'unplugin-icons/nuxt'],
  vite: {
    optimizeDeps: {
      include:
        process.env.NODE_ENV === 'development'
          ? [localPath('./node_modules/naive-ui'), localPath('./node_modules/vueuc')]
          : [],
    },
    ssr: {
      noExternal: ['naive-ui'],
    },
    plugins: [
      AutoImport({
        imports: [{
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
        }],
      }),
      Components({
        resolvers: [NaiveUiResolver(), IconsResolver()],
      }),
      Icons({ autoInstall: true }),
    ],
  },
  nitro: {
    experimental: {
      asyncContext: true,
    }
  },
  tailwindcss: {
    cssPath: ['./assets/tailwind.css', { injectPosition: 'first' }],
    exposeConfig: {
      level: 4,
      alias: '#tw',
    },
  },
  runtimeConfig: {
    ...layerOptions.baseLayer,
    public: {
      joiSetup: { locales: 'enEn' },
      ...layerOptions.publicLayer
    },
  },
})

function createLayerConfig(options: Configurable<RuntimeConfig['baseLayer']>): { baseLayer: RuntimeConfig['baseLayer'], publicLayer: Partial<RuntimeConfig['baseLayer']> } {
  const baseLayer = {}
  const publicLayer = {}
  const flattened = flatten(options, { safe: true }) as Record<string, unknown>

  const asigner = (key: string, value: unknown, level: 'local' | 'server' | 'both' = 'server') => {
    switch (level) {
      case 'local': {
        unflattenTo({ [key]: value }, publicLayer)
        break
      }
      case 'server': {
        unflattenTo({ [key]: value }, baseLayer)
        break
      }
      case 'both': {
        unflattenTo({ [key]: value }, baseLayer)
        unflattenTo({ [key]: value }, publicLayer)
        break
      }
    }
  }

  for (const [key, value] of Object.entries(flattened)) {
    Array.isArray(value) ? asigner(key, value[0], value[1]) : asigner(key, value)
  }

  // @ts-expect-error object will be assigned dynamically
  return { baseLayer, publicLayer }
}

function unflattenTo(flatObj: Record<string, unknown>, target: { [key: string]: unknown } = {}): { [key: string]: unknown } {
  for (const flatKey in flatObj) {
    const value = flatObj[flatKey]
    const path = flatKey.split('.')
    let current = target

    for (let i = 0; i < path.length; i++) {
      const segment = path[i]
      if (i === path.length - 1) {
        // @ts-ignore
        current[segment] = value
      } else {
        // @ts-ignore
        if (current[segment] === undefined || typeof current[segment] !== 'object') {
          // @ts-ignore
          current[segment] = {}
        }
        // @ts-ignore
        current = current[segment]
      }
    }
  }

  return target;
}
