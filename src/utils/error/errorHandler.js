import logger from '../logger.js';

const handleError = (socket, error) => {
  logger.error(error);
};

export default handleError;
