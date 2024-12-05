import createResponse from '../../utils/response/createResponse.js';
import handleError from '../../utils/error/errorHandler.js';
import { PACKET_ID } from '../../constants/packetId.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';

// 버퍼추가해야함
//   message S_MonsterKillCount {
//      int32 playerId = 1;
//      int32 monsterKillCount = 2;
//   }

// getUserStats말고 다른데다가 작성하고 불러오게끔 하세요
// monsterKillCount: user.statsInfo.monsterKillCount + 1,
// userKillCount: user.statsInfo.userKillCount + 1,

const monsterKillCountHandler = async (socket) => {
  try {
    // redis에서 유저정보갖고오기
    const redisUser = await getRedisUserById(playerId);
    const dungeon = getDungeonSession(redisUser.sessionId);

    // 몬스터 킬 카운트 함수 불러오기
    const monsterKillCount = dungeon.getUserStats(playerId).monsterKillCount;
    const response = createResponse(PACKET_ID.S_MonsterKillCount, {
      playerId: socket.id,
      monsterKillCount,
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

export default monsterKillCountHandler;
