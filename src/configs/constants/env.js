// 중앙 집중식 관리
import dotenv from 'dotenv';
delete process.env.REDIS_PORT;
delete process.env.SERVER_PORT;
dotenv.config();

/**
 * 필수 환경 변수 목록을 정의하는 객체.
 * 각 카테고리(DB, JWT, SERVER, SECURITY)에 대한 필요한 환경 변수의 키를 포함합니다.
 * @type {Object}
 */
const requiredEnv = {
  DB: ['HOST', 'PORT', 'USER', 'PASSWORD', 'NAME', 'CONNECTION_LIMIT'],
  SERVER: ['PORT', 'BIND'],
  REDIS: ['HOST', 'PORT', 'PASSWORD'],
  SECURE: ['PEPPER', 'SALT'],
  LOGGER: ['STACK_TRACE'],
  JWT: [
    'SECRET',
    'EXPIRES_IN',
    'ALGORITHM',
    'ISSUER',
    'AUDIENCE',
    'REFRESH_SECRET',
    'REFRESH_EXPIRES_IN',
    'ALGORITHM',
  ],
  PATH: ['HOST', 'PORT'],
  GATEWAY: ['CHECK_INTERVAL'],
};

/**
 * 환경 변수를 담는 객체.
 * `requiredEnv`에 정의된 필수 환경 변수가 모두 설정되었는지 확인하고,
 * 설정된 변수들을 `config` 객체에 저장합니다.
 * @type {Object}
 */
const config = {};

// 필수 환경 변수를 검사하고 설정되지 않은 변수가 있을 경우 오류를 발생시킵니다.
Object.keys(requiredEnv).forEach((key) => {
  requiredEnv[key].forEach((envVar) => {
    const fullEnvVar = `${key}_${envVar}`;
    if (!process.env[fullEnvVar]) {
      throw new Error(`Missing required environment variable: ${fullEnvVar}`);
    }
    if (!config[key]) {
      config[key] = {};
    }

    if (!isNaN(process.env[fullEnvVar])) {
      config[key][envVar] = Number(process.env[fullEnvVar]);
    } else {
      config[key][envVar] = process.env[fullEnvVar];
    }
  });
});

/**
 * `config` 객체를 평탄화하여 단일 레벨의 객체로 변환.
 * 각 환경 변수는 'NAMESPACE_KEY' 형식의 키를 갖도록 변환됩니다.
 * @type {Object}
 */
const flattenedConfig = Object.entries(config).reduce((acc, [namespace, values]) => {
  Object.entries(values).forEach(([key, value]) => {
    acc[`${namespace}_${key}`] = value;
  });

  return acc;
}, {});

/**
 * 평탄화된 환경 변수 객체를 내보냅니다.
 */
export default flattenedConfig;
