import { PACKET_ID } from '../configs/constants/packetId.js';

// user
import registerHandler from './user/register.handler.js';
import logInHandler from './user/logIn.handler.js';
import logger from '../utils/logger.js';

const handlers = {
  // user
  [PACKET_ID.C_Register]: {
    handler: registerHandler,
  },
  [PACKET_ID.C_Login]: {
    handler: logInHandler,
  },
  [PACKET_ID.C_Logout]: {
    handler: logInHandler,
  },

  // 다른 핸들러들 추가
};

export const getHandlerByPacketId = (packetId) => {
  if (!handlers[packetId]) {
    logger.error(`핸들러를 찾을 수 없습니다: ID ${packetId}`);
    return null;
  }

  return handlers[packetId].handler;
};

export const getProtoTypeNameByPacketType = (packetType) => {
  if (!handlers[packetType]) {
    logger.error(`핸들러를 찾을 수 없습니다: ID ${packetType}`);
    return null;
  }

  return handlers[packetType].protoType;
};
