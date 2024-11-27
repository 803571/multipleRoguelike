import { PACKET_ID } from '../../constants/packetId.js';
import { getRedisUsers } from '../../sessions/redis/redis.user.js';
import { getUserSessions, getUserTransformById } from '../../sessions/user.session.js';
import createNotificationPacket from '../notification/createNotification.js';
import createResponse from '../response/createResponse.js';

// message S_Enter {
//     PlayerInfo player = 1;      // 플레이어 정보 (추후 정의 예정)
// }
// message S_Spawn {
//     repeated PlayerInfo players = 1; // 스폰되는 플레이어 리스트 (추후 정의 예정)
// }

const enterLogic = async (socket, user) => {
  const playerPayload = {
    playerId: user.id,
    nickname: user.nickname,
    class: user.myClass,
    transform: getUserTransformById(user.id),
  };

  const response = createResponse(PACKET_ID.S_Enter, { player: playerPayload });
  socket.write(response);

  const users = await getRedisUsers();
  const userSessions = getUserSessions();

  // 모든 유저들에게 현재 접속 중인 유저 정보 전송
  for (const [key, value] of userSessions) {
    const otherUserPayload = {
      players: [
        ...users
          .filter((player) => player.id !== key)
          .map((player) => ({
            playerId: parseInt(player.id),
            nickname: player.nickname,
            class: parseInt(player.myClass),
            transform: getUserTransformById(player.id),
          })),
      ],
    };

    if (otherUserPayload.players.length === 0) {
      continue;
    }

    const otherUsernotification = createNotificationPacket(PACKET_ID.S_Spawn, otherUserPayload);
    value.socket.write(otherUsernotification);
  }

  for (const [key, value] of userSessions) {
    console.log('key: ', key);
  }

  userSessions.forEach((u) => {
    const chatPayload = {
      playerId: user.id,
      chatMsg: `${user.nickname}님이 게임에 입장하셨습니다!`,
    };

    u.socket.write(createResponse(PACKET_ID.S_Chat, chatPayload));
  });
};

export default enterLogic;
