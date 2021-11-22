export interface Point {
  x: number;
  y: number;
}

export interface PolarPoint {
  angle: number;
  r: number;
}

export function toPolar(point: Point): PolarPoint {
  return {
    angle: Math.atan(point.y / point.x),
    r: len(point),
  };
}

export function toEuclidean(point: PolarPoint): Point {
  return {
    x: point.r * Math.cos(point.angle),
    y: point.r * Math.sin(point.angle),
  };
}

export function add(a: Point, b: Point): Point {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function sub(a: Point, b: Point): Point {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function len(point: Point): number {
  return Math.sqrt(point.x ** 2 + point.y ** 2);
}
