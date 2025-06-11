import { Prisma, PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export type PrismaTransaction = Prisma.TransactionClient;
export type PrismaClientType = typeof prisma;

export type PrismaModelName = keyof PrismaClientType;
export type PrismaModel = PrismaClientType[PrismaModelName];

export default prisma;
