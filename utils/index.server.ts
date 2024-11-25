import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export function localPath(path: string) {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  return join(currentDir, path)
}
