import {type Reactive} from 'vue'

declare global {
  namespace Layer {
    type InputValidators = 'string' | 'string-cyrillic' | 'string-latin' | 'number' | 'number-positive'
    type JoiLocales = 'ukUA' | 'enEn' | 'custom'
    type JoiMessages = { base: Record<string, string>, validators: Record<Partial<InputValidators>, Record<string, string>> }
    type JoiSetup = { locales: JoiLocales, messages: JoiMessages }
    type ValidationDirective = Reactive<{ errors: { el: HTMLElement, message: string }[], state: string }>
  }
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {

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

export {}
