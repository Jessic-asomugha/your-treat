import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: './prisma/schema.prisma',
  },
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import('@prisma/adapter-neon')
      return new PrismaNeon({ connectionString: process.env.DATABASE_URL })
    }
  }
})