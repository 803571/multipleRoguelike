import { getOrCreateClient } from './client.test.js';
import configs from '../configs/config.js';
import testEnv from './env.test.js';
const { PACKET_ID } = configs;
const client = getOrCreateClient(testEnv.url, testEnv.port);
await client.connect();

client.addHandler(PACKET_ID.S_Register, async (payload) => {
  // console.log(payload);
});

client.sendMessage(PACKET_ID.C_Register, {
  account: 'qkrdydgus123',
  password: 'ajdcjddl12!2#',
});
