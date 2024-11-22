import { getProtoMessages } from '../../init/loadProtos.js';

const decodeMessageByPacketId = (packetId, buffer) => {
  const protoMessages = getProtoMessages();

  const type = protoMessages[packetId];
  if (!type) {
    throw new Error(`패킷 ID ${packetId}에 대한 Protobuf 타입이 없습니다.`);
  }

  try {
    const decoded = type.decode(buffer);

    const object = type.toObject(decoded, {
      longs: String, // Long 값을 문자열로 처리
      enums: String, // enum 값을 문자열로 처리
      bytes: String, // bytes를 문자열로 처리
      default: true,
    });

    return object;
  } catch (error) {
    throw new Error(`패킷 ID ${packetId} 디코딩 실패: ${error.message}`);
  }
};

export default decodeMessageByPacketId;
