import { loadGameAssets } from './loadAsset.js';
import { loadProtos } from './loadProtos.js';
import logger from '../utils/logger.js';
import dbPool from '../db/database.js';
import { connect } from '../utils/redis/redisManager.js';

const initServer = async () => {
  try {
    await import('../configs/configs.js');
    await loadProtos();
    await loadGameAssets();
    await connect();
    await dbPool.init();
  } catch (err) {
    logger.error(err);
    process.exit(1); // 에러 발생 시 게임 종료
  }
};

export default initServer;
