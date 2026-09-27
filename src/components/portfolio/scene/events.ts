// Kept free of three.js so DOM components can listen without pulling the 3D chunk.

export const SCENE_STATUS_EVENT = "scene:status";

export type SceneStatus = {
  /** name of the shape currently on screen, e.g. "lorenz_attractor(...)" */
  shape: string;
  points: number;
  fps: number;
};
