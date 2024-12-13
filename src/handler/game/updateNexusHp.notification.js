import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonSession, getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import handleError from '../../utils/error/errorHandler.js';

const updateNexusHpNotification = async (socket, hp) => {
  const redisUser = await findCharacterByUserId(socket.id);
  const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);
  const nexusHpPayload = { hp };
  createNotificationPacket(PACKET_ID.S_UpdateNexusHp, nexusHpPayload, dungeonUsersUUID);
};

export default updateNexusHpNotification;
