import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function createRedisClient(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  const client = createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: parseInt(process.env.REDIS_DB || '0'),
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  }) as RedisClientType;

  await client.connect();

  redisClient = client;

  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  client.on('connect', () => {
    console.log('✅ Redis conectado');
  });

  return client;
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
