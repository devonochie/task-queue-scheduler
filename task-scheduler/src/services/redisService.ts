import Redis, { RedisOptions } from "ioredis"

const redisOptions: RedisOptions = {
    host: process.env.REDIS_HOST as string || "redis-17629.crce176.me-central-1-1.ec2.redns.redis-cloud.com",
    port: parseInt(process.env.REDIS_PORT as string || "17629"),
    password: process.env.REDIS_PASSWORD as string || "FhbP5dcruHGZbeQZROiZlfOiieP8TkxL",
    db: parseInt(process.env.REDIS_DB! || "0"),
    retryStrategy: (times: number ) => {
        const delay = Math.min(times * 100, 5000)
        return delay
    },
    username: process.env.REDIS_USERNAME || undefined,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 5000
}

export class RedisClient {
    public static instance: Redis
    private constructor() {}

    public static getInstance() : Redis {
        if(!RedisClient.instance) {
            RedisClient.instance = new Redis(redisOptions)

            RedisClient.instance.on("connect", () => {
                console.info("Redis Connected")
            })

            RedisClient.instance.on("error", (error) => {
                console.error('Redis error', error)
            })

            RedisClient.instance.on('reconnecting', () => {
                console.warn('Redis connecting...')
            })

            RedisClient.instance.on("close", () => {
                console.log('Redis connection closed')
            })
        }
        return RedisClient.instance
    }
}

export const checkRedisHealth = async (): Promise<boolean> => {
    try {
        const pingResponse = await RedisClient.getInstance().ping()
        return pingResponse === "PONG"
    } catch (error) {
        console.error("Redis health check failed:", error)
        return false
    }
}

export const closeRedis = async (): Promise<void> => {
    if(RedisClient.instance) {
        await RedisClient.instance.quit()
        console.log('Redis connection closed gracefully')
    }
}

export const redis = RedisClient.getInstance()