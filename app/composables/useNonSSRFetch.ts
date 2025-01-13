import type { WatchSource } from 'vue'

type UseNonSSRFetchOptions<T> = {
  query?: Record<string, unknown>
  body?: Record<string, unknown> | BodyInit | null
  headers?: Record<string, string>
  method?: string
  transform?: (input: unknown) => T
  default?: () => T
  immediate?: boolean
  watch?: WatchSource<unknown> | WatchSource<unknown>[]
}

export function useNonSSRFetch<T = unknown>(
  input: string | Ref<string> | (() => string),
  options: UseNonSSRFetchOptions<T> = {}
) {
  const url = computed(() => {
    const val = typeof input === 'function' ? input() : unref(input)
    return val
  })

  const data = ref<T | null>(options.default?.() || null)
  const error = ref<Error | null>(null)
  const isFetching = ref(false)

  async function execute() {
    isFetching.value = true
    error.value = null
    try {
      const result = await $fetch(url.value, {
        // @ts-expect-error method has to be a string
        method: options.method || 'GET',
        headers: options.headers,
        query: options.query,
        body: options.body,
      })
      data.value = options.transform?.(result) ?? result
      // biome-ignore lint/suspicious/noExplicitAny:
    } catch (err: any) {
      error.value = err
    } finally {
      isFetching.value = false
    }
  }

  if (options.immediate !== false) {
    // Run on client next tick to avoid hydration warnings
    // Only do this if you must ensure no SSR interference.
    // Typically, calling this in onMounted is safe as well.
    if (typeof window !== 'undefined') {
      queueMicrotask(execute)
    }
  }

  if (options.watch) {
    const watchSources = Array.isArray(options.watch) ? options.watch : [options.watch]
    watch(watchSources, execute)
  }

  return {
    data,
    error,
    isFetching,
    execute,
    refresh: execute,
  }
}
