// stage.db.js
import dbPool from '../database.js';
import SQL_QUERIES from './stage.query.js';
import handleDbQuery from '../../utils/dbHelper.js';  // DB 처리 함수 임포트

// 스테이지 생성
export const createStage = async (MonsterID, MonsterCount) => {
  const result = await handleDbQuery(dbPool.query.bind(dbPool), [
    SQL_QUERIES.CREATE_STAGE, MonsterID, MonsterCount
  ]);
  return { id: result.insertId, MonsterID, MonsterCount };  // 생성된 스테이지 반환
};

// 스테이지 조회
export const findStageById = async (id) => {
  const rows = await handleDbQuery(dbPool.query.bind(dbPool), [SQL_QUERIES.FIND_STAGE_BY_ID, id]);
  if (rows.length === 0) {
    throw new Error(`Stage with ID ${id} not found.`);
  }
  return rows[0];
};

// 모든 스테이지 조회
export const findAllStages = async () => {
  const rows = await handleDbQuery(dbPool.query.bind(dbPool), [SQL_QUERIES.FIND_ALL_STAGES]);
  return rows;  // 모든 스테이지 반환
};

// 스테이지 수정
export const updateStage = async (id, MonsterID, MonsterCount) => {
  const result = await handleDbQuery(dbPool.query.bind(dbPool), [
    SQL_QUERIES.UPDATE_STAGE, MonsterID, MonsterCount, id
  ]);
  if (result.affectedRows === 0) {
    throw new Error(`Stage with ID ${id} not found or no changes made.`);
  }
  return { id, MonsterID, MonsterCount };  // 수정된 스테이지 반환
};

// 스테이지 삭제
export const deleteStage = async (id) => {
  const result = await handleDbQuery(dbPool.query.bind(dbPool), [SQL_QUERIES.DELETE_STAGE, id]);
  if (result.affectedRows === 0) {
    throw new Error(`Stage with ID ${id} not found.`);
  }
  return { id };  // 삭제된 스테이지의 ID 반환
};