/* eslint-disable no-unused-vars */

declare module "lindenmayer" {
  export interface Production {
    symbol: string;
  }

  export interface Successor {
    weight: number;
    successor: string;
  }

  export interface Successors {
    successors: Successor[];
  }

  export interface LSystemInit<T extends {} = {}> {
    axiom: string;
    productions: Record<string, string | Array<Production & T> | Successors>;
  }
  export default class LSystem {
    constructor(opts: LSystemInit);

    iterate: (its?: number) => string;
  }
}
