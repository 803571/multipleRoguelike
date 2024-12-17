import { getHandlerByPacketId } from '../../handler/index.js';
import logger from '../logger.js';
import configs from '../../configs/configs.js';
import createResponse from '../packet/createResponse.js';

const { PACKET_ID } = configs;
const queueBySocket = {};

export const addUserQueue = (socket) => {
  //userId로 전환해야 연결이 끊겼다 들어와도 다시 큐에 정상처리 될듯?
  const uuid = socket.UUID;
  if (queueBySocket[uuid]) {
    //기존 큐를 비워야할지도 고민해봐야 할듯
    logger.warn(`addUserQueue. already exists queue : ${uuid}`);
    queueBySocket[uuid].socket = socket;
    queueBySocket[uuid].receiveQueue = queueBySocket[uuid].receiveQueue || [];
    queueBySocket[uuid].sendQueue = queueBySocket[uuid].sendQueue || [];
  } else {
    queueBySocket[uuid] = {
      socket,
      receiveQueue: [],
      processingReceive: false,
      sendQueue: [],
      processingSend: false,
    };
  }
};

export const removeUserQueue = (socket) => {
  const uuid = socket.UUID;
  if (queueBySocket[uuid]) {
    logger.debug(`removeUserQueue. ${uuid} is removed`);
  } else {
    logger.warn(`removeUserQueue. ${uuid || 'Undefined'} is unknown socket`);
  }
  delete queueBySocket[uuid];
};

const getUserQueue = (socketUUID) => {
  const userQueues = queueBySocket[socketUUID];
  if (!userQueues) {
    logger.error(`Unknown user queue. is Empty : ${socketUUID}`);
  }
  return userQueues;
};

export const findAllUserQueueByUserId = (userId) => {
  const result = [];
  for (const key in queueBySocket) {
    if (queueBySocket[key].socket.id == userId) {
      result.push(queueBySocket[key]);
    }
  }
  return result;
};

export const enqueueSend = (socketUUID, buffer) => {
  const userQueue = getUserQueue(socketUUID);
  if (userQueue) {
    userQueue.sendQueue.push(buffer);
    processSendQueue(socketUUID);
  } else {
    logger.error(`enqueueSend. ${socketUUID} is unknown user`);
  }
};

export const countSend = (socketUUID) => {
  const userQueue = getUserQueue(socketUUID);
  let count = 0;
  if (userQueue) {
    count = userQueue.sendQueue.length;
  } else {
    logger.warn(`countSend. ${socketUUID} is unknown user`);
  }
  return count;
};

export const dequeueSend = (socketUUID) => {
  return getUserQueue(socketUUID).sendQueue.shift();
};

export const enqueueReceive = (socketUUID, packetType, payload) => {
  const userQueue = getUserQueue(socketUUID);
  if (userQueue) {
    userQueue.receiveQueue.push({ packetType, payload });
    processReceiveQueue(socketUUID);
  } else {
    logger.error(`enqueueReceive. ${socketUUID} is unknown user`);
  }
};

export const countReceive = (socketUUID) => {
  const userQueue = getUserQueue(socketUUID);
  let count = 0;
  if (userQueue) {
    count = userQueue.receiveQueue.length;
  } else {
    logger.warn(`countReceive. ${socketUUID} is unknown user`);
  }
  return count;
};

export const dequeueReceive = (socketUUID) => {
  return getUserQueue(socketUUID).receiveQueue.shift();
};

const processSendQueue = async (socketUUID) => {
  const userQueue = getUserQueue(socketUUID);
  if (!userQueue) return;
  if (userQueue.processingSend === true) return;
  userQueue.processingSend = true;

  const { sendQueue, socket } = userQueue;

  // 큐에서 메시지를 하나 꺼내 처리
  while (sendQueue.length > 0) {
    const message = sendQueue.shift();
    if (message) {
      try {
        await socket.write(message);
      } catch (err) {
        logger.error(`Failed to send message to socket ${socketUUID}: ${err}`);
      }
    }
  }

  userQueue.processingSend = false;
};

const processReceiveQueue = async (socketUUID) => {
  const userQueue = getUserQueue(socketUUID);
  if (!userQueue) return;
  if (userQueue.processingReceive === true) return;
  userQueue.processingReceive = true;

  const { receiveQueue, socket } = userQueue;

  // 큐에서 메시지를 하나 꺼내 처리
  while (receiveQueue.length > 0) {
    const message = receiveQueue.shift();
    if (message) {
      const { packetType, payload } = message;
      let result = null;
      try {
        const handler = getHandlerByPacketId(packetType);
        if (handler) {
          result = await handler(socket, payload);
        } else {
          logger.warn(`processReceiveQueue. Unknown handler Id : ${packetType}`);
        }
      } catch (error) {
        logger.error(error);
      } finally {
        if (result) {
          const response = createResponse(result.packetType, result.payload);

          if (result.targetUUIDs.length > 0) {
            for (const uuid of result.targetUUIDs) {
              enqueueSend(uuid, response);
            }
          } else {
            enqueueSend(socketUUID, response);
          }
        }
      }
    }
  }

  userQueue.processingReceive = false;
};
