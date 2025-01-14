import type { ClientFile } from 'nuxt-file-storage'

export default defineEventHandler<_, ClientFile[]>(async event => {
  const files = await useUploadedFiles()
  return !!files?.length
})
