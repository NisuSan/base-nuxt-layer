import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { useNuxt } from 'nuxt/kit'

type ConfigurableValue<T> = T extends Record<string, unknown> ? Configurable<T> : T
type Configurable<T> = {
  [K in keyof T]: ConfigurableValue<T[K]> | [ConfigurableValue<T[K]>, 'client' | 'server' | 'both']
}

export function localPath(path: string) {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  return join(currentDir, path)
}

export function rootPath(folder?: string) {
  return join(useNuxt().options.rootDir, `/${(folder || '').replace(/^\//, '')}`)
}
