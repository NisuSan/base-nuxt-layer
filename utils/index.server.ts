import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

export function localPath(path: string) {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  return join(currentDir, path)
}
