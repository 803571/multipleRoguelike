import config from '../config/config.js';
import { PACKET_ID } from '../constants/packetId.js';
import { getHandlerByPacketId } from '../handler/index.js';
import decodeMessageByPacketId from '../utils/parser/decodePacket.js';

const onData = (socket) => async (data) => {
  socket.buffer = Buffer.concat([socket.buffer, data]);
  const totalHeaderLength = config.packet.length + config.packet.typeLength;

  while (socket.buffer.length >= totalHeaderLength) {
    const packetLength = socket.buffer.readUInt32BE(0);
    const packetType = socket.buffer.readUInt8(config.packet.length);

    if (socket.buffer.length >= packetLength) {
      const packet = socket.buffer.subarray(totalHeaderLength, packetLength);
      socket.buffer = socket.buffer.subarray(packetLength);

      try {
        const decodedMessage = decodeMessageByPacketId(packetType, packet);

        if (packetType !== PACKET_ID.C_Move) {
          console.log(`패킷 ID ${packetType}의 디코드 결과:`, decodedMessage);
        }

        const handler = getHandlerByPacketId(packetType);
        await handler(socket, decodedMessage);
      } catch (err) {
        // handleError(socket, err);
        console.error(err);
      }
    } else {
      break;
    }
  }
};

export default onData;
