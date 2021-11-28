interface Window {
  cuties: {
    get: {
      oldest: () => object | null;
    };
    sim: {
      current: object;
      pause: () => void;
      run: () => void;
    };
    started: number;
    lastReload: number;
    stats: {
      itPerSecond: number;
    };
    iteration: number;
    selected: any; // Actually it's Cutie but module resolution order fails here
  };
}
