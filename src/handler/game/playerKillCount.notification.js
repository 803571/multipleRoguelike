import { PACKET_ID } from '../../configs/constants/packetId.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';

const playerKillCountNotification = async (playerId, killCount) => {
  const redisUser = await findCharacterByUserId(playerId);
  const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);
  const payload = {
    playerId,
    playerKillCount: killCount,
  };
  createNotificationPacket(PACKET_ID.S_PlayerKillCount, payload, dungeonUsersUUID);
};

export default playerKillCountNotification;
