import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from '@prisma/client'

const { PrismaClient } = pkg
const { Pool } = pg

const globalForPrisma = globalThis

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')
  const pool    = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma