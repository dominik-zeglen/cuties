import LSystem from "lindenmayer";
import { Entity, InitialEntityInput } from "./entity";
import {
  add,
  getRandomPositionInBounds,
  Point,
  PolarPoint,
  toCartesian,
} from "../r2";
import { Waste } from "./waste";
import { Food } from "./food";

const maxHunger = 2000;
const produceCost = 400;
const initialHunger = maxHunger - produceCost * 0.9;
const eatingRate = 0.5;
const foodValue = 400;
const foodEnergyCostRatio = 0.35;

export type EatDirection = "forward" | "backward" | null;

export interface FlowerSimInput {
  iteration: number;
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
  next: Flower[] | null;
  hunger: number;
  produces: string | null;
  wasteStored: number;
  sunlightStored: number;

  constructor(id: number, it: number, initial: InitialFlowerInput) {
    super(id, it, initial);
    this.angle = initial.angle;
    this.next = [];
    this.parent = initial.parent;
    this.produces = initial.produces;
    this.hunger = initialHunger;
    this.sunlightStored = 0;
  }

  die = () => {
    this.shouldDelete = true;
    if (this.next) {
      this.next.forEach((node) => {
        node.parent = null;
        if (Math.random() < 0.5) {
          node.die();
        }
      });
    }
    if (this.parent) {
      this.parent.next = this.parent.next.filter((node) => node.id !== this.id);
    }
  };

  applyForce = (forceVec?: PolarPoint) => {
    const force = forceVec ?? { angle: this.angle, r: 0.02 };
    this.position = add(this.position, toCartesian(force));
    this.next.forEach((node) => node.applyForce(force));
  };

  sim = (simInput: FlowerSimInput | null): void => {
    simInput.waste.forEach((waste) => this.eat(waste, null));
    this.hunger += eatingRate * 0.45;
    this.sunlightStored += 0.45;

    if (this.hunger > maxHunger) {
      this.die();
    }

    if (simInput.iteration - this.createdAt > 10000 && Math.random() < 0.0001) {
      this.die();
    }
  };

  eat = (waste: Waste, direction: EatDirection): boolean => {
    if (!waste.value) {
      return false;
    }

    if (this.hunger > 0) {
      waste.value -= eatingRate;
      this.hunger -= eatingRate * 0.9;
      return true;
    }

    if (direction === null) {
      if (this.next.length) {
        for (let node = 0; node < this.next.length; node++) {
          if (this.next[node].eat(waste, direction)) {
            return true;
          }
        }
      }
      return this.parent && this.parent.eat(waste, "backward");
    }

    if (this.next && direction === "forward") {
      for (let node = 0; node < this.next.length; node++) {
        if (this.next[node].eat(waste, direction)) {
          return true;
        }
      }
      return false;
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
    this.next.length === 0 &&
    it - this.createdAt > 1000;

  produce = (id: number, it: number): Flower[] => {
    let { angle } = this;

    const system = new LSystem({
      axiom: "N",
      productions: {
        N: {
          successors: [
            {
              weight: 0.15,
              successor: "+N",
            },
            {
              weight: 0.15,
              successor: "-N",
            },
            {
              weight: 0.5,
              successor: "N",
            },
            {
              weight: 0.1,
              successor: "++N",
            },
            {
              weight: 0.05,
              successor: "++N---N",
            },
            {
              weight: 0.05,
              successor: "++N--N",
            },
          ],
        },
      },
      finals: {
        N: () => {
          this.next.push(
            new Flower(id, it, {
              angle,
              parent: this,
              position: add(
                this.position,
                toCartesian({
                  angle,
                  r: 30,
                })
              ),
              produces: null,
            })
          );
        },
        "+": () => {
          angle += Math.PI / 6;
        },
        "-": () => {
          angle -= Math.PI / 6;
        },
      },
    });
    system.iterate();
    system.final();

    this.hunger += produceCost;

    return this.next;
  };

  spawnFood = (id: number, it: number): Food => {
    const food = new Food(id, it, {
      position: add(this.position, {
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
      }),
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
