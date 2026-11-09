// Types for Vector Document, Shapes, Paths, Gradients, and Styling

export type ShapeType = 
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'polyline'
  | 'polygon'
  | 'path'
  | 'group';

export type FillType = 'none' | 'solid' | 'linear' | 'radial' | 'sweep';
export type StrokeType = 'none' | 'solid' | 'linear';

export interface GradientStop {
  id: string;
  offset: number; // 0 to 1
  color: string;  // Hex (#RRGGBB or #RRGGBBAA)
  opacity: number; // 0 to 1
}

export interface LinearGradientDef {
  id: string;
  type: 'linear';
  x1: number; // In percentage (0-1) or viewBox coordinate
  y1: number;
  x2: number;
  y2: number;
  stops: GradientStop[];
}

export interface RadialGradientDef {
  id: string;
  type: 'radial';
  cx: number;
  cy: number;
  r: number;
  fx?: number;
  fy?: number;
  stops: GradientStop[];
}

export interface SweepGradientDef {
  id: string;
  type: 'sweep'; // Jetpack Compose Brush.sweepGradient / Conic
  cx: number;
  cy: number;
  stops: GradientStop[];
}

export type GradientDef = LinearGradientDef | RadialGradientDef | SweepGradientDef;

export interface VectorPaint {
  type: FillType;
  color?: string; // For solid
  alpha?: number; // 0 to 1
  gradientId?: string; // Reference to document defs
  gradient?: GradientDef; // Inlined or linked gradient
}

export type StrokeLineCap = 'butt' | 'round' | 'square';
export type StrokeLineJoin = 'miter' | 'round' | 'bevel';
export type PathFillRule = 'nonzero' | 'evenodd';

export interface VectorStroke {
  type: StrokeType;
  color?: string;
  alpha?: number;
  width: number;
  cap: StrokeLineCap;
  join: StrokeLineJoin;
  miterLimit: number;
  dashArray?: string; // e.g. "4 2" or ""
  gradientId?: string;
}

export interface Transform {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotate: number; // in degrees
  originX: number;
  originY: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Path command representation
export interface PathCommand {
  command: string; // 'M', 'L', 'C', 'S', 'Q', 'T', 'A', 'Z', etc.
  params: number[];
  relative: boolean;
}

export interface NodePoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
  isCurve?: boolean;
}

export interface VectorNode {
  id: string;
  name: string;
  type: ShapeType;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
  fill: VectorPaint;
  stroke: VectorStroke;
  fillRule: PathFillRule;
  transform: Transform;

  // Specific shape geometry
  // For 'path'
  pathData?: string; // Raw SVG path data
  commands?: PathCommand[];
  points?: NodePoint[]; // For interactive node editing

  // For 'rect'
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  ry?: number;

  // For 'circle' or 'ellipse'
  cx?: number;
  cy?: number;
  r?: number;
  rxRadius?: number;
  ryRadius?: number;

  // For 'line'
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;

  // For 'polyline' or 'polygon'
  polyPoints?: { x: number; y: number }[];

  // For 'group'
  children?: VectorNode[];
}

export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface VectorDocument {
  id: string;
  name: string;
  width: number; // e.g. 24
  height: number; // e.g. 24
  viewBox: ViewBox;
  gradients: Record<string, GradientDef>;
  nodes: VectorNode[];
}
