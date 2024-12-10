import createResponse from '../../utils/packet/createResponse.js';
import { PACKET_ID } from '../../configs/constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
import { getGameAssets } from '../../init/loadAsset.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getDungeonSession, getDungeonUsersUUID } from '../../sessions/dungeon.session.js';
import levelUpNotification from '../game/levelUp.notification.js';
import configs from '../../configs/configs.js';
import createNotificationPacket from '../../utils/notification/createNotification.js';
import { enqueueSend } from '../../utils/socket/messageQueue.js';

const { ITEM_DROP_RATE, SKILL_DROP_RATE } = configs;

// 패킷명세
// message S_MonsterKill {
//   int32 monsterId = 1; // 몬스터 식별 ID
//   int32 itemId = 2;
//   int32 playerId = 3;
//   int32 skillId = 4;
//   TransformInfo transform = 5;
//   float exp = 6;
// }
// message TransformInfo {
//   float posX = 1;   // X 좌표 (기본값 : -9 ~ 9)
//   float posY = 2;   // Y 좌표 (기본값 : 1)
//   float posZ = 3;   // Z 좌표 (기본값 : -8 ~ 8)
//   float rot = 4;    // 회전 값 (기본값 : 0 ~ 360)
// }
// **StatInfo** - 플레이어의 상세 스탯 정보
// message StatInfo {
//   int32 level = 1;                 // 플레이어 레벨
//   Stats stats = 2;
//   float exp = 3;                   // 경험치
//   float maxExp = 4;
// }

// message S_GetExp { ★
//   int32 playerId = 1;
//   int32 expAmount = 2;
//   }

//기본 경험치 상수
const MONSTER_EXP = 110; // 몬스터 처치 시 얻는 기본 경험치

let itemInstanceId = 0;

const monsterKillNotification = async (socket, redisUser, payload) => {
  try {
    const { monsterId, transform } = payload;
    const playerId = socket.id;

    const gameAssets = getGameAssets();
    const itemAssets = gameAssets.item.data;
    const skillAssets = gameAssets.skillInfo.data;

    let itemId = -1;
    let skillId = -1;

    // 50%
    const totalDropRate = ITEM_DROP_RATE + SKILL_DROP_RATE;
    const drop = Math.random();

    if (drop < totalDropRate) {
      if (drop < ITEM_DROP_RATE) {
        const item = itemAssets[Math.floor(Math.random() * itemAssets.length)];
        itemId = item.itemId;
      } else {
        const skill = skillAssets[Math.floor(Math.random() * skillAssets.length)];
        skillId = skill.skillId;
      }
    }

    const monsterKillPayload = {
      monsterId,
      itemId,
      itemInstanceId: itemId === -1 && skillId === -1 ? -1 : itemInstanceId++,
      playerId,
      skillId,
      transform,
    };
    const dungeon = getDungeonSession(redisUser.sessionId);
    const dungeonUser = dungeon.getDungeonUser(socket.id);

    // 레벨당 필요 경험치 불러오기
    const expInfo = gameAssets.expInfo.data;
    const userLevel = dungeonUser.statsInfo.stats.level;
    const maxExp = expInfo.find((id) => id.level === userLevel).maxExp;

    // 경험치 증가
    const curExp = dungeon.addUserExp(playerId, MONSTER_EXP);

    const expResponse = createResponse(PACKET_ID.S_GetExp, {
      playerId,
      expAmount: curExp,
    });

    // 레벨업 체크
    if (curExp >= maxExp) {
      //레벨업 알림
      await levelUpNotification(socket);
      //경험치 초기화
      dungeonUser.statsInfo.exp = curExp - maxExp;
    }

    createNotificationPacket(
      PACKET_ID.S_MonsterKill,
      monsterKillPayload,
      getDungeonUsersUUID(redisUser.sessionId),
    );
    enqueueSend(socket.UUID, expResponse);
  } catch (e) {
    handleError(socket, e);
  }
};

export default monsterKillNotification;

// 유저한테 레벨당 maxExp가 있고, ( 유저에게 curExp랑 maxExp가 있어야함)
// 몬스터 킬 noti에서 고정 exp를 주고,
// maxExp를 넘어가면 레벨업을 보낸다 (S_LevelUp)

// **StatInfo** - 플레이어의 상세 스탯 정보
// message StatInfo {
//   int32 level = 1;                 // 플레이어 레벨
//   Stats stats = 2;
//   float exp = 3;                   // 경험치
//   float maxExp = 4;
// }
