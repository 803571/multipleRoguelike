import userSessions from '../sessions/sessions.js';
import logger from '../utils/logger.js';

const onError = (socket) => async (err) => {
  logger.warn(`클라이언트와 연결이 종료되었습니다.[${socket.id}] ${socket.UUID}`);
  delete userSessions[socket.id];
};

export default onError;
