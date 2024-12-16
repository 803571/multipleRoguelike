import { PACKET_ID } from '../configs/constants/packetId.js';
import CustomError from '../utils/error/customError.js';
import ErrorCodes from '../utils/error/errorCodes.js';
// user
import registerHandler from './user/register.handler.js';
import logInHandler from './user/logIn.handler.js';

const handlers = {
  // user
  [PACKET_ID.C_Register]: {
    handler: registerHandler,
  },
  [PACKET_ID.C_Login]: {
    handler: logInHandler,
  },

  // 다른 핸들러들 추가
};

export const getHandlerByPacketId = (packetId) => {
  if (!handlers[packetId]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${packetId}`,
    );
  }

  return handlers[packetId].handler;
};

export const getProtoTypeNameByPacketType = (packetType) => {
  if (!handlers[packetType]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${packetType}`,
    );
  }

  return handlers[packetType].protoType;
};
