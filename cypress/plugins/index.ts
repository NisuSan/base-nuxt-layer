import { unlinkSync, existsSync } from 'node:fs'

export function deleteFile(path: string) {
  console.log('file exists:', existsSync(path));

  try { unlinkSync(path) }
  catch (e) {
    console.error(e)
    throw e
  }
  return true
}
