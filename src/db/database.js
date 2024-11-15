import mysql from 'mysql2/promise';
import config from '../config/config.js';
import formatDate from '../utils/dateFormatter.js';

const createPool = () => {
  const pool = mysql.createPool({
    //...config.databases.USER_DB,
    //...config.databases.GAME_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const originalQuery = pool.query;

  pool.query = (sql, params) => {
    const date = new Date();

    console.log(
      `[${formatDate(date)}] Executing query: ${sql} ${
        params ? `, ${JSON.stringify(params)}` : ``
      }`,
    );

    return originalQuery.call(pool, sql, params);
  };

  return pool;
};

const dbPool = createPool();

export default dbPool;
