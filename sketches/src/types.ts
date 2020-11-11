export type Line = [Cord, Cord];

export type Rect = [Cord, Cord];
export type Triangle = [Cord, Cord, Cord];
export type RectByTriangle = [Triangle, Triangle];
export type RectByCorner = [Cord, Cord, Cord, Cord];

export type Bound = [number, number];
export type Range = [number, number];
export type Vec2 = [number, number];
export type Cord = [number, number];

export type Color = [number, number, number, number];

export interface SketchContext {
  canvas: HTMLCanvasElement;
  context: any;
  width: number;
  height: number;
  styleWidth: number;
  styleHeight: number;
  frame: number;
  playhead?: number;
  time?: number;
  settings: any;
  step: number;
  fps: number;
  recording?: boolean;
  gl: any;
}

export interface Animation {
  startDelayInTicks: number;
  durationInTicks: number;
  endDelayInTicks: number;
  props: any;
  type: string;
  subAnimations: Animation[];
}
