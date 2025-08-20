import { createClient } from 'redis';

import 'dotenv/config';


const redisClient = await createClient({
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
}).on('error', (err) => {
  console.error('Redis error:', err);
}).on('connect', () => {
  console.log('Connected to Redis');
});

await redisClient.connect();

export default redisClient;