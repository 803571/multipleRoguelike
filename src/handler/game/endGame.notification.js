import { PACKET_ID } from '../../configs/constants/packetId.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { getDungeonSession, getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { POINTS_PLAYER_KILL, POINTS_MONSTER_KILL } from '../../configs/constants/game.js'; // 상수 가져오기

const endGameNotification = async (playerId) => {
  const redisUser = await findCharacterByUserId(playerId);
  const dungeon = getDungeonSession(redisUser.sessionId); // 해당 던전 세션 조회
  const players = dungeon.getAllUsers(); // 현재 던전의 모든 플레이어 가져오기

  // 넥서스를 부신 플레이어 찾기
  const nexusDestroyer = players.find((player) => player.id === playerId);

  // 순위 매기기
  const rankedPlayers = players.map((player) => ({
    playerId: player.id,
    userKillCount: player.userKillCount, // 유저 킬 카운트 추가
    monsterKillCount: player.monsterKillCount, // 몬스터 킬 카운트 추가
    score:
      player.userKillCount * POINTS_PLAYER_KILL + player.monsterKillCount * POINTS_MONSTER_KILL, // 점수 계산
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
      gameInfo: rankedPlayers.map((player) => ({
        playerId: player.playerId,
        playerRank: player.rank,
        userKillCount: player.userKillCount,
        monsterKillCount: player.monsterKillCount,
        score: player.score,
      })),
    };

    createNotificationPacket(PACKET_ID.S_GameEnd, payload, dungeonUsersUUID);
  }
};

export default endGameNotification;
