// Prisma 连接初始化和健康检查工具

import prisma from '@/app/api/_utils/prisma';

/**
 * 数据库连接健康检查
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('数据库连接检查失败:', error);
    return false;
  }
}

/**
 * 确保数据库连接是活跃的
 */
export async function ensureDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('数据库连接失败:', error);
    // 重新连接
    await prisma.$disconnect();
    await prisma.$connect();
  }
}

/**
 * 优雅关闭数据库连接
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('关闭数据库连接时出错:', error);
  }
}

/**
 * 在应用启动时初始化数据库连接
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await ensureDatabaseConnection();
    const isHealthy = await checkDatabaseConnection();
    
    if (isHealthy) {
      console.log('数据库连接初始化成功');
    } else {
      console.warn('数据库连接初始化失败，但将在需要时重试');
    }
  } catch (error) {
    console.error('数据库初始化过程中出错:', error);
  }
}
