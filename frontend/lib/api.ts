import { hc } from 'hono/client'
import type { AppType } from '../../backend/src/index'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080'

export const apiClient = hc<AppType>(BACKEND_URL)
