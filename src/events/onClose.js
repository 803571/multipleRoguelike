import userSessions from '../sessions/sessions.js';
import logger from '../utils/logger.js';
import { removeUserQueue } from '../utils/socket/messageQueue.js';

const onClose = (socket) => async () => {
  // console.log(`onClose => ${socket.id} / ${socket.UUID}`);
  delete userSessions[socket.id];
  removeUserQueue(socket);
};

export default onClose;
