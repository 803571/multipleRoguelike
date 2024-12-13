import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';

const updatePlayerHpNotification = async (socket, playerId, hp) => {
  const redisUser = await findCharacterByUserId(playerId);
  const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);

  const payload = {
    playerId,
    hp,
  };

  createNotificationPacket(PACKET_ID.S_UpdatePlayerHp, payload, dungeonUsersUUID);
};

export default updatePlayerHpNotification;
