import type { Reactive } from 'vue'

declare global {
  namespace Layer {
    type InputValidators = 'string' | 'string-cyrillic' | 'string-latin' | 'number' | 'number-positive'
    type InputStatus = 'success' | 'warning' | 'error'
    type JoiLocales = 'ukUA' | 'enEn' | 'custom'
    type JoiMessages = {
      base: Record<string, string>
      validators: Record<Partial<InputValidators>, Record<string, string>>
    }
    type JoiSetup = { locales: JoiLocales; messages: JoiMessages }
    type ValidationDirective = Reactive<{ errors: { el: HTMLElement; message: string }[]; state: string }>
    type SignIn = { login: string; password: string }
    type SignUp = Optionate<
      { repeatedPasword: string; mail: string } & SignIn & Omit<User, 'id'>,
      'login' | 'password' | 'repeatedPasword'
    >
    type User = {
      id: number
      roleId: number
      privileges: number[]
      profile: {
        firstName: string
        lastName: string
        middleName: string
      }[]
    }
    type SessionData = { user: User }
  }

  type _ = unknown
  type Optionate<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    baseLayer: {
      auth: {
        enabled: boolean
        jwtSecret: string
        jwtExpiresIn: number
        unprotectedRoutes: string[]
        signupKind: 'base' | 'extended'
        fallbackRoute: string
        sesionPrivateKey: string
      }
    }
  }
  interface PublicRuntimeConfig {
    baseLayer: {
      joiSetup: Layer.JoiSetup
      auth: {
        enabled: boolean,
        jwtExpiresIn: number
        fallbackRoute: string
        unprotectedRoutes: string[]
      }
    }
  }
}
