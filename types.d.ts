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
    type User = {
      id: number,
      firstName: string,
      lastName: string,
      middleName: string,
      mail?: string,
      phone?: string,
      roleId: number,
      privileges: number[]
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
