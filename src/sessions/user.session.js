import User from '../classes/model/user.class.js';
import logger from '../utils/logger.js';
import { userSessions } from './sessions.js';

const addUserSession = (socket) => {
  if (userSessions.has(socket.id)) {
    throw new Error('이미 존재하는 유저 세션입니다.');
  }

  const user = new User(socket);
  userSessions.set(socket.id, user);
  return user;
};

const removeUserSession = (socket) => {
  if (!userSessions.has(socket.id)) {
    logger.warn(
      `removeUserSession. 유저 세션을 제거하려는데 해당 유저는 존재하지 않습니다. ${socket.id}`,
    );
  } else {
    userSessions.delete(socket.id);
  }
};

const getUserSessions = () => {
  if (userSessions.size === 0) {
    return null;
  }

  return userSessions;
};

const getAllUserUUID = () => {
  return Array.from(userSessions.values()).map((user) => user.socket.UUID);
};

const getUserSessionById = (id) => {
  const userId = id.toString();

  if (!userSessions.has(userId)) {
    throw new Error('존재하지 않는 유저 세션입니다.');
  }

  return userSessions.get(userId);
};

const getUserTransformById = (id) => {
  const userId = id.toString();

  if (!userSessions.has(userId)) {
    throw new Error('존재하지 않는 유저 세션입니다.');
  }

  return userSessions.get(userId).transform;
};

const updateUserTransformById = (id, posX, posY, posZ, rot) => {
  const userId = id.toString();
  if (!userSessions.has(userId)) {
    throw new Error('존재하지 않는 유저 세션입니다.');
  }

  const user = userSessions.get(userId);
  user.updateUserTransform(posX, posY, posZ, rot);

  const transform = { posX, posY, posZ, rot };
  return transform;
};

export {
  addUserSession,
  removeUserSession,
  getUserSessions,
  getUserSessionById,
  getUserTransformById,
  updateUserTransformById,
  getAllUserUUID,
};
