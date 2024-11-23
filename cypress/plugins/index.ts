import { unlinkSync, existsSync } from 'node:fs'

export function deleteFile(path: string) {
  try { unlinkSync(path) }
  catch (e) {
    console.error(e)
    throw e
  }
  return true
}
