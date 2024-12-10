import { PACKET_ID } from '../../configs/constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
import { getUserSessions, getAllUserUUID } from '../../sessions/user.session.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { addRedisParty, joinRedisParty } from '../../sessions/redis/redis.party.js';

// 패킷명세
// **C_PartyJoin** - 파티에 참여 요청 메시지
// message C_PartyJoin {
//   int32 dungeonLevel = 1;  // 던전 난이도
//   int32 roomId = 2;
//   bool isOner = 3;
// }

// message S_PartyJoin {
// 	int32 playerId = 1;
// 	int32 roomId = 2;
// 	int32 dungeonLevel = 3;
// }

const partyJoinHandler = async (socket, payload) => {
  try {
    const { dungeonLevel, roomId, isOwner } = payload;

    let party = null;
    if (isOwner) {
      party = await addRedisParty(roomId, dungeonLevel, socket.id);
    } else {
      party = await joinRedisParty(roomId, socket.id);
    }

    const partyPayload = {
      playerId: parseInt(socket.id),
      roomId,
      dungeonLevel,
    };

    const notification = createNotificationPacket(
      PACKET_ID.S_PartyJoin,
      partyPayload,
      getAllUserUUID(),
    );
  } catch (e) {
    handleError(socket, e);
  }
};

export default partyJoinHandler;
