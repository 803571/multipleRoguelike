import { PACKET_ID } from '../../configs/constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
import { getDungeonSession, getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import updateNexusHpNotification from './updateNexusHp.notification.js';

// message C_AttackedNexus {
//     int32 damage = 1;    // 데미지
//   }
//   message S_AttackedNexus {
//     int32 playerId = 1;  // 공격 유저ID
//     int32 damage = 2;    // 데미지
//   }

const attackedNexusHandler = async ({ socket, payload }) => {
  try {
    const { damage } = payload;
    const playerId = socket.id;

    const redisUser = await findCharacterByUserId(playerId);
    const dungeon = getDungeonSession(redisUser.sessionId);
    const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);

    const currentHp = dungeon.nexusDamaged(damage, playerId);

    const nexusPayload = {
      playerId,
      damage,
      currentHp,
    };

    // 넥서스 피해 알림
    createNotificationPacket(PACKET_ID.S_AttackedNexus, nexusPayload, dungeonUsersUUID);

    // 넥서스 HP 업데이트 알림
    updateNexusHpNotification(socket, currentHp);
  } catch (err) {
    handleError(socket, err);
  }
};

export default attackedNexusHandler;
