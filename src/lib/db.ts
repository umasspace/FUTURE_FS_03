import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Auto-sync schema on first request in production (Vercel /tmp is ephemeral)
if (process.env.NODE_ENV === 'production') {
  db.$executeRaw`SELECT 1`.catch(async () => {
    try {
      const { execSync } = await import('child_process')
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    } catch (err) {
      console.error('Failed to auto-push Prisma schema:', err)
    }
  })
}
