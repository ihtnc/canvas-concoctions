import { type GameConfig } from "./types"

const data: GameConfig = {
  tank: {
    size: {
      width: 100,
      height: 100
    }
  },
  gunBarrel: {
    offset: {
      x: 3,
      y: -8
    },
    size: {
      width: 50,
      height: 25
    },
    angleMultiplier: -1
  },
  target: {
    size: {
      width: 50,
      height: 50
    },
    movementRange: 100,
    movementSpeedMultiplier: 0.75
  },
  bullet: {
    offset: {
      x: 5,
      y: 0
    },
    size: {
      width: 30,
      height: 10
    },
    speed: 0.10,
    padding: 5
  },
  rank: {
    offset: {
      x: -5,
      y: 15
    },
    size: {
      width: 20,
      height: 25
    }
  },
  trajectory: {
    lineWidthMultiplier: 0.333,
    length: 180,
    lineDash: [0, 60, 15, 10, 15, 10, 15, 10, 15, 10, 15, 10]
  },
  explosion: {
    size: {
      width: 75,
      height: 75
    }
  },
  environment: {
    gravity: 3.75,
    airResistance: 0.095,
    airResistanceModifier: 0.05,
    powerMultiplier: 8,
    maxAngle: 70,
    minAngle: -15,
    maxPower: 20,
    minPower: 5,
    hitsPerDifficulty: 5,
    fps: 60
  },
  controls: {
    size: {
      width: 50,
      height: 50
    },
    padding: 10,
    activeOpacity: 1,
    inactiveOpacity: 0.5,
    powerUp: {
      offset: {
        x: 0,
        y: 0
      },
      sizeMultiplier: 1
    },
    powerDown: {
      offset: {
        x: 0,
        y: 0
      },
      sizeMultiplier: 1
    },
    angleUp: {
      offset: {
        x: -10,
        y: 20
      },
      sizeMultiplier: 1
    },
    angleDown: {
      offset: {
        x: -10,
        y: -20
      },
      sizeMultiplier: 1
    },
    gunBarrelFire: {
      offset: {
        x: 0,
        y: 0
      },
      sizeMultiplier: 1
    },
    fire: {
      offset: {
        x: 0,
        y: 0
      },
      sizeMultiplier: 2
    }
  },
  stats: {
    location: {
      x: 10,
      y: 20
    },
    padding: 10,
    color: { h: 0, s: 100, l: 50 },
    font: "20px Arial"
  }
}

export default data