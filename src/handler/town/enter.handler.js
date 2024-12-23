import handleError from '../../utils/error/errorHandler.js';
import { createCharacter, findCharacterByUserId } from '../../db/model/characters.db.js';
import enterLogic from '../../utils/etc/enter.logic.js';

const enterHandler = async ({ socket, payload }) => {
  try {
    const nickname = payload.nickname;
    const userClass = payload.class;

    const character = await findCharacterByUserId(socket.id);
    if (character == null) {
      // sql에서 gold default 선언해서 만들면 gold 입력 빼도 됨
      await createCharacter(socket.id, nickname, userClass, 0);
    }
    await enterLogic(socket, { id: socket.id, nickname, myClass: userClass });
  } catch (e) {
    handleError(socket, e);
  }
};

export default enterHandler;
