import createResponse from '../../utils/packet/createResponse.js';
import { getSubscriberRedis, connect, getRedis } from '../../utils/redis/redisManager.js';
import { enqueueSend } from '../../utils/socket/messageQueue.js';
import userSessions from '../sessions.js';
import configs from '../../configs/configs.js';
import logger from '../../utils/logger.js';

const { PACKET_ID } = configs;
const HEALTH_REPORT_CHANEL = 'GAME_SERVER_HEALTH_REPORT_CHANNEL';
const SUB_PATTERN = `${HEALTH_REPORT_CHANEL}:*`;

const allServerInfo = {};
let isChangedServerInfo = true;

export const startHealthCheck = async () => {
  const subRedis = await getSubscriberRedis();
  await subRedis.psubscribe(SUB_PATTERN);

  subRedis.on('pmessage', (pattern, channel, message) => {
    if (pattern == SUB_PATTERN) {
      receiveServerHealth(message);
    }
  });

  setInterval(async () => {
    if (isChangedServerInfo === true) {
      isChangedServerInfo = false;
      notifyGameServerInfo();
    }
  }, 5000);
};

const receiveServerHealth = (message) => {
  const serverInfo = JSON.parse(message);
  if (serverInfo.port != undefined) {
    allServerInfo[serverInfo.port] = { ...serverInfo, lastUpdate: Date.now() };
    isChangedServerInfo = true;
  } else {
    logger.error(`somethings wrong received server health info : ${message}`);
  }
};

export const notifyGameServerInfo = () => {
  if (Object.keys(userSessions).length > 0) {
    const buffer = createGameServerInfoPacket();
    for (const userId in userSessions) {
      const socket = userSessions[userId];
      enqueueSend(socket.UUID, buffer);
    }
  }
};

export const createGameServerInfoPacket = () => {
  const payload = [];
  const now = Date.now();
  for (const key in allServerInfo) {
    const serverInfo = allServerInfo[key];
    payload.push({
      name: serverInfo.serverName,
      maxCapacity: serverInfo.maxCapacity,
      currentUserCount: serverInfo.currentUserCount,
      port: serverInfo.port,
      isAlive: now - serverInfo.lastUpdate < 10000, //10초 이상 메세지가 없었으면 서버가 사망한것으로 판단
    });
  }

  return createResponse(PACKET_ID.S_GameServerInfo, { allServer: payload });
};
