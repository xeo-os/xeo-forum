import prisma from '@/app/api/_utils/prisma';
import { Prisma } from '@/generated/prisma';

// 连接状态管理
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30秒

/**
 * 检查并确保数据库连接是活跃的
 */
async function ensureConnection(): Promise<void> {
  const now = Date.now();
  
  // 如果最近检查过连接，跳过
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return;
  }

  try {
    // 简单的连接测试
    await prisma.$queryRaw`SELECT 1`;
    lastConnectionCheck = now;
  } catch (error) {
    console.warn('数据库连接检查失败，尝试重新连接...', error);
    
    try {
      // 尝试断开并重新连接
      await prisma.$disconnect();
      await prisma.$connect();
      lastConnectionCheck = now;
    } catch (reconnectError) {
      console.error('数据库重连失败:', reconnectError);
      // 不阻止操作继续，让重试机制处理
    }
  }
}

/**
 * 执行数据库操作的重试机制
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 在执行操作前确保连接是活跃的
      if (attempt === 0) {
        await ensureConnection();
      }
      
      return await operation();
    } catch (error: unknown) {
      lastError = error as Error;

      // 如果是事务错误 P2028，立即重试
      if ((error as { code?: string })?.code === 'P2028' && attempt < maxRetries) {
        console.warn(`数据库事务错误，正在重试 (${attempt + 1}/${maxRetries + 1})`);
        
        // 事务错误时，重新检查连接
        await ensureConnection();
        
        // 等待一段时间后重试
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        }
        continue;
      }

      // 如果是连接错误，也尝试重试
      if (((error as { code?: string })?.code === 'P1001' || (error as { code?: string })?.code === 'P1017') && attempt < maxRetries) {
        console.warn(`数据库连接错误，正在重试 (${attempt + 1}/${maxRetries + 1})`);
        
        // 连接错误时，强制重新连接
        await ensureConnection();
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        }
        continue;
      }

      // 对于其他错误，如果还有重试次数，继续重试
      if (attempt < maxRetries) {
        console.warn(`数据库操作失败，正在重试 (${attempt + 1}/${maxRetries + 1}):`, (error as Error).message);
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        }
        continue;
      }

      // 达到最大重试次数，抛出错误
      break;
    }
  }

  throw lastError || new Error('未知的数据库错误');
}

/**
 * 安全的事务执行，带有重试机制
 */
export async function safeTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
    maxRetries?: number;
  }
): Promise<T> {
  const { maxRetries = 2, ...transactionOptions } = options || {};

  return withRetry(async () => {
    return prisma.$transaction(callback, {
      maxWait: 5000, // 5秒等待
      timeout: 10000, // 10秒超时
      ...transactionOptions,
    });
  }, maxRetries);
}

/**
 * 安全的查询执行，带有重试机制
 */
export async function safeQuery<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  return withRetry(operation, maxRetries);
}
