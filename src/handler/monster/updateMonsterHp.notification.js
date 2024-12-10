import createResponse from '../../utils/packet/createResponse.js';
import { PACKET_ID } from '../../configs/constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';
import Result from '../result.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';

const updateMonsterHpNotification = (monsterId, currentHp, targetUUIDs = []) => {
  createNotificationPacket(PACKET_ID.S_UpdateMonsterHp, { monsterId, hp: currentHp }, targetUUIDs);
};
export default updateMonsterHpNotification;
