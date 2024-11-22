import redis from '../../utils/redis/redisManager.js';

const addRedisUser = async (user) => {
  const userKey = `user:${user.id}`;
  const redisUser = await redis.hset(userKey, {
    id: user.id.toString(),
    nickname: user.nickname,
    myClass: user.myClass.toString(),
    locationType: user.locationType,
  });

  return redisUser;
};

const removeRedisUser = async (socket) => {
  const userKey = `user:${socket.id}`;
  const user = await redis.hgetall(userKey);

  if (Object.keys(user).length === 0) {
    return null;
  }

  await redis.del(userKey);
  return user;
};

const getRedisUsers = async () => {
  // keys - 데이터 많으면 불안전. 대신 scan 사용으로 변경.
  const userKeys = await redis.keys('user:*');

  if (!userKeys.length) {
    return null;
  }

  // pipeline - 명령 묶어서 실행(최적화)
  const pipeline = redis.pipeline();
  userKeys.forEach((key) => pipeline.hgetall(key));

  const results = await pipeline.exec();

  return results.map(([err, data]) => {
    if (err || !data) return null;
    return {
      id: data.id,
      nickname: data.nickname,
      myClass: parseInt(data.myClass),
      locationType: data.locationType,
    };
  });
};

const getRedisUserById = async (id) => {
  const userKey = `user:${id}`;
  const user = await redis.hgetall(userKey);

  if (!user || Object.keys(user).length === 0) {
    return null;
  }

  return {
    id: user.id,
    nickname: user.nickname,
    myClass: parseInt(user.myClass),
    locationType: user.locationType,
  };
};

export { addRedisUser, removeRedisUser, getRedisUsers, getRedisUserById };
