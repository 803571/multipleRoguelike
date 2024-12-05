import createResponse from '../../utils/response/createResponse.js';
import handleError from '../../utils/error/errorHandler.js';
import { PACKET_ID } from '../../constants/packetId.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';

//   message S_UserKillCount {
//      int32 playerId = 1;
//      int32 userKillCount = 2;
//   }

const userKillCounter = async (socket) => {
  try {
    // redis에서 유저정보갖고오기
    const redisUser = await getRedisUserById(playerId);
    const dungeon = getDungeonSession(redisUser.sessionId);

    // 플레이어 킬 카운트 함수 불러오기 + 이거 손봐야할듯????
    const userKillCount = dungeon.getUserStats(playerId).userKillCount;
    const response = createResponse(PACKET_ID.S_UserKillCount, {
      playerId: socket.id,
      userKillCount,
    });

    // 주변 유저들에게 킬카운트 전송
    const allUsers = dungeon.getAllUsers();
    allUsers.forEach((value) => {
      value.socket.write(response);
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default userKillCounter;
