import createResponse from '../../utils/response/createResponse';
import { PACKET_ID } from '../../constants/packetId';
import handleError from '../../utils/error/errorHandler';
// 패킷명세
// message S_SellItem {
//     ItemInfo item = 1; // 판매한 아이템 정보
//     int32 gold = 2; // 보유 골드 + 아이템 골드
//     bool success = 3; // 성공여부
//     string message = 4; // 메시지
//   }
const sellItemHandler = async (socket, payload) => {
  try {
    const { item, gold, success, message } = payload;

    const sellItemPayload = {
      item,
      gold,
      success,
      message,
    };

    const response = createResponse(PACKET_ID.S_SellItem, sellItemPayload);
    socket.write(response);
  } catch (e) {
    handleError(socket, e);
  }
};
export default sellItemHandler;
