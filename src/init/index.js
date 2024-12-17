import { loadProtos } from './loadProtos.js';
import logger from '../utils/logger.js';
import dbPool from '../db/database.js';
import { connect } from '../utils/redis/redisManager.js';
import { startHealthCheck } from '../sessions/redis/redis.health.js';
const initServer = async () => {
  try {
    await import('../configs/configs.js');
    await loadProtos();
    await connect();
    await dbPool.init();
    await startHealthCheck();
  } catch (err) {
    logger.error(err);
    process.exit(1); // 에러 발생 시 게임 종료
  }
};

export default initServer;
