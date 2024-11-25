import { defineConfig } from 'cypress'
import { deleteFile } from './cypress/plugins'

export default defineConfig({
  e2e: {
    env: {
      NODE_ENV: 'development',
    },
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        deleteFile,
      })
    },
  },
})
