import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonSession, getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import handleError from '../../utils/error/errorHandler.js';
import deathPlayerNotification from '../game/deathPlayer.notification.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';
import playerKillCountNotification from '../game/playerKillCount.notification.js';
import updatePlayerHpNotification from '../game/updatePlayerHp.notification.js';
import Result from '../result.js';
// message C_HitPlayer {
//   int32 playerId = 1;  // 파격자 ID
//   int32 damage = 2;    // 데미지
// }

// // 플레이어 공격 알림
// message S_HitPlayer {
//   int32 playerId = 1;  // 피격자 ID
//   int32 damage = 2;    // 데미지
// }import playerKillCountNotification from '../game/playerKillCount.notification.js';

const hitPlayerHandler = async (socket, payload) => {
  const responses = []; // 모든 응답을 저장할 배열
  try {
    const { playerId, damage } = payload;

    // 여기의 소켓은 공격자, playerId는 피격자.
    // 맞은 사람이 클라이언트에서 히트 처리 패킷 보냄
    const redisUser = await findCharacterByUserId(playerId);
    const dungeon = getDungeonSession(redisUser.sessionId);
    const allUsers = dungeon.getAllUsers(); // 공격자의 세션에서 모든 사용자 UUID 가져오기
    const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId); // dungeonUsersUUID 가져오기

    const currentHp = dungeon.damagedUser(playerId, damage);

    if (currentHp <= 0) {
      const attacker = dungeon.getDungeonUser(socket.id);
      const healAmount = Math.floor(attacker.statsInfo.stats.maxHp * 0.5);
      attacker.currentHp = Math.min(
        attacker.currentHp + healAmount,
        attacker.statsInfo.stats.maxHp,
      );

      // 플레이어 회복 시 보내주는 updatePlayerHp
      await updatePlayerHpNotification(socket, attacker.id, attacker.currentHp);

      // 플레이어 처치 알림
      attacker.killCount = (attacker.killCount || 0) + 1; // 처치 수 증가
      await playerKillCountNotification(attacker.id, attacker.killCount); // 올바른 호출 방식
    }

    // updatePlayerHp 노티피케이션
    if (currentHp <= 0) deathPlayerNotification(socket, playerId);

    const response = {
      playerId,
      damage,
    };

    responses.push(new Result(response, PACKET_ID.S_HitPlayer, dungeonUsersUUID)); // dungeonUsersUUID 사용
  } catch (err) {
    handleError(socket, err);
  }

  return responses; // 모든 응답을 반환
};

export default hitPlayerHandler;
