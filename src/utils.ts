import { Sim } from "./core/core";

export function transpose<T>(array: T[][]): T[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

export function getSim(iterations: number): Promise<number[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sim = new Sim(500, 500);
      const population = Array(iterations / 100).fill(0);
      let oldest = 0;
      for (let it = 0; it < iterations; it++) {
        sim.next();
        sim.entityLoader.cuties.forEach((cutie) => {
          if (it - cutie.createdAt > oldest) {
            oldest = it - cutie.createdAt;
          }
        });

        if (it % 100 === 0) {
          population[it / 100] = sim.entityLoader.cuties.length;
        }
      }

      resolve(population);
    }, 0);
  });
}
