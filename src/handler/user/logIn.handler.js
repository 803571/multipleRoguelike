import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByAccount } from '../../db/model/user.db.js';
import configs from '../../configs/configs.js';
import logger from '../../utils/logger.js';
import createResponse from '../../utils/packet/createResponse.js';
import { enqueueSend } from '../../utils/socket/messageQueue.js';
import { getIsSignIn, setIsSignIn } from '../../sessions/redis/redis.user.js';
import { pubDuplicatedSignIn, setTokenByRedis } from '../../sessions/redis/redis.account.js';
import userSessions from '../../sessions/sessions.js';
import { createGameServerInfoPacket } from '../../sessions/redis/redis.health.js';

const { PACKET_ID, JWT_SECRET, JWT_EXPIRES_IN, JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE } = configs;

const logInHandler = async (socket, payload) => {
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
      } else {
        socket.id = Number(existUser.id);
        const isSignedIn = await getIsSignIn(socket.id);
        console.log(`isSignedIn [${socket.id}] => ${isSignedIn}`);
        if (isSignedIn) {
          await pubDuplicatedSignIn(socket.id, socket.UUID);
        }
        // 로그인 검증 통과 - socket.id 할당
        socket.account = account;
        userSessions[socket.id] = socket;
        message = '로그인에 성공하였습니다.';
        token = jwt.sign({ id: existUser.id, account }, JWT_SECRET, {
          expiresIn: JWT_EXPIRES_IN,
          algorithm: JWT_ALGORITHM,
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
        });
        await setIsSignIn(socket.id, true);
        await setTokenByRedis(account, token);
      }
    }
  } catch (error) {
    logger.error(error);
    token = undefined;
    success = false;
    message = '알 수 없는 문제가 발생했습니다.';
  }
  const loginBuffer = createResponse(PACKET_ID.S_Login, { success, message, token });
  enqueueSend(socket.UUID, loginBuffer);
  enqueueSend(socket.UUID, createGameServerInfoPacket());
};

export default logInHandler;
