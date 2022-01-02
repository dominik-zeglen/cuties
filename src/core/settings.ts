const settings = {
  cutie: {
    maxHunger: 2000,
    eggCost: 900,
    eatingRate: 2,
    droppedWasteValue: 200,
    attackCooldown: 60,
    range: 300,
    shape: {
      min: 0.5,
      max: 1.3,
    },
    oldAge: 5e3,
  },
  flower: {
    maxHunger: 3000,
    nextNodeCost: 1600,
    eatingRate: 2,
    spawnedFoodValue: 500,
    foodEnergyCostRatio: 0.1,
    growCooldown: 5000,
    range: 80,
    passiveEnergyCost: 0.2,
  },
  global: {},
};

export default settings;
