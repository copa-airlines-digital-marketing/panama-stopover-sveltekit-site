import { PrismaClient } from '@prisma/client';

const g = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Prisma client instance with singleton pattern for development
 * In production, creates a new instance each time
 */
export const prisma = g.prisma ?? new PrismaClient({ log: ['warn', 'error'] });

if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
