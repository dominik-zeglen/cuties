import { Entity, InitialEntityInput } from "./entity";
import { add, getRandomPositionInBounds, Point, toCartesian } from "../r2";
import { Waste } from "./waste";
import { Food } from "./food";
//   import LSystem from 'lindenmayer'

//   const system = new LSystem({
//       axiom:"N",
//       productions:{
//           N: [{
//               symbol:'F+F-'
//           }]
//       }
//   })

const maxHunger = 2000;
const produceCost = 400;
const initialHunger = maxHunger - produceCost * 0.9;
const eatingRate = 0.5;
const foodValue = 400;
const foodEnergyCostRatio = 0.25;

export type EatDirection = "forward" | "backward" | null;

export interface FlowerSimInput {
  waste: Waste[];
}

export interface InitialFlowerInput extends InitialEntityInput {
  angle: number;
  parent: Flower | null;
  produces: string;
}

export class Flower extends Entity {
  angle: number;
  parent: Flower | null;
  next: Flower | null;
  hunger: number;
  produces: string | null;
  wasteStored: number;
  sunlightStored: number;

  constructor(id: number, it: number, initial: InitialFlowerInput) {
    super(id, it, initial);
    this.angle = initial.angle;
    this.next = null;
    this.parent = initial.parent;
    this.produces = initial.produces;
    this.hunger = initialHunger;
    this.sunlightStored = 0;
  }

  sim = (simInput: FlowerSimInput | null): void => {
    simInput.waste.forEach((waste) => this.eat(waste, null));
    this.hunger += eatingRate / 3;
    this.sunlightStored += 0.45;

    if (this.hunger > maxHunger) {
      this.shouldDelete = true;
      if (this.next) {
        this.next.parent = null;
      }
      if (this.parent) {
        this.parent.next = null;
      }
    }
  };

  eat = (waste: Waste, direction: EatDirection): boolean => {
    if (this.hunger > 0) {
      waste.value -= eatingRate;
      this.hunger -= eatingRate * 0.9;
      return true;
    }

    if (direction === null) {
      if (this.next && this.next.eat(waste, "forward")) {
        return true;
      }
      return this.parent && this.parent.eat(waste, "backward");
    }

    if (this.next && direction === "forward") {
      return this.next.eat(waste, direction);
    }

    if (this.parent && direction === "backward") {
      return this.parent.eat(waste, direction);
    }

    return false;
  };

  canSpawnFood = (): boolean =>
    this.hunger / maxHunger < 0.3 &&
    !!this.next &&
    (1 - foodEnergyCostRatio) * foodValue < this.sunlightStored;

  canProduce = (it: number): boolean =>
    this.hunger + produceCost + 100 < maxHunger &&
    !this.next &&
    it - this.createdAt > 1000;

  produce = (id: number, it: number): Flower => {
    this.hunger += produceCost;
    this.next = new Flower(id, it, {
      angle: this.angle,
      parent: this,
      position: add(
        this.position,
        toCartesian({
          angle: this.angle,
          r: 10,
        })
      ),
      produces: null,
    });

    return this.next;
  };

  spawnFood = (id: number, it: number): Food => {
    const food = new Food(id, it, {
      position: this.position,
      value: foodValue,
    });
    this.hunger += foodEnergyCostRatio * foodValue;
    this.sunlightStored -= (1 - foodEnergyCostRatio) * foodValue;

    return food;
  };
}

export function getRandomFlower(
  id: number,
  it: number,
  bounds: Point[]
): Flower {
  const cutie = new Flower(id, it, {
    angle: (Math.random() - 0.5) * Math.PI * 2,
    parent: null,
    position: getRandomPositionInBounds(bounds),
    produces: null,
  });

  return cutie;
}
