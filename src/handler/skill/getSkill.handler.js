import createResponse from '../../utils/response/createResponse.js';
import { PACKET_ID } from '../../constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
import { getGameAssets } from '../../init/loadAsset.js';
import { getRedisUserById } from '../../sessions/redis/redis.user.js';
import { getDungeonSession } from '../../sessions/dungeon.session.js';

const getSkillHandler = async (socket, payload) => {
  try {
    const { skillId } = payload;

    const redisUser = await getRedisUserById(socket.id);
    const dungeon = getDungeonSession(redisUser.sessionId);
    const allUsers = dungeon.getAllUsers();

    const skillData = getGameAssets().skillInfo.data;
    const curSkill = skillData.find((id) => id.skillId === skillId);
    const skillInfo = {
      skillId,
      damageRate: curSkill.damageRate,
      coolTime: curSkill.coolTime,
    };

    const response = createResponse(PACKET_ID.S_GetSkill, { skillInfo });

    allUsers.forEach((value) => {
      value.socket.write(response);
    });
    socket.write(response);
  } catch (err) {
    handleError(socket, err);
  }
};

export default getSkillHandler;