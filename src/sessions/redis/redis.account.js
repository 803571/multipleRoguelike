import { getRedis, getSubscriberRedis } from '../../utils/redis/redisManager.js';
import { findAllUserQueueByUserId } from '../../utils/socket/messageQueue.js';
import { tryGetValue } from './helper.js';

const ACCOUNT_KEY = 'account';
const DUPLICATED_SIGN_IN_CHANNEL = 'duplicated_sign_in';

export const getAccountByRedis = async (account) => {
  const redis = await getRedis();
  const key = `${ACCOUNT_KEY}:${account}`;
  const result = tryGetValue(await redis.hgetall(key));
  if (result != null) {
    await redis.expire(key, 3600);
  }
  return result;
};

export const setTokenByRedis = async (account, token) => {
  const redis = await getRedis();
  const key = `${ACCOUNT_KEY}:${account}`;
  await redis.hset(key, 'token', token);
  await redis.expire(key, 3600);
};

export const setAccountByRedis = async (accountByDB) => {
  const redis = await getRedis();
  const key = `${ACCOUNT_KEY}:${accountByDB.account}`;
  await redis.hset(key, accountByDB);
  await redis.expire(key, 3600);
};

export const unlinkAccountByRedis = async (account) => {
  const redis = await getRedis();
  const key = `${ACCOUNT_KEY}:${account}`;
  return await redis.unlink(key);
};

export const pubDuplicatedSignIn = async (userId, UUID) => {
  const redis = await getRedis();
  await redis.publish(DUPLICATED_SIGN_IN_CHANNEL, JSON.stringify({ userId, UUID }));
};

export const subDuplicatedSignIn = async () => {
  const redis = await getSubscriberRedis();
  await redis.subscribe(DUPLICATED_SIGN_IN_CHANNEL);
  redis.on('message', async (channel, message) => {
    if (channel === DUPLICATED_SIGN_IN_CHANNEL) {
      const userInfo = JSON.parse(message);

      const userId = userInfo.userId;
      const UUID = userInfo.UUID;
      const userQueues = findAllUserQueueByUserId(userId);

      for (const userQueue of userQueues) {
        if (userQueue.socket.id == userId && userQueue.socket.UUID != UUID) {
          userQueue.socket.destroy();
        }
      }
    }
  });
};
