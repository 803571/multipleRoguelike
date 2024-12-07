import handleError from '../../utils/error/errorHandler.js';
import { createCharacter, findCharacterByUserId } from '../../db/model/characters.db.js';
import { addRedisUser } from '../../sessions/redis/redis.user.js';
import User from '../../classes/model/user.class.js';
import { addUserSession } from '../../sessions/user.session.js';
import enterLogic from '../../utils/etc/enter.logic.js';

const enterHandler = async (socket, payload) => {
  try {
    const user = new User(socket.id, payload.class, payload.nickname);

    await addRedisUser(user);
    addUserSession(socket, user);

    const character = await findCharacterByUserId(parseInt(socket.id));
    if (!character) {
      // sql에서 gold default 선언해서 만들면 gold 입력 빼도 됨
      await createCharacter(user.id, user.nickname, user.myClass, 0);
    }

    await enterLogic(socket, user);
  } catch (e) {
    handleError(socket, e);
  }
};

export default enterHandler;
