import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://technews:technews@localhost:5433/technews',
      REDIS_URL: 'redis://localhost:6379',
      PORT: '8080',
    },
  },
})
