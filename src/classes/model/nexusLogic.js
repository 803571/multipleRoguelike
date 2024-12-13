import Nexus from './nexus.class.js';
import spawnNexusNotification from '../../handler/game/spawnNexus.notification.js';
import endGameNotification from '../../handler/game/endGame.notification.js';
import { removeDungeonSession } from '../../sessions/dungeon.session.js';

class NexusLogic {
  constructor(dungeonInstance) {
    this.dungeonInstance = dungeonInstance;
    this.nexus = new Nexus(100);
    this.spawnInterval = 30000;
    this.nexusLoopInterval = null;

    this.startNexusLoop();
  }

  startNexusLoop() {
    this.nexusLoopInterval = setInterval(() => {
      const newPosition = this.nexus.spawn();
      this.spawnNexus(newPosition);
    }, this.spawnInterval);
  }

  stopGameLoop() {
    if (this.nexusLoopInterval) {
      clearInterval(this.nexusLoopInterval);
      this.nexusLoopInterval = null;
      console.log('넥서스 게임 루프 중지됨.');
    }
  }

  spawnNexus(newPosition) {
    const nexusId = this.nexus.id;
    this.dungeonInstance.getAllUsers().forEach((user) => {
      spawnNexusNotification(user.userInfo.socket, { nexusId, transform: newPosition });
    });
  }

  endGame(playerId) {
    // removeDungeonSession(this.dungeonInstance);
    endGameNotification(playerId); // 부신 플레이어 ID 전달
  }
}

export default NexusLogic;
