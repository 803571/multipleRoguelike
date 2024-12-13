import { PACKET_ID } from '../../configs/constants/packetId.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';

/*
message S_GameEnd {
    int32 playerRank = 1;        // 플레이어 순위
    int32 userKillCount = 2;     // 유저 처치 수
    int32 monsterKillCount = 3;   // 몬스터 처치 수
    int32 score = 4;              // 총 점수
}
*/

const endGameNotification = async (socket, players) => {
  try {
    // 넥서스를 부신 플레이어 찾기
    const nexusDestroyer = players.find((player) => player.destroyedNexus);

    // 순위 매기기
    const rankedPlayers = players.map((player) => ({
      playerId: player.id,
      userKillCount: player.userKillCount, // 유저 킬 카운트 추가
      monsterKillCount: player.monsterKillCount, // 몬스터 킬 카운트 추가
      score: player.userKillCount * 5 + player.monsterKillCount * 1, // 점수 계산
      rank: 0, // 초기화
    }));

    // 넥서스를 부신 플레이어를 1등으로 설정
    if (nexusDestroyer) {
      rankedPlayers.find((p) => p.playerId === nexusDestroyer.id).rank = 1;
    }

    // 나머지 플레이어의 순위 매기기
    const sortedPlayers = rankedPlayers
      .filter((p) => p.rank === 0) // 1등이 아닌 플레이어들
      .sort((a, b) => b.score - a.score); // 점수 기준으로 내림차순 정렬

    // 순위 부여
    let currentRank = 2; // 1등은 이미 부여됨
    for (const player of sortedPlayers) {
      player.rank = currentRank++;
    }

    // 각 플레이어에게 개별적으로 알림 전송
    for (const player of rankedPlayers) {
      const redisUser = await findCharacterByUserId(player.playerId);
      const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);

      const payload = {
        playerRank: player.rank,
        userKillCount: player.userKillCount, // 유저 킬 카운트 포함
        monsterKillCount: player.monsterKillCount, // 몬스터 킬 카운트 포함
        score: player.score, // 점수 포함
      };

      createNotificationPacket(PACKET_ID.S_GameEnd, payload, dungeonUsersUUID);
    }
  } catch (err) {
    console.error('게임 종료 알림 중 오류 발생:', err);
  }
};

export default endGameNotification;
