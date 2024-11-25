import { getProtoMessages } from '../../init/loadProtos.js';
import config from '../../config/config.js';
import createHeader from '../createHeader.js';

const createResponse = (packetId, data = null) => {
  const protoMessages = getProtoMessages();

  const response = protoMessages[packetId];
  const gamePacket = response.create(data);
  const buffer = response.encode(gamePacket).finish();

  const header = createHeader(packetId, buffer);

  return Buffer.concat([header, buffer]);
};

export default createResponse;
