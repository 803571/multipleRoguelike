import { PACKET_ID } from '../../constants/packetId.js';
import { addDungeonSession } from '../../sessions/dungeon.session.js';
import { getRedisParty, removeRedisParty } from '../../sessions/redis/redis.party.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getUserSessionById } from '../../sessions/user.session.js';
import handleError from '../../utils/error/errorHandler.js';
import createResponse from '../../utils/response/createResponse.js';

// message S_EnterDungeon {
//   DungeonInfo dungeonInfo = 1;    // 던전 정보 (추후 정의 예정)
//   repeated PlayerInfo player = 2; // 플레이어 정보 (추후 정의 예정)
//   string infoText = 3;            // 화면에 표시할 텍스트 (옵션)
// }

// message DungeonInfo {
//     int32 dungeonCode = 1;    // 던전 코드
//     repeated int32 stageList = 2; // 스테이지 셔플 된 아이디 리스트
// }

// **StatInfo** - 플레이어의 상세 스탯 정보
// message StatInfo {
//   int32 level = 1;                 // 플레이어 레벨
//   float hp = 2;                    // 현재 체력
//   float maxHp = 3;                 // 최대 체력
//   float mp = 4;                    // 현재 마나
//   float maxMp = 5;                 // 최대 마나
//   float atk = 6;                   // 공격력
//   float def = 7;                   // 방어력
//   float speed = 8;                 // 속도
//   float criticalProbability = 9;   // 크리티컬 확률
//   float criticalDamageRate = 10;   // 크리티컬 데미지 비율
// }

// // **TransformInfo** - 위치 및 회전 정보
// message TransformInfo {
//   float posX = 1;   // X 좌표 (기본값 : -9 ~ 9)
//   float posY = 2;   // Y 좌표 (기본값 : 1)
//   float posZ = 3;   // Z 좌표 (기본값 : -8 ~ 8)
//   float rot = 4;    // 회전 값 (기본값 : 0 ~ 360)
// }

// message PlayerInfo {
//     int32 playerId = 1;             // 플레이어 고유 식별 코드
//     string nickname = 2;            // 플레이어 닉네임
//     int32 class = 3;                // 플레이어 클래스
//     TransformInfo transform = 4;
//     StatInfo statInfo = 5;          // 플레이어 스탯 정보
// }

const dungeonStartHandler = async (socket, payload) => {
  try {
    const { dungeonLevel, roomId } = payload;

    // 파티 세션
    const party = await getRedisParty(roomId);
    // 던전 세션 생성 - dungeonLevel = dungeonId = dungeonCode ???
    const dungeon = addDungeonSession(dungeonLevel);

    const partyPayload = {
      playerId: parseInt(party.owner),
      roomId,
    };

    const partyResponse = createResponse(PACKET_ID.S_PartyLeave, partyPayload);

    const stageList = dungeon.getStageIdList();
    const dungeonInfo = {
      dungeonCode: dungeonLevel,
      stageList,
    };

    const infoText = '던전에 입장하셨습니다!';

    // 임시 스탯
    const statInfo = {
      level: 1, // 플레이어 레벨
      hp: 10.0, // 현재 체력
      maxHp: 10.0, // 최대 체력
      mp: 10.0, // 현재 마나
      maxMp: 10.0, // 최대 마나
      atk: 1.0, // 공격력
      def: 1.0, // 방어력
      speed: 1.0, // 속도
      criticalProbability: 10.0, // 크리티컬 확률
      criticalDamageRate: 10.0, // 크리티컬 데미지 비율
    };

    // 파티원 모두의 정보를 전송할 때
    const playerInfo = await Promise.all(
      party.members.map(async (memberId) => {
        const userRedis = await getRedisUserById(memberId);
        return {
          playerId: parseInt(memberId),
          nickname: userRedis.nickname,
          class: parseInt(userRedis.myClass),
          transform: { posX: 0, posY: 0, posZ: 0, rot: 0 },
          statInfo,
        };
      }),
    );

    party.members.forEach(async (memberId) => {
      const userSession = getUserSessionById(memberId);
      if (userSession) {
        // 파티 탈퇴(파티 제거)
        userSession.socket.write(partyResponse);
        // 던전 세션 유저 추가
        dungeon.addDungeonUser(userSession);

        /* 각자 정보를 전송할 때
        const userRedis = await getRedisUserById(memberId);
        // 임시 플레이어 정보
        const playerInfo = {
          playerId: parseInt(memberId),
          nickname: userRedis.nickname,
          class: userRedis.myClass,
          transform: { posX: 0, posY: 0, posZ: 0, rot: 0 },
          statInfo,
        };
        */

        const enterDungeonPayload = {
          dungeonInfo,
          playerInfo,
          infoText,
        };

        const enterDungeonResponse = createResponse(PACKET_ID.S_EnterDungeon, enterDungeonPayload);
        // 던전 유저 진입
        userSession.socket.write(enterDungeonResponse);
      }
    });

    // 파티 세션 삭제
    await removeRedisParty(roomId);
  } catch (e) {
    handleError(socket, e);
  }
};

export default dungeonStartHandler;
