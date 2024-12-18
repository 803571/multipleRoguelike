import configs from '../configs/configs.js';
import decodeMessageByPacketId from '../utils/packet/decodePacket.js';
import logger from '../utils/logger.js';
import { enqueueReceive } from '../utils/socket/messageQueue.js';

const { PACKET_LENGTH, PACKET_TYPE_LENGTH, PACKET_TOTAL_LENGTH } = configs;

const onData = (socket) => async (data) => {
  socket.buffer = Buffer.concat([socket.buffer, data]);

  while (socket.buffer.length >= PACKET_TOTAL_LENGTH) {
    const packetLength = socket.buffer.readUIntBE(0, PACKET_LENGTH);
    const packetType = socket.buffer.readUIntBE(PACKET_LENGTH, PACKET_TYPE_LENGTH);

    if (socket.buffer.length >= packetLength) {
      const packet = socket.buffer.subarray(PACKET_TOTAL_LENGTH, packetLength);
      socket.buffer = socket.buffer.subarray(packetLength);

      try {
        const decodedMessage = decodeMessageByPacketId(packetType, packet);
        enqueueReceive(socket.UUID, packetType, decodedMessage);
      } catch (err) {
        logger.error(err);
      }
    } else {
      break;
    }
  }
};

export default onData;
