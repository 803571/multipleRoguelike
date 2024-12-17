import { getRedis } from '../../utils/redis/redisManager.js';
import { tryGetValue } from './helper.js';

export const setRedisUser = async (characterDB) => {
  const redis = await getRedis();
  const userKey = `user:${characterDB.userId}`;
  await redis.hset(userKey, characterDB);
  await redis.expire(userKey, 3600);
};

export const setRedisUserUUID = async (socket) => {
  const redis = await getRedis();
  const userKey = `user:${socket.id}`;
  await redis.expire(userKey, 3600);
};

export const removeRedisUser = async (socket) => {
  const redis = await getRedis();
  const userKey = `user:${socket.id}`;
  return await redis.unlink(userKey);
};

export const getRedisUserById = async (id) => {
  const redis = await getRedis();
  const userKey = `user:${id}`;
  const user = await redis.hgetall(userKey);
  return tryGetValue(user);
};

export const setSessionId = async (userId, sessionId) => {
  const redis = await getRedis();
  const userKey = `user:${userId}`;
  await redis.hset(userKey, 'sessionId', sessionId);
  await redis.expire(userKey, 3600);
};

export const setIsSignIn = async (userId, isSignIn) => {
  const redis = await getRedis();
  const userKey = `user:${userId}`;
  await redis.hset(userKey, 'isSignIn', isSignIn);
};

export const getIsSignIn = async (userId) => {
  const redis = await getRedis();
  const userKey = `user:${userId}`;
  return (await redis.hget(userKey, 'isSignIn')) == 'true';
};
