import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';

const spawnNexusNotification = async (socket, { nexusId, transform }) => {
  const dungeonUsersUUID = getDungeonUsersUUID(socket.sessionId);
  createNotificationPacket(PACKET_ID.S_NexusSpawn, { nexusId, transform }, dungeonUsersUUID);
};

export default spawnNexusNotification;
