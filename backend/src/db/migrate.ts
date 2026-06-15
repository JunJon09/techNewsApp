import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://technews:technews@localhost:5432/technews'

const migrationClient = postgres(connectionString, { max: 1 })

await migrate(drizzle(migrationClient), {
  migrationsFolder: './src/db/migrations',
})

console.log('マイグレーション完了')
await migrationClient.end()
