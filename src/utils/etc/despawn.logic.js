import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';
import { getRedisPartyByUserId, removeRedisParty } from '../../sessions/redis/redis.party.js';
import { getAllUserUUIDByTown, removeUserForTown } from '../../sessions/town.session.js';
import { getUserById, removeUserSession } from '../../sessions/user.session.js';
import broadcastBySession from '../notification/broadcastBySession.js';
import createNotificationPacket from '../notification/createNotification.js';
import { removeUserQueue } from '../socket/messageQueue.js';

// message S_Despawn {
//     repeated int32 playerIds = 1;    // 디스폰되는 플레이어 ID 리스트
// }

const despawnLogic = async (socket) => {
  const userId = socket.id;
  console.log('🚀 ~ despawnLogic ~ userId:', userId);
  removeUserQueue(socket);
  const user = getUserById(userId);

  if (user) {
    const dungeon = getDungeonSession(user.dungeonId);
    if (dungeon) {
      dungeon.removeDungeonUser(userId);
    }
    removeUserForTown(userId);
    const payload = {
      playerIds: [userId],
    };

    const AllUUID = getAllUserUUIDByTown();
    const party = await getRedisPartyByUserId(userId);
    if (party) {
      if (party.members.length <= 1) {
        await removeRedisParty(party.roomId);
      }
      const leavePayload = {
        playerId: socket.id,
        roomId: party.roomId,
      };
      createNotificationPacket(PACKET_ID.S_PartyLeave, leavePayload, AllUUID);
    }

    broadcastBySession(socket, PACKET_ID.S_Despawn, payload, true);
  }

  removeUserSession(socket);
};

export default despawnLogic;
