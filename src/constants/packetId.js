export const RESPONSE_SUCCESS_CODE = 0;

export const reverseMapping = {};

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
  C_LeaveDungeon: 12,
  S_LeaveDungeon: 13,
  S_UpdatePlayerHp: 14,
  S_UpdatePlayerMp: 15,
  S_UpdateMonsterHp: 16,
  C_MonsterAction: 17,
  S_MonsterAction: 18,
  C_Register: 19,
  S_Register: 20,
  C_LoginIn: 21,
  S_LoginIn: 22,
  C_EnterPortal: 23,
  S_EnterPortal: 24,
  S_Inventory: 25,
  C_Inventory: 26,
  C_UseItem: 27,
  S_UseItem: 28,
  C_PurchaseItem: 29,
  S_PurchaseItem: 30,
  S_ItemSoldOut: 31,
  C_SellItem: 32,
  S_SellItem: 33,
  C_GetItem: 34,
  S_GetItem: 35,
  C_DropItem: 36,
  S_DropItem: 37,
  C_EquipEquipment: 38,
  S_EquipEquipment: 39,
  C_UnequipWeapon: 40,
  S_UnequipWeapon: 41,
  C_UseSkill: 42,
  S_UseSkill: 43,
  C_MonsterDamage: 44,
  S_MonsterDamage: 45,
  C_MonsterMove: 46,
  S_MonsterMove: 47,
  C_MonsterKill: 48,
  S_MonsterKill: 49,
  C_MonsterSpawn: 50,
  S_MonsterSpawn: 51,
  C_BossSpawn: 52,
  S_BossSpawn: 53,
  C_TargetPlayer: 54,
  S_TargetPlayer: 55,
  C_ActionBoss: 58,
  S_ActionBoss: 59,
  S_Phase: 60,
  C_PartyJoin: 61,
  C_PartyLeave: 62,
  S_Party: 63
};



export const createReverseMapping = () => {
  for (const [key, value] of Object.entries(PACKET_ID)) {
      reverseMapping[value] = key; // value를 key로, key를 value로 저장
  }
};