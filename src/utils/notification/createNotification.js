import { getProtoMessages } from '../../init/loadProtos.js';
import createHeader from '../packet/createHeader.js';
import createResponse from '../packet/createResponse.js';
import { enqueueSend } from '../socket/messageQueue.js';
import logger from '../logger.js';
import { reverseMapping } from '../../configs/constants/packetId.js';

const createNotificationPacket = (packetId, data = null, targetUUIDs = []) => {
  if (targetUUIDs.length <= 0) {
    logger.warn(
      `createNotificationPacket[${packetId}]. ${reverseMapping[packetId]} TargetUUID length is zero.`,
    );
    return;
  }

  const buffer = createResponse(packetId, data);
  for (const uuid of targetUUIDs) {
    enqueueSend(uuid, buffer);
  }
};

export default createNotificationPacket;
