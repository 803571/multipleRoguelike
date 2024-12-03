import createResponse from '../../utils/response/createResponse.js';
import { PACKET_ID } from '../../constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
import { getGameAssets } from '../../init/loadAsset.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';

// 패킷명세
// message S_MonsterKill {
//   int32 monsterId = 1; // 몬스터 식별 ID
//   int32 itemId = 2;
//   int32 skillId = 3;
//   TransformInfo transform = 4;
// }
// message TransformInfo {
//   float posX = 1;   // X 좌표 (기본값 : -9 ~ 9)
//   float posY = 2;   // Y 좌표 (기본값 : 1)
//   float posZ = 3;   // Z 좌표 (기본값 : -8 ~ 8)
//   float rot = 4;    // 회전 값 (기본값 : 0 ~ 360)
// }

const monsterKillNotification = async (socket, payload) => {
  try {
    const { monsterId, transform } = payload;

    const gameAssets = getGameAssets();
    const itemAssets = gameAssets.item.data;
    const item = itemAssets[Math.floor(Math.random() * itemAssets.length)];
    const itemId = item.itemId;      

    const skillAssets = gameAssets.skillInfo.data;
    const skill = skillAssets[Math.floor(Math.random() * skillAssets.length)];
    const skillId = skill.skillId;
    
    const monsterKillPayload = {
      monsterId,
      itemId,
      skillId,
      transform,
    };
    
    const response = createResponse(PACKET_ID.S_MonsterKill, monsterKillPayload);    

    const redisUser = await getRedisUserById(socket.id);
    const dungeon = getDungeonSession(redisUser.sessionId);
    const allUsers = dungeon.getAllUsers(); 

    allUsers.forEach((value) => {
        value.socket.write(response)
    });
    
  } catch (e) {
    handleError(socket, e);
  }
};

export default monsterKillNotification;