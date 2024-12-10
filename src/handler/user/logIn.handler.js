import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PACKET_ID } from '../../configs/constants/packetId.js';
import { findUserByAccount } from '../../db/model/user.db.js';
import { findCharacterByUserId } from '../../db/model/characters.db.js';
import { addRedisUser } from '../../sessions/redis/redis.user.js';
import { addUserSession } from '../../sessions/user.session.js';
import enterLogic from '../../utils/etc/enter.logic.js';
import configs from '../../configs/configs.js';
import logger from '../../utils/logger.js';
import Result from '../result.js';

const { JWT_SECRET, JWT_EXPIRES_IN, JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE } = configs;

function isTokenValid(token) {
  try {
    jwt.verify(token, JWT_SECRET);
    return true; // 토큰이 유효하고 만료되지 않음
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return false; // 토큰이 만료됨
    }
    return false; // 토큰이 유효하지 않음
  }
}
const logInHandler = async ({ socket, payload }) => {
  const { account, password } = payload;
  let success = true;
  let message = undefined;
  let token = undefined;

  try {
    // db에서 해당 아이디 찾기
    const existUser = await findUserByAccount(account);
    if (!existUser) {
      success = false;
      message = '존재하지 않는 아이디입니다.';
    } else {
      // 비밀번호 비교
      const isPasswordValid = await bcrypt.compare(password, existUser.password);
      if (!isPasswordValid) {
        success = false;
        message = '비밀번호가 일치하지 않습니다.';
      }

      // 로그인 검증 통과 - socket.id 할당
      socket.id = existUser.id.toString();
      addUserSession(socket);
      const character = await findCharacterByUserId(existUser.id);
      if (character) {
        await addRedisUser(existUser.id, character.nickname, character.myClass);
        await enterLogic(socket, character);
      }
      token = jwt.sign({ id: existUser.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: JWT_ALGORITHM,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      message = '로그인에 성공하였습니다.';
      token = `Bearer ${token}`;
    }
  } catch (error) {
    logger.error(error);
    token = undefined;
    success = false;
    message = '알 수 없는 문제가 발생했습니다.';
  }

  return new Result({ success, message, token }, PACKET_ID.S_Login);
};

export default logInHandler;
