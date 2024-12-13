import { PACKET_ID } from '../../configs/constants/packetId.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';

/*
message S_PlayerKillCount {
    int32 playerId = 1;        // 플레이어 ID
    int32 playerKillCount = 2; // 플레이어 처치 수
}
*/

const playerKillCountNotification = async (socket, playerId) => {
  const redisUser = await findCharacterByUserId(playerId);
  const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);

  // 유저 정보 가져오기
  const attacker = await findCharacterByUserId(playerId);
  attacker.userKillCount++; // 유저 킬 카운트 증가

  const payload = {
    playerId,
    playerKillCount: attacker.userKillCount, // 플레이어 처치 수 포함
  };

  createNotificationPacket(PACKET_ID.S_PlayerKillCount, payload, dungeonUsersUUID);
};

export default playerKillCountNotification;
