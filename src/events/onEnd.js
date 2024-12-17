import userSessions from '../sessions/sessions.js';
import logger from '../utils/logger.js';

const onEnd = (socket) => async () => {
  logger.info(`클라이언트와 연결이 종료되었습니다.[${socket.id}] ${socket.UUID}`);
  delete userSessions[socket.id];
};

export default onEnd;
