import Client from './client.test.js';
import { getOrCreateClient } from './client.test.js';
import configs from '../configs/configs.js';
import testEnv from './env.test.js';
const { PACKET_ID } = configs;

const client = getOrCreateClient(testEnv.url, testEnv.port);
await client.connect();

const handleLogin = () => {
  return new Promise((resolve, reject) => {
    client.addHandler(PACKET_ID.S_Login, async ({ payload }) => {
      try {
        if (payload.success === true) {
          client.token = payload.token;
          client.expirationTime = payload.expirationTime;
        } else {
          client.token = undefined;
          client.expirationTime = 0;
        }
        resolve(payload); // 성공적으로 처리되면 resolve 호출
      } catch (error) {
        reject(error); // 에러 발생 시 reject 호출
      }
    });
  });
};

client.sendMessage(PACKET_ID.C_Login, {
  account: testEnv.userName,
  password: testEnv.password,
});

try {
  await handleLogin();
} catch (error) {
  console.error('Error during login:', error);
}
