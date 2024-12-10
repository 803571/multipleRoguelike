import Dungeon from '../classes/model/dungeon.class.js';
import { getGameAssets } from '../init/loadAsset.js';
import { dungeonSessions } from './sessions.js';

const addDungeonSession = (sessionId, dungeonLevel) => {
  if (dungeonSessions.has(sessionId)) {
    throw new Error('세션 중복');
  }

  // 일단 1 ~ 2 던전 중 하나
  const dungeonCode = Math.floor(Math.random() * 2) + 1;

  const gameAssets = getGameAssets().dungeonInfo;
  const dungeonInfos = gameAssets.dungeons.find(
    (dungeonInfo) => dungeonInfo.dungeonId === dungeonCode,
  );

  if (!dungeonInfos) {
    throw new Error('던전 정보가 존재하지 않습니다.');
  }

  const dungeon = new Dungeon(dungeonInfos, dungeonLevel);
  dungeonSessions.set(sessionId, dungeon);

  return dungeon;
};

const getDungeonUsersUUID = (dungeonId) => {
  const session = getDungeonSession(dungeonId);
  return session.getAllUsers().array.forEach((user) => user.socket.UUID);
};

const getDungeonSession = (dungeonId) => {
  const session = dungeonSessions.get(dungeonId);
  if (!session) {
    throw new Error(`던전 세션이 존재하지 않습니다.`);
  }

  return session;
};

const removeDungeonSession = (dungeonId) => {
  if (!dungeonSessions.has(dungeonId)) {
    throw new Error(`던전 세션이 존재하지 않습니다.`);
  }

  return dungeonSessions.delete(dungeonId);
};

const getDungeonSessions = () => {
  return dungeonSessions;
};

export {
  addDungeonSession,
  getDungeonSession,
  removeDungeonSession,
  getDungeonSessions,
  getDungeonUsersUUID,
};
