export const RESPONSE_SUCCESS_CODE = 0;

export const reverseMapping = {};

// 너무 많아서 일단 그냥 쓰기.
export const PACKET_ID = {
  C_Enter: 0,
  S_Enter: 1,
  S_Spawn: 2,
  S_Despawn: 3,
  C_Move: 4,
  S_Move: 5,
  C_Animation: 6,
  S_Animation: 7,
  C_Chat: 8,
  S_Chat: 9,
  S_EnterDungeon: 10,
  C_LeaveDungeon: 11,
  S_LeaveDungeon: 12,
  S_UpdatePlayerHp: 13,
  S_UpdateMonsterHp: 14,
  S_UpdateNexusHp: 15,
  S_LevelUp: 16,
  C_AttackedNexus: 17,
  S_AttackedNexus: 18,
  C_HitPlayer: 19,
  S_HitPlayer: 20,
  C_HitMonster: 21,
  S_HitMonster: 22,
  S_PlayerStatus: 23,
  S_DeathPlayer: 24,
  S_RevivePlayer: 25,
  S_GetExp: 26,
  C_Register: 27,
  S_Register: 28,
  C_Login: 29,
  S_Login: 30,
  C_UseItem: 31,
  S_UseItem: 32,
  C_GetSkill: 33,
  S_GetSkill: 34,
  C_ShootProjectile: 35,
  S_ShootProjectile: 36,
  C_UseSkill: 37,
  S_UseSkill: 38,
  S_MonsterAttack: 39,
  S_MonsterMove: 40,
  S_MonsterKill: 41,
  S_MonsterSpawn: 42,
  S_MonsterKillCount: 43,
  C_Party: 44,
  S_Party: 45,
  C_PartyJoin: 46,
  S_PartyJoin: 47,
  C_PartyLeave: 48,
  S_PartyLeave: 49,
  C_MatchStart: 50,
  C_GetNavPath: 99,
  S_GetNavPath: 100,
};

export const createReverseMapping = () => {
  for (const [key, value] of Object.entries(PACKET_ID)) {
    reverseMapping[value] = key; // value를 key로, key를 value로 저장
  }
};
