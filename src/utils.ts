export function transpose<T>(array: T[][]): T[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

export function getSim(iterations: number): Promise<number[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 0);
  });
}
