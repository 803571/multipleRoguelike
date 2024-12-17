import { getAccountByRedis } from '../../sessions/redis/redis.account.js';
import { setIsSignIn } from '../../sessions/redis/redis.user.js';
import configs from '../../configs/configs.js';
import createResponse from '../../utils/packet/createResponse.js';
import Result from '../result.js';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.js';

const { PACKET_ID, JWT_SECRET, JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE } = configs;

function verifyTokenAsync(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      JWT_SECRET,
      {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
      (err, decoded) => {
        if (err) resolve(null);
        else resolve(decoded);
      },
    );
  });
}

const logoutHandler = async (socket, payload) => {
  const { token } = payload;

  const result = new Result({ success: true, message: '' }, PACKET_ID.S_Logout);

  const verified = await verifyTokenAsync(token);

  if (!verified) {
    result.payload.success = false;
    result.payload.message = '토큰 인증에 실패 했습니다.';
    return result;
  }

  if (verified.id != socket.id || socket.account != verified.account) {
    result.payload.success = false;
    result.payload.message = '인증에 실패 했습니다.';
    logger.err(
      `logoutHandler. ScoketInfo => [${socket.account}]${socket.id} / verifiedInfo => [${verified.account}]${verified.id}`,
    );
    return result;
  }

  await setIsSignIn(socket.id, false);
  result.payload.message = '로그아웃에 성공하였습니다.';
  return result;
};

export default logoutHandler;
