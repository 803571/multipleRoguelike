import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';
import { getUserById } from '../../sessions/user.session.js';
import handleError from '../../utils/error/errorHandler.js';
import logger from '../../utils/logger.js';
import Result from '../result.js';

const attackedNexusHandler = async ({ socket, payload }) => {
  const { damage } = payload;
  try {
    if (damage <= 0) {
      logger.info(
        `attackedNexusHandler: 유저가 공격한 데미지가 비정상적인 데미지 입니다. damage : ${damage}.`,
      );
      return;
    }

    const playerId = socket.id;

    const user = getUserById(playerId);
    if (!user) {
      logger.error('HitMonsterHandler: User not found.');
      return;
    }

    const dungeonId = user.dungeonId;
    const dungeon = getDungeonSession(dungeonId);
    if (dungeon.attackedNexus(damage)) {
      logger.error(`attackedNexus: nexus can not exist in ${dungeonId}`);
      return;
    }

    return new Result({ playerId, damage }, PACKET_ID.S_AttackedNexus, dungeon.usersUUID);
  } catch (error) {
    handleError(socket, error);
  }
};

export default attackedNexusHandler;
