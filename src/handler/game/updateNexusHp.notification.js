import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';

const updateNexusHpNotification = async (socket, hp) => {
  const redisUser = await findCharacterByUserId(socket.id);
  const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);
  const nexusHpPayload = { hp };
  createNotificationPacket(PACKET_ID.S_UpdateNexusHp, nexusHpPayload, dungeonUsersUUID);
};

export default updateNexusHpNotification;
