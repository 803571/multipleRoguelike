import Dungeon from '../classes/model/dungeon.class.js';
import { getGameAssets } from '../init/loadAsset.js';
import { dungeonSessions } from './sessions.js';
import logger from '../utils/logger.js';

const addDungeonSession = (sessionId, dungeonLevel) => {
  if (dungeonSessions.has(sessionId)) {
    logger.error('세션 중복');
    return null;
  }

  const dungeonCode = 1;

  const dungeonAssets = getGameAssets().dungeonInfo; // 맵핑된 던전 데이터 가져오기
  const dungeonInfo = dungeonAssets[dungeonCode]; // ID로 바로 접근

  if (!dungeonInfo) {
    logger.error(`던전 정보를 찾을 수 없습니다. dungeonCode: ${dungeonCode}`);
    return null;
  }
  dungeonInfo.dungeonId = sessionId;
  const dungeon = new Dungeon(dungeonInfo, dungeonLevel);
  dungeonSessions.set(sessionId, dungeon);

  return dungeon;
};

export const findDungeonByUserId = (userId) => {
  let result = null;
  for (const [_, dungeon] of dungeonSessions.entries()) {
    if (dungeon.users.has(userId)) {
      result = dungeon;
      break;
    }
  }
  return result;
};

const getDungeonSession = (dungeonId) => {
  return dungeonSessions.get(dungeonId);
};

const getDungeonUsersUUID = (dungeonId) => {
  const dungeon = getDungeonSession(dungeonId);
  return dungeon.usersUUID;
};

const removeDungeonSession = (dungeonId) => {
  const dungeon = dungeonSessions.get(dungeonId);
  if (!dungeon) {
    logger.error(`던전 세션이 존재하지 않습니다.`);
    return;
  }
  return dungeonSessions.delete(dungeonId);
};

const getStatsByUserClass = (userClass) => {
  const classAssets = getGameAssets().classInfo;
  const classInfos = classAssets[userClass];

  if (!classInfos) {
    logger.error(`Class 정보를 찾을 수 없습니다. classId: ${userClass}`);
    return null;
  }

  const expAssets = getGameAssets().expInfo;
  const expInfos = expAssets[1];

  if (!expInfos) {
    logger.error('레벨 1의 경험치 정보를 찾을 수 없습니다.');
    return null;
  }

  return {
    level: 1,
    stats: classInfos.stats,
    exp: 0,
    maxExp: expInfos.maxExp,
  };
};

export {
  addDungeonSession,
  getDungeonSession,
  removeDungeonSession,
  getDungeonUsersUUID,
  getStatsByUserClass,
};
