/* eslint-disable no-restricted-globals */

import { DrawableCutie } from "../core/entities/cutie";
import { DrawableFlower } from "../core/entities/flowers";
import { DrawableFood } from "../core/entities/food";
import { DrawableRemains } from "../core/entities/remains";
import { DrawableWaste } from "../core/entities/waste";
import { Point } from "../core/r2";
import { Drawable } from "../renderer/drawable";
import { Renderer } from "../renderer/renderer";

export interface BaseRenderMsg {
  type: "init" | "update" | "move-camera";
}

export interface RenderInitMsg extends BaseRenderMsg {
  bounds: [Point, Point];
  canvas: OffscreenCanvas;
}

export interface RenderUpdateMsg extends BaseRenderMsg {
  cuties: DrawableCutie[];
  flowers: DrawableFlower[];
  food: DrawableFood[];
  eggs: Drawable[];
  waste: DrawableWaste[];
  remains: DrawableRemains[];
}

export interface RenderCameraMoveMsg extends BaseRenderMsg, Point {}

export type RenderMsg = RenderInitMsg | RenderUpdateMsg | RenderCameraMoveMsg;

let renderer: Renderer | null = null;

self.onmessage = (event: MessageEvent<RenderMsg>) => {
  if (event.data.type === "init") {
    const data = event.data as RenderInitMsg;
    renderer = new Renderer(data.canvas, data.bounds);
  } else if (renderer) {
    if (event.data.type === "update") {
      const data = event.data as RenderUpdateMsg;
      const image = renderer.update({
        cuties: data.cuties,
        flowers: data.flowers,
        food: data.food,
        eggs: data.eggs,
        remains: data.remains,
        waste: data.waste,
      });
      self.postMessage({
        image,
      });
    } else if (event.data.type === "move-camera") {
      const data = event.data as RenderCameraMoveMsg;
      renderer.moveCamera(data.x, data.y);
    }
  }
};
