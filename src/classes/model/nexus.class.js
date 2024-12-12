class Nexus {
  constructor(initialHp) {
    this.maxHp = initialHp;
    this.nexusHp = initialHp;
    this.position = this.getRandomSpawnNexus();
    this.isDead = false;
  }

  getRandomSpawnNexus() {
    const transforms = [
      { posX: 3.5, posY: -4.3, posZ: 52.5, rot: 0 },
      { posX: -30, posY: 0.75, posZ: 52.5, rot: 0 },
      { posX: 32.5, posY: 0.75, posZ: 52.5, rot: 0 },
      { posX: 0, posY: 0.8, posZ: 102, rot: 0 },
      { posX: 2, posY: 0.8, posZ: 5, rot: 0 },
    ];
    return transforms[Math.floor(Math.random() * transforms.length)];
  }

  spawn() {
    this.position = this.getRandomSpawnNexus();
    return this.position;
  }

  damaged(damage) {
    this.nexusHp = Math.max(this.nexusHp - damage, 0);
    if (this.nexusHp <= 0) {
      this.isDead = true;
    }
    return this.nexusHp;
  }
}

export default Nexus;
