import LSystem from "lindenmayer";
import max from "lodash/max";
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

export const maxHunger = 2000;
const produceCost = 1100;
const initialHunger = maxHunger - produceCost * 0.6;
const eatingRate = 0.6;
const foodValue = 500;
const foodEnergyCostRatio = 0.1;
const growDelay = 1800;
export const rangeRadius = 80;

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
  degree: number;

  constructor(initial: InitialFlowerInput) {
    super(initial);
    this.angle = initial.angle;
    this.next = [];
    this.parent = initial.parent;
    this.produces = initial.produces;
    this.hunger = initialHunger;
    this.sunlightStored = 0;
    this.degree = 1;
  }

  die = () => {
    this.markToDelete();
    if (this.parent) {
      this.parent.next = this.parent.next.filter((node) => node.id !== this.id);
      this.parent.updateDegree();
    }

    this.next.forEach((node) => {
      node.parent = null;
      if (Math.random() < 0.25) {
        node.die();
      }
    });
  };

  applyForce = (forceVec?: PolarPoint) => {
    const force = forceVec ?? { angle: this.angle, r: 1e-2 };
    this.position = add(this.position, toCartesian(force));
    this.next.forEach((node) => node.applyForce(force));
  };

  sim = (simInput: FlowerSimInput | null): void => {
    const age = this.getAge(simInput.iteration);
    simInput.waste.forEach((waste) => this.eat(waste, null));
    this.hunger += eatingRate * (0.5 + age / 6e4);
    this.sunlightStored += 0.6;

    if (this.parent && age < growDelay) {
      this.position = add(
        this.position,
        toCartesian({
          r: 30 / growDelay,
          angle: this.angle,
        })
      );
    }

    if (this.hunger > maxHunger) {
      this.die();
    }
  };

  eat = (waste: Waste, direction: EatDirection, chainLevel = 1): boolean => {
    if (!waste.value) {
      return false;
    }

    if (this.hunger > 0) {
      waste.value -= eatingRate;
      this.hunger -= eatingRate * 0.9 ** chainLevel;
      return true;
    }

    if (direction === null) {
      for (let node = 0; node < this.next.length; node++) {
        if (this.next[node].eat(waste, direction, chainLevel + 1)) {
          return true;
        }
      }
      return this.parent && this.parent.eat(waste, "backward");
    }

    if (direction === "forward") {
      for (let node = 0; node < this.next.length; node++) {
        if (this.next[node].eat(waste, direction, chainLevel + 1)) {
          return true;
        }
      }
      return false;
    }

    if (this.parent && direction === "backward") {
      return this.parent.eat(waste, direction, chainLevel + 1);
    }

    return false;
  };

  canSpawnFood = (): boolean =>
    !!this.next.length &&
    (1 - foodEnergyCostRatio) * foodValue < this.sunlightStored;

  canProduce = (it: number): boolean =>
    this.hunger + produceCost + 100 < maxHunger &&
    this.next.length === 0 &&
    it - this.createdAt > growDelay;

  produce = (): Flower[] => {
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
              weight: 0.45,
              successor: "N",
            },
            {
              weight: 0.05,
              successor: "++N",
            },
            {
              weight: 0.05,
              successor: "++N---N",
            },
            {
              weight: 0.1,
              successor: "++N--N",
            },
            {
              weight: 0.05,
              successor: "++N-N--N",
            },
          ],
        },
      },
      finals: {
        N: () => {
          this.next.push(
            new Flower({
              angle,
              parent: this,
              position: add(
                this.position,
                toCartesian({
                  angle,
                  r: 2,
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

    this.next.forEach((node) => {
      node.hunger = maxHunger - (maxHunger - node.hunger) / this.next.length;
    });
    this.updateDegree();

    return this.next;
  };

  spawnFood = (): Food => {
    const food = new Food({
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

  updateDegree = () => {
    this.degree = this.next.length
      ? max(this.next.map((node) => node.degree)) + 1
      : 1;

    if (this.parent) {
      this.parent.updateDegree();
    }
  };
}

export function getRandomFlower(bounds: Point[]): Flower {
  const cutie = new Flower({
    angle: (Math.random() - 0.5) * Math.PI * 2,
    parent: null,
    position: getRandomPositionInBounds(bounds),
    produces: null,
  });

  return cutie;
}
