import { theme } from "../components/theme";
import { DrawableCutie } from "../core/entities/cutie";
import { DrawableFlower } from "../core/entities/flowers";
import { defaultInitialFoodValue, DrawableFood } from "../core/entities/food";
import { DrawableRemains } from "../core/entities/remains";
import { DrawableWaste, maxValue } from "../core/entities/waste";
import { Point } from "../core/r2";
import settings from "../core/settings";
import { drawCutie, drawFlower, drawPellet, drawStaticPellet } from "./paint";
import { Camera, moveCamera } from "./paint/camera";
import { Drawable } from "./drawable";
import { Emitter } from "./particle";
import { EmitterInput } from "./emitters/types";
import { createEmitter } from "./emitters/map";

export interface RendererUpdateOpts {
  cuties: DrawableCutie[];
  flowers: DrawableFlower[];
  food: DrawableFood[];
  eggs: Drawable[];
  waste: DrawableWaste[];
  remains: DrawableRemains[];
}

export class Renderer {
  bounds: [Point, Point];
  camera: Camera;
  canvas: OffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
  emitters: Emitter[];
  iteration: number;

  constructor(canvas: OffscreenCanvas, bounds: [Point, Point]) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.bounds = bounds;
    this.camera = {
      height: 800,
      width: 1280,
      viewPort: {
        start: { ...bounds[0] },
        end: { ...bounds[1] },
      },
    };
    this.emitters = [];

    this.iteration = 0;
  }

  moveCamera = (x: number, y: number): void => {
    moveCamera(this.camera, this.context, x, y, this.bounds);
  };

  addEmitter = (input: EmitterInput) => {
    this.emitters.push(createEmitter(input));
  };

  update = ({
    cuties,
    flowers,
    food,
    eggs,
    waste,
    remains,
  }: RendererUpdateOpts) => {
    this.iteration++;
    this.context.clearRect(
      this.camera.viewPort.start.x,
      this.camera.viewPort.start.y,
      this.camera.viewPort.end.x,
      this.camera.viewPort.end.y
    );

    this.emitters.forEach((emitter) => {
      if (this.iteration % emitter.spawnRate === 0) {
        for (let i = 0; i < emitter.quantity; i++) {
          emitter.spawnParticle(this.iteration);
        }
      }
      emitter.clean(this.iteration);
      emitter.update();
      emitter.render(this.context);
    });

    food.forEach((pellet) =>
      drawPellet(this.context, {
        color: theme.primary.string(),
        maxValue: defaultInitialFoodValue,
        pellet,
      })
    );

    eggs.forEach((pellet) =>
      drawStaticPellet(this.context, {
        color: theme.entities.egg.string(),
        pellet,
        size: 3,
      })
    );

    waste.forEach((pellet) =>
      drawPellet(this.context, {
        color: theme.entities.dump.string(),
        pellet,
        maxValue,
      })
    );

    remains.forEach((pellet) =>
      drawPellet(this.context, {
        color: theme.entities.remains.string(),
        pellet,
        maxValue: settings.cutie.maxHunger / 2,
      })
    );

    flowers.forEach((flower) => drawFlower(this.context, flower));

    cuties.forEach((cutie) => drawCutie(this.context, cutie, 1));
  };
}
