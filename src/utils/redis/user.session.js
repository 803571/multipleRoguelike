import User from '../../classes/model/user.class.js';
import redis from './redisManager.js';

const userSessions = [];
//여기다가 latency transform를 playerId를 키값으로 넣어줘야함 핑퐁받으면 어떤값을 userSessions에서 계속 갱신시켜주는
// {
// player.id : {
//   transform:
//   latancy
// }
// }
const addUser = async (socket, id, myClass, nickname) => {
  const user = new User(id, myClass, nickname);
  //const clientId = `${socket.remoteAddress}:${socket.remotePort}`;

  const userKey = `user:${user.id}`;
  await redis.hmset(userKey, {
    socket,
    id: id,
    nickname,
    class: myClass,
    locationType: user.locationType,
  });

  const transformKey = `transform:${user.id}`;
  await redis.hmset(transformKey, {
    posX: user.transform.posX,
    posY: user.transform.posY,
    posZ: user.transform.posZ,
    rot: user.transform.rot,
  });

  //유저세션에도 추가해줍니당 이뤄케에에말이죠
  userSessions[user.id] = {
    transfrom: user.transform,
    latency: 0,
  };

  return user;
};

const removeUser = async (socket) => {
  const keys = await redis.keys('user:*');

  for (const key of keys) {
    const user = await redis.hgetall(key);

    // console.log('user.id: ', user.id);
    // console.log('socket.id: ', socket.id);
    // const clientId = `${socket.remoteAddress}:${socket.remotePort}`;

    if (Number(user.id) === socket.id) {
      // 인덱스 삭제
      await redis.del(key);

      // 유저세션에서도 제거해줍시당 이~뤄케 말이죠
      delete userSessions[user.id];

      return user;
    }
  }

  return null;
};

const getUserById = async (id) => {
  const userKey = `user:${id}`;
  const user = await redis.hgetall(userKey);

  return Object.keys(user).length > 0 ? user : null;
};

const getUserTransformById = async (id) => {
  const transformKey = `transform:${user.id}`;
  const userTransform = await redis.hgetall(transformKey);

  return Object.keys(userTransform).length > 0 ? userTransform : null;
};

const updateUserTransformById = async (id, posX, posY, posZ, rot) => {
  const transformKey = `transform:${id}`;

  const estimatedPos = calculatePosition(posX, posY, posZ, latency);

  await redis.hmset(transformKey, {
    posX: estimatedPos.x.toString(),
    posY: estimatedPos.y.toString(),
    posZ: estimatedPos.z.toString(),
    rot: rot.toString(),
  });

  // 유저세션에업데잍
  if (userSessions[id]) {
    userSessions[id].transform = estimatedPos;
    userSessions[id].latency = latency;
  }

  const updatedTransform = await redis.hgetall(transformKey);

  return Object.keys(updatedTransform).length > 0 ? updatedTransform : null;
};

const calculatePosition = (x, y, z, latency) => {
  const timeDiff = latency / 1000; // 레이턴시를 초 단위로 변환
  const speed = 1; // 이동 속도 (고정 값)
  const distance = speed * timeDiff; // 이동 거리 계산

  const estimatedX = x + distance;
  const estimatedY = y + distance;
  const estimatedZ = z + distance;

  return { x: estimatedX, y: estimatedY, z: estimatedZ };
};

const getAllUsers = async () => {
  try {
    const userKeys = await redis.keys('user:*');

    const users = await Promise.all(
      userKeys.map(async (key) => {
        const user = await redis.hgetall(key);
        return user;
      }),
    );

    return users;
  } catch (err) {
    console.error('모든 유저 불러오기 오류: ', err);
    throw err;
  }
};

/**
 * userSessions를 반환 디버깅용도로 추가했습니다.
 */
const getUserSessions = () => {
  return userSessions;
};

export {
  addUser,
  removeUser,
  getUserById,
  getAllUsers,
  getUserTransformById,
  updateUserTransformById,
  getUserSessions,
};
