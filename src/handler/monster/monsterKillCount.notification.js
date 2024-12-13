import { PACKET_ID } from '../../configs/constants/packetId.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';

const monsterKillCountNotification = async (socket, playerId) => {
  const redisUser = await findCharacterByUserId(playerId);
  const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);

  // 몬스터 처치 수 증가
  const attacker = await findCharacterByUserId(playerId);
  attacker.monsterKillCount++;

  const payload = {
    playerId,
    monsterKillCount: attacker.monsterKillCount,
  };

  createNotificationPacket(PACKET_ID.S_MonsterKillCount, payload, dungeonUsersUUID);
};

export default monsterKillCountNotification;
