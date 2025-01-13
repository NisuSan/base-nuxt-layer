import type { ClientFile } from 'nuxt-file-storage'

export default defineEventHandler<_, ClientFile[]>(async event => {
  const files = await useUploadedFiles()
  console.log(files);
  return 1111
})
