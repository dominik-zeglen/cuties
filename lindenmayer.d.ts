declare module "lindenmayer" {
  export interface Production {
    symbol: string;
  }

  export interface LSystemInit<T extends {} = {}> {
    axiom: string;
    productions: Record<string, string | Array<Production & T>>;
  }
  export default class LSystem {
    constructor(opts: LSystemInit);

    iterate: (its: number) => void;
  }
}
