import { PACKET_ID } from '../../configs/constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
import createResponse from '../../utils/packet/createResponse.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';
import { getGameAssets } from '../../init/loadAsset.js';
import revivePlayerNotification from './revivePlayer.notification.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';

// message S_DeathPlayer { ★
//     int32 playerId = 1;
//     float spawnTime = 2;
//     }
const deathPlayerNotification = async (socket, playerId) => {
  try {
    const redisUser = await findCharacterByUserId(playerId);
    const dungeon = getDungeonSession(redisUser.sessionId);
    const allUsers = dungeon.getAllUsers();

    const userLevel = dungeon.getUserStats(playerId).stats.level;
    // const playerLevel = redisUser.level;

    const spawnTimeAssets = getGameAssets().spawnTimeInfo;
    const spawnTime = spawnTimeAssets[userLevel];

    const response = createResponse(PACKET_ID.S_DeathPlayer, { playerId, spawnTime });

    allUsers.forEach((value) => {
      value.socket.write(response);
    });

    setTimeout(() => {
      revivePlayerNotification(socket, playerId);
    }, spawnTime * 1000); // spawnTime은 초 단위, 밀리초로 변환
  } catch (err) {
    handleError(socket, err);
  }
};

export default deathPlayerNotification;
