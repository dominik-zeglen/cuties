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
import settings from "../settings";

const initialHunger =
  settings.flower.maxHunger - settings.flower.nextNodeCost * 0.9;

export type EatDirection = "forward" | "backward" | null;

export interface FlowerSimInput {
  iteration: number;
  waste: Waste[];
}

export interface InitialFlowerInput extends InitialEntityInput {
  angle: number;
  parent: Flower | null;
}

export class Flower extends Entity {
  angle: number;
  parent: Flower | null;
  next: Flower[] | null;
  hunger: number;
  sunlightStored: number;
  degree: number;

  constructor(initial: InitialFlowerInput) {
    super(initial);
    this.angle = initial.angle;
    this.next = [];
    this.parent = initial.parent;
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
    this.hunger += settings.flower.passiveEnergyCost + (this.degree - 1) / 5;
    if (this.next.length) {
      this.sunlightStored += 1;
    }

    if (this.parent && age < settings.flower.growCooldown) {
      this.position = add(
        this.position,
        toCartesian({
          r: 30 / settings.flower.growCooldown,
          angle: this.angle,
        })
      );
    }

    if (this.hunger > settings.flower.maxHunger) {
      this.die();
    }
  };

  eat = (waste: Waste, direction: EatDirection, chainLevel = 0): boolean => {
    if (!waste.value) {
      return false;
    }

    if (this.hunger > 0) {
      waste.value -= settings.flower.eatingRate;
      this.hunger -= settings.flower.eatingRate * 0.9 ** chainLevel;
      return true;
    }

    if (direction === null) {
      for (let node = 0; node < this.next.length; node++) {
        if (this.next[node].eat(waste, "forward", chainLevel + 1)) {
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
    (1 - settings.flower.foodEnergyCostRatio) *
      settings.flower.spawnedFoodValue <
      this.sunlightStored &&
    this.hunger < settings.flower.maxHunger * 0.8;

  canProduce = (it: number): boolean =>
    this.hunger + settings.flower.nextNodeCost + 100 <
      settings.flower.maxHunger &&
    this.next.length === 0 &&
    it - this.createdAt > settings.flower.growCooldown;

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

    this.hunger += settings.flower.nextNodeCost;

    this.next.forEach((node) => {
      node.hunger =
        settings.flower.maxHunger -
        (settings.flower.maxHunger - node.hunger) / this.next.length;
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
      value: settings.flower.spawnedFoodValue,
    });
    this.hunger +=
      settings.flower.foodEnergyCostRatio * settings.flower.spawnedFoodValue;
    this.sunlightStored -=
      (1 - settings.flower.foodEnergyCostRatio) *
      settings.flower.spawnedFoodValue;

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
  });

  return cutie;
}
