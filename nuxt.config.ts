import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'
import { localPath } from './utils'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  build: {
    transpile: [
      '@juggle/resize-observer',
      ...(process.env.NODE_ENV === 'production'
        ? ['naive-ui', 'vueuc', '@css-render/vue3-ssr', '@hapi', '@sideway']
        : []),
    ],
  },
  css: ['./app/assets/tailwind.css'],
  devtools: { enabled: true },
  modules: ['nuxtjs-naive-ui', 'unplugin-icons/nuxt', '@nuxtjs/google-fonts'],
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
        imports: [
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver(), IconsResolver()],
      }),
      Icons({ autoInstall: true }),
      tailwindcss(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/theme/theme.utils.scss" as *;',
        },
      },
    },
  },
  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
  runtimeConfig: {
    baseLayer: {
      auth: {
        jwtSecret: 'local_value_should_be_overridden_with_env_var_1',
        signupKind: 'base',
        sesionPrivateKey: 'local_value_should_be_overridden_with_env_var_2',
      },
    },
    public: {
      baseLayer: {
        joiSetup: { locales: 'enEn' },
        auth: {
          enabled: false,
          jwtExpiresIn: 60 * 60 * 24, // 1d
          unprotectedRoutes: ['auth'],
          fallbackRoute: '/auth',
        },
      },
    },
  },
  googleFonts: {
    families: {
      Inter: [400, 500, 600],
      'JetBrains Mono': [400, 500, 600],
    },
  },
})
