import onData from './onData.js';
import onEnd from './onEnd.js';
import onError from './onError.js';
import logger from '../utils/logger.js';
import { v4 as uuidV4 } from 'uuid';
import { addUserQueue } from '../utils/socket/messageQueue.js';
import onClose from './onClose.js';

const onConnection = (socket) => {
  socket.UUID = uuidV4();
  logger.info(
    `클라이언트가 연결되었습니다 [${socket.remoteAddress}:${socket.remotePort}] ${socket.UUID}`,
  );
  // 소켓 객체에 buffer 속성을 추가하여 각 클라이언트에 고유한 버퍼를 유지\
  addUserQueue(socket);
  socket.buffer = Buffer.alloc(0);
  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
  socket.on('close', onClose(socket));
};

export default onConnection;
