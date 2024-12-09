import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { RuntimeConfig } from 'nuxt/schema'

type ConfigurableValue<T> = T extends Record<string, unknown> ? Configurable<T> : T;
type Configurable<T> = {
  [K in keyof T]: ConfigurableValue<T[K]> | [ConfigurableValue<T[K]>, 'client' | 'server' | 'both']
}

export function localPath(path: string) {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  return join(currentDir, path)
}

/**
 * Create a base layer configuration for nuxt.
 *
 * Takes an object with a special structure. When a value is an array, it is
 * interpreted as a tuple of [value, level] where level can be 'client', 'server',
 * or 'both'. 'client' adds the value to the public layer, 'server' adds the value
 * to the base layer, and 'both' adds the value to both layers.
 *
 * When a value is an object, it is recursively traversed and the values are
 * assigned to the corresponding path in the base layer.
 *
 * @param options - The configuration object.
 * @returns An object with two properties, `baseLayer` and `publicLayer` which
 * contain the respective layers.
 */
export function createLayerConfig(
  options: Configurable<RuntimeConfig['baseLayer']>
): { baseLayer: RuntimeConfig['baseLayer']; publicLayer: Partial<RuntimeConfig['baseLayer']> } {
  const baseLayer = {} as RuntimeConfig['baseLayer']
  const publicLayer = {} as Partial<RuntimeConfig['baseLayer']>

  function assignValue(target: Record<string, unknown>, path: string[], value: unknown) {
    let current = target
    const lastIndex = path.length - 1
    if (lastIndex < 0) throw new Error('Invalid path')

    for (let i = 0; i < lastIndex; i++) {
      const segment = path[i]
      if(segment === '' || segment === undefined) continue

      let next = current[segment]
      if (typeof next !== 'object' || next === null) {
        next = {}
        current[segment] = next
      }
      current = next as Record<string, unknown>
    }
    // @ts-expect-error we have the check above
    current[path[lastIndex]] = value
  }

  type StackEntry = { obj: Record<string, unknown>, path: string[] }
  const stack: StackEntry[] = [{ obj: options as Record<string, unknown>, path: [] }]

  while (stack.length > 0) {
    const { obj, path } = stack.pop() as StackEntry

    for (const key in obj) {
      const val = obj[key]
      const newPath = [...path, key]

      if (Array.isArray(val) && val.length === 2 && ['client', 'server', 'both'].includes(val[1])) {
        const [actualValue, level] = val as [unknown, 'client' | 'server' | 'both']

        switch (level) {
          case 'client':
            assignValue(publicLayer, newPath, actualValue)
            break
          case 'server':
            assignValue(baseLayer, newPath, actualValue)
            break
          case 'both':
            assignValue(baseLayer, newPath, actualValue)
            assignValue(publicLayer, newPath, actualValue)
            break
        }
      } else if (val && typeof val === 'object' && !(val instanceof Date) && !Array.isArray(val)) {
        stack.push({ obj: val as Record<string, unknown>, path: newPath })
      } else {
        assignValue(baseLayer, newPath, val)
      }
    }
  }

  return { baseLayer, publicLayer }
}
