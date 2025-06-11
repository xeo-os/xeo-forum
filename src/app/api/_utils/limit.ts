import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string);

interface RequestObject {
    headers: {
        get: (key: string) => string | null;
    };
    ip?: string;
    connection?: {
        remoteAddress?: string;
    };
}

async function checkLimitControl(request: RequestObject): Promise<boolean> {
    const ip =
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-vercel-proxied-for') ||
        request.ip ||
        (request.connection && request.connection.remoteAddress) ||
        '';

    const key = `rate_limit:${ip}`;
    const currentTime = Date.now();
    const oneMinuteAgo = currentTime - 60000;

    // 移除一分钟前的记录
    await redis.zremrangebyscore(key, '-inf', oneMinuteAgo);

    // 获取当前一分钟内的请求次数
    const count = await redis.zcard(key);

    return count <= 30;
}

async function updateLimitControl(request: RequestObject): Promise<void> {
    const ip =
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-vercel-proxied-for') ||
        request.ip ||
        (request.connection && request.connection.remoteAddress) ||
        '';

    console.log(ip);
    const key = `rate_limit:${ip}`;
    const currentTime = Date.now();

    // 添加当前请求记录
    await redis.zadd(key, currentTime, `${currentTime}`);

    // 设置过期时间为5分钟
    await redis.expire(key, 300);

    // 清理5分钟前的所有记录
    const fiveMinutesAgo = currentTime - 300000;
    await redis.zremrangebyscore(key, '-inf', fiveMinutesAgo);
}

interface LimitControl {
    check: (req: RequestObject) => Promise<boolean>;
    update: (req: RequestObject) => Promise<void>;
}

const limitControl: LimitControl = {
    check: async function (req: RequestObject): Promise<boolean> {
        return await checkLimitControl(req);
    },
    update: async function (req: RequestObject): Promise<void> {
        return await updateLimitControl(req);
    },
};

export default limitControl;
