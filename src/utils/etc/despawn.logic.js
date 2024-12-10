import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getRedisPartyByUserId, removeRedisParty } from '../../sessions/redis/redis.party.js';
import { removeRedisUser } from '../../sessions/redis/redis.user.js';
import { getUserSessions, removeUserSession, getAllUserUUID } from '../../sessions/user.session.js';
import logger from '../logger.js';
import createNotificationPacket from '../notification/createNotification.js';

// message S_Despawn {
//     repeated int32 playerIds = 1;    // 디스폰되는 플레이어 ID 리스트
// }

const despawnLogic = async (socket) => {
  if (!socket.id) {
    logger.warn(`despawnLogic이 호출되었으나 id값이 할당되지 않았습니다. [${socket.UUID}]`);
    return;
  }
  const payload = {
    playerIds: [parseInt(socket.id)],
  };

  await removeRedisUser(socket);

  const party = await getRedisPartyByUserId(socket.id);
  if (party) {
    await removeRedisParty(party.roomId);
  }

  removeUserSession(socket);
  const response = createNotificationPacket(PACKET_ID.S_Despawn, payload, getAllUserUUID());
};

export default despawnLogic;
