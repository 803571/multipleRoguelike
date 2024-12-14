import { PACKET_ID } from '../../configs/constants/packetId.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { getDungeonSession, getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import { POINTS_PLAYER_KILL, POINTS_MONSTER_KILL } from '../../configs/constants/game.js';

const endGameNotification = async (playerId) => {
  const redisUser = await findCharacterByUserId(playerId);
  const dungeon = getDungeonSession(redisUser.sessionId);
  const players = dungeon.getAllUsers();

  // 순위 매기기
  const rankedPlayers = players.map((player) => ({
    playerId: player.id,
    userKillCount: player.userKillCount,
    monsterKillCount: player.monsterKillCount,
    score:
      player.userKillCount * POINTS_PLAYER_KILL + player.monsterKillCount * POINTS_MONSTER_KILL,
    rank: 0, // 초기화
  }));

  // 넥서스를 파괴한 플레이어를 1등으로 설정
  const nexusDestroyer = rankedPlayers.find((p) => p.playerId === playerId);
  if (nexusDestroyer) {
    nexusDestroyer.rank = 1;
  }

  // 나머지 플레이어의 순위 매기기
  const sortedPlayers = rankedPlayers
    .filter((p) => p.rank === 0) // 1등이 아닌 플레이어들
    .sort((a, b) => b.score - a.score); // 점수 기준으로 내림차순 정렬

  let currentRank = 2; // 1등은 이미 부여됨
  for (const player of sortedPlayers) {
    player.rank = currentRank++;
  }

  // 최종적으로 rank에 따라 정렬
  rankedPlayers.sort((a, b) => a.rank - b.rank);

  // 게임 종료 알림이었지만 일단 순위표 생성 및 전송
  const payload = {
    gameInfo: rankedPlayers.map((player) => ({
      playerId: player.playerId,
      playerRank: player.rank,
      userKillCount: player.userKillCount,
      monsterKillCount: player.monsterKillCount,
      score: player.score,
    })),
  };

  const dungeonUsersUUID = getDungeonUsersUUID(redisUser.sessionId);
  createNotificationPacket(PACKET_ID.S_GameEnd, payload, dungeonUsersUUID);
};

export default endGameNotification;
