import Client from './client.test.js';
import { getOrCreateClient } from './client.test.js';
import configs from '../configs/configs.js';
import testEnv from './env.test.js';
const { PACKET_ID } = configs;

const client = getOrCreateClient(testEnv.url, testEnv.port);
await client.connect();
await import('./login.test.js');
// 서버가 클라에 보낸 데이터를 받는 곳
client.addHandler(PACKET_ID.S_HitMonster, async ({ payload }) => {
  console.log('addHandler => ', payload);
});

// 클라가 서버에 보내주는 곳
client.sendMessage(PACKET_ID.C_HitMonster, {
  monsterId: 10,
  damage: 10,
});
