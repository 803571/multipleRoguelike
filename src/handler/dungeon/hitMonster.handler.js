import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonSession, getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import monsterKillNotification from '../monster/monsterKill.notification.js';
import Result from '../result.js';
import updateMonsterHpNotification from '../monster/updateMonsterHp.notification.js';
import logger from '../../utils/logger.js';

// message C_HitMonster{
//     int32 monsterId = 1;  // 플레이어 ID
import monsterKillNotification from '../monster/monsterKill.notification.js';
//     int32 damage = 2;    // 데미지
//   }

const hitMonsterHandler = async ({ socket, payload }) => {
  try {
    const { monsterId, damage } = payload;
    if (Number.isInteger(monsterId) == false || Number.isNaN(damage)) {
      logger.warn(
        `hitMonsterHandler. ${socket.id}에서 요청했으나 잘못된 규격으로 전송함. monsterId : ${monsterId}, damage : ${damage}`,
      );
      return;
    }
    const redisUser = await getRedisUserById(socket.id);
    if (redisUser == null) {
      logger.warn(`hitMonsterHandler. ${socket.id}를 Redis에서 찾을 수 없음`);
      return;
    }

    const allUsers = getDungeonUsersUUID(redisUser.sessionId);

    const dungeon = getDungeonSession(redisUser.sessionId);
    dungeon.damageMonster(socket.id, monsterId, damage);

    const monster = dungeon.monsterLogic.getMonsterById(monsterId);

    const targetYou = dungeon.getDungeonUser(socket.id);

    const currentHp = monster.hit(damage, targetYou);

    await updateMonsterHpNotification(socket, { monsterId, currentHp }, allUsers);

    if (currentHp <= 0) {
      await monsterKillNotification(socket, redisUser, {
        monsterId: monster.id,
        transform: monster.transform,
      });
    }
  } catch (err) {
    logger.error(`hitMonsterHandler. ${err.message}`);
    return;
  }
  return new Result({ monsterId, damage }, PACKET_ID.S_HitMonster);
};
export default hitMonsterHandler;
