import configs from '../../configs/configs.js';
import Redis from 'ioredis';
import logger from '../logger.js';
import { v4 as uuidv4 } from 'uuid';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = configs;
const LOCK_DEFAULT_TTL = '5000'; //밀리초 기본 락 유지시간

let redis = null;
let subscriberRedis = null;

/**
 * 레디스에 연결을 시도합니다. 만약, 연결 실패시 에러를 던집니다.
 *
 */
export const connect = async () => {
  if (redis === null) {
    try {
      redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: 2,
      });

      redis.on('error', (err) => {
        logger.error(`Redis connection failed: ${err}`);
        redis = null;
      });

      logger.info('Redis connected');
    } catch (e) {
      logger.error(`Redis connection failed, ${e}`);
      redis = null;
      throw e;
    }
  }

  if (subscriberRedis === null) {
    try {
      subscriberRedis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: 2,
      });

      subscriberRedis.on('error', (err) => {
        logger.error(`Subscriber Redis connection failed: ${err}`);
        subscriberRedis = null;
      });

      subscriberRedis.on('message', (channel, message) => {
        logger.info(`Redis received publish[${channel}] => ${message}`);
      });

      logger.info('Subscriber Redis connected');
    } catch (e) {
      logger.error(`Subscriber Redis connection failed, ${e}`);
      subscriberRedis = null;
      throw e;
    }
  }
};

/**
 *  redis 연결이 안되어있으면 연결시도 후 반환합니다.
 *  연결실패시 에러객체가 던져집니다.
 * @return {*}
 */
export const getRedis = async () => {
  if (redis === null) {
    logger.warn('redis is null. It will try to connect');
    await connect();
  }

  return redis;
};

export const getSubscriberRedis = async () => {
  if (subscriberRedis === null) {
    logger.warn('Subscriber Redis is null. It will try to connect');
    await connect();
  }
  return subscriberRedis;
};

/** 레디스 락 요청  */
export const acquireLock = async (lockKey, ttl = LOCK_DEFAULT_TTL) => {
  if (redis === null) {
    logger.warn(`redis.acquireLock. redis not connected`);
    return null;
  }

  if (!lockKey || typeof lockKey !== 'string') {
    throw new Error(`acquireLock. lockKey is invalid : ${lockKey}`);
  }

  const lockValue = uuidv4();
  try {
    const lockAcquired = await redis.set(lockKey, lockValue, 'NX', 'PX', ttl);
    if (lockAcquired) {
      return lockValue;
    }
  } catch (error) {
    logger.error(`redis.acquireLock. ${error.message}`);
  }
  return null;
};

/** 레디스 락 해제 요청 */
export const releaseLock = async (lockKey, lockValue) => {
  try {
    const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
       return redis.call("del", KEYS[1])
    else
       return 0
    end
     `;

    const result = await redis.eval(script, 1, lockKey, lockValue);
    return result !== 0; //1이면 락 해제 성공
  } catch (error) {
    logger.error(`releaseLock. ${error.message}`);
  }
  return false;
};
