import createResponse from '../../utils/response/createResponse.js';
import { PACKET_ID } from '../../constants/packetId.js';
import handleError from '../../utils/error/errorHandler.js';
// 패킷명세
// message S_GetItem {
//     ItemInfo item = 1; // 습득한 아이템 정보
//   }
const getItemHandler = async (socket, payload) => {
  try {
    const { item } = payload;

    const getItemPayload = {
      item,
    };

    const response = createResponse(PACKET_ID.S_GetItem, getItemPayload);
    socket.write(response);
  } catch (e) {
    handleError(socket, e);
  }
};
export default getItemHandler;
