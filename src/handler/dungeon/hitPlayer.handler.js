import { PACKET_ID } from '../../configs/constants/packetId.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import createResponse from '../../utils/packet/createResponse.js';
import handleError from '../../utils/error/errorHandler.js';
import deathPlayerNotification from '../game/deathPlayer.notification.js';
// message C_HitPlayer {
//   int32 playerId = 1;  // 파격자 ID
//   int32 damage = 2;    // 데미지
// }
// // 플레이어 공격 알림
// message S_HitPlayer {
//   int32 playerId = 1;  // 피격자 ID
//   int32 damage = 2;    // 데미지
//
const hitPlayerHandler = async (socket, payload) => {
  const { playerId, damage } = payload;
  let success = true;
  let message = undefined;
  try {
    // 여기의 소켓은 공격자, playerId는 피격자.
    // 맞은 사람이 클라이언트에서 히트 처리 패킷 보냄
    const redisUser = await getRedisUserById(playerId);
    const dungeon = getDungeonSession(redisUser.sessionId);
    const allUsers = dungeon.getAllUsers();
    // 플레이어가 플레이어를 잡으면 피회복을 하는 로직
    // const victim = dungeon.getDungeonUser(playerId);
    const currentHp = dungeon.damagedUser(playerId, damage);

    if (currentHp <= 0) {
      const attacker = dungeon.getDungeonUser(socket.id);
      const healAmount = Math.floor(attacker.statsInfo.stats.maxHp * 0.5);
      attacker.currentHp = Math.min(
        attacker.currentHp + healAmount,
        attacker.statsInfo.stats.maxHp,
      );
      // 플레이어 회복 시 보내주는 updatePlayerHp

      const updateAttackerHpResponse = createResponse(PACKET_ID.S_UpdatePlayerHp, {
        playerId: attacker.id,
        hp: currentHp,
      });

      allUsers.forEach((value) => {
        value.socket.write(updateAttackerHpResponse);
      });
      message = '플레이어가 사망';
      deathPlayerNotification(socket, playerId);
    } else {
      message = '플레이어에게 데미지를 성공적으로 입혔습니다.';
    }

    // updatePlayerHp 노티피케이션
    const updatePlayerHpResponse = createResponse(PACKET_ID.S_UpdatePlayerHp, {
      playerId,
      hp: currentHp,
    });

    const response = createResponse(PACKET_ID.S_HitPlayer, { playerId, damage });

    allUsers.forEach((value) => {
      value.socket.write(response);
      value.socket.write(updatePlayerHpResponse);
    });
  } catch (err) {
    success = false;
    message = 'hitPlayer에서 문제가 발생해버린';
    handleError(socket, err);
  }
  return { success, message };
};

export default hitPlayerHandler;
// import { PACKET_ID } from '../../configs/constants/packetId.js';
// import { getDungeonSession } from '../../sessions/dungeon.session.js';
// import { getRedisUserById } from '../../sessions/redis/redis.user.js';
// import createResponse from '../../utils/packet/createResponse.js';
// import handleError from '../../utils/error/errorHandler.js';
// import deathPlayerNotification from '../game/deathPlayer.notification.js';

// // message C_HitPlayer {
// //   int32 playerId = 1;  // 파격자 ID
// //   int32 damage = 2;    // 데미지
// // }

// // // 플레이어 공격 알림
// // message S_HitPlayer {
// //   int32 playerId = 1;  // 피격자 ID
// //   int32 damage = 2;    // 데미지
// // }

// const hitPlayerHandler = async (socket, payload) => {
//   const { playerId, damage } = payload;
//   let success = true;
//   let message = undefined;
//   try {
//     // 여기의 소켓은 공격자, playerId는 피격자.
//     // 맞은 사람이 클라이언트에서 히트 처리 패킷 보냄
//     const redisUser = await getRedisUserById(playerId);
//     const dungeon = getDungeonSession(redisUser.sessionId);
//     const allUsers = dungeon.getAllUsers();
//     // 플레이어가 플레이어를 잡으면 피회복을 하는 로직
//     // const victim = dungeon.getDungeonUser(playerId);
//     const currentHp = dungeon.damagedUser(playerId, damage);

//     if (currentHp <= 0) {
//       const attacker = dungeon.getDungeonUser(socket.id);
//       const healAmount = Math.floor(attacker.statsInfo.stats.maxHp * 0.5);
//       attacker.currentHp = Math.min(
//         attacker.currentHp + healAmount,
//         attacker.statsInfo.stats.maxHp,
//       );
//       // 플레이어 회복 시 보내주는 updatePlayerHp

//       const updateAttackerHpResponse = createResponse(PACKET_ID.S_UpdatePlayerHp, {
//         playerId: attacker.id,
//         hp: currentHp,
//       });

//       allUsers.forEach((value) => {
//         value.socket.write(updateAttackerHpResponse);
//       });
//     }

//     // updatePlayerHp 노티피케이션
//     const updatePlayerHpResponse = createResponse(PACKET_ID.S_UpdatePlayerHp, {
//       playerId,
//       hp: currentHp,
//     });
//     if (currentHp <= 0) deathPlayerNotification(socket, playerId);

//     const response = createResponse(PACKET_ID.S_HitPlayer, { playerId, damage });

//     allUsers.forEach((value) => {
//       value.socket.write(response);
//       value.socket.write(updatePlayerHpResponse);
//     });
//   } catch (err) {
//     handleError(socket, err);
//   }
// };

// export default hitPlayerHandler;
