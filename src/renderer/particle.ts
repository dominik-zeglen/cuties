import { add, Point, toCartesian } from "../core/r2";
import { Drawable } from "./drawable";

export interface ParticleTemplate {
  color: string;
  size: number;
  timeToLive: number;
}

export interface Particle extends Drawable, ParticleTemplate {
  createdAt: number;
  speed: Point;
}

export class Emitter {
  force: number;
  particles: Particle[];
  position: Point;
  radius: number;
  spawnRate: number;
  template: ParticleTemplate;
  quantity: number;

  constructor(
    position: Point,
    radius: number,
    template: ParticleTemplate,
    spawnRate: number,
    quantity: number
  ) {
    this.particles = [];
    this.position = position;
    this.radius = radius;
    this.template = template;
    this.spawnRate = spawnRate;
    this.force = -1;
    this.quantity = quantity;
  }

  spawnParticle = (it: number): Particle => {
    const position = add(
      this.position,
      toCartesian({
        angle: Math.random() * 2 * Math.PI,
        r: Math.random() * this.radius,
      })
    );
    const particle: Particle = {
      ...this.template,
      createdAt: it,
      position,
      speed: toCartesian({
        r: this.force,
        angle: Math.atan2(
          position.y - this.position.y,
          position.x - this.position.x
        ),
      }),
    };
    this.particles.push(particle);

    return particle;
  };

  clean = (it: number): void => {
    this.particles = this.particles.filter(
      (particle) => it - particle.createdAt < particle.timeToLive
    );
  };

  update = (): void => {
    this.particles.forEach((particle) => {
      particle.position = add(particle.position, particle.speed);
    });
  };

  render = (ctx: OffscreenCanvasRenderingContext2D): void => {
    ctx.fillStyle = this.template.color;
    this.particles.forEach((particle) => {
      ctx.beginPath();
      ctx.ellipse(
        particle.position.x,
        particle.position.y,
        particle.size,
        particle.size,
        -1,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
    });
  };
}
