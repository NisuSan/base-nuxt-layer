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
    type ValidationDirective = Reactive<{ errors: { el: HTMLElement; message: string }[], state: string }>
    type SignIn = { login: string, password: string }
    type SignUp = { repeatedPaaword: string } & SignIn & Omit<User, 'id'>
    type User = {
      id: number,
      roleId: number,
      privileges: number[],
      profile: {
        firstName: string,
        lastName: string,
        middleName: string,
      }[]
    }
  }
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    jwtSecret: string
  }
  interface PublicRuntimeConfig {
    joiSetup: Layer.JoiSetup
  }
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    vValidation: Layer.ValidationDirective
  }
}
