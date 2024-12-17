import { validateRegister } from '../../utils/joi/joiUtils.js';
import { PACKET_ID } from '../../configs/constants/packetId.js';
import { findUserByAccount, createUser } from '../../db/model/user.db.js';
import logger from '../../utils/logger.js';
import bcrypt from 'bcryptjs';
import Result from '../result.js';

const registerHandler = async (socket, payload) => {
  const { account, password } = payload;

  const isNotValidate = await validateRegister({ account, password });
  let success = true;
  let message = undefined;
  if (isNotValidate) {
    success = false;
    message = isNotValidate;
  } else {
    try {
      // db에서 중복 아이디 찾기
      const isAccountExist = await findUserByAccount(account);
      if (isAccountExist) {
        success = false;
        message = '이미 존재하는 아이디입니다.';
      } else {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        // db에서 아이디 생성하기
        await createUser(account, hashedPassword);
        message = '회원가입에 성공했습니다!';
      }
      logger.info('회원가입 성공!');
    } catch (error) {
      success = false;
      message = '알 수 없는 에러입니다.';
      logger.error(error);
    }
  }
  return new Result({ success, message }, PACKET_ID.S_Register);
};

export default registerHandler;
