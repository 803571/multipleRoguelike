import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import createResponse from '../../utils/packet/createResponse.js';
import { getUserSessions, updateUserTransformById } from '../../sessions/user.session.js';
import logger from '../../utils/logger.js';
import Result from '../result.js';
/**
 * 무브 핸들러
 * @param {object} socket - 클라이언트 소켓
 * @param {object} payload - 클라이언트에서 전송한 데이터
 */
const movePlayerHandler = async (socket, payload) => {
  try {
    const { posX, posY, posZ, rot } = payload.transform;

    // 소켓에서 유저 정보 가져오기
    const user = await getRedisUserById(socket.id);
    const transform = updateUserTransformById(socket.id, posX, posY, posZ, rot);

    const movePayload = {
      playerId: parseInt(user.id),
      transform: transform,
    };

    const moveResponsePayload = createResponse(PACKET_ID.S_Move, movePayload);

    const allUsers = getUserSessions();
    // 로케이션 타입 확인 후 같은 로케이션의 유저들에게 패킷 전송
    allUsers.forEach((value, targetUserId) => {
      if (targetUserId !== user.id) {
        value.socket.write(moveResponsePayload);
      }
    });
  } catch (error) {
    logger.error('무브 핸들러 실행 중 오류 발생:', error.message);
  }
};

export default movePlayerHandler;
