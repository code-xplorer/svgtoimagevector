import { BoundingBox, Transform } from '../../types/vector';

export interface Point {
  x: number;
  y: number;
}

/**
 * Applies 2D transform to a point
 */
export function transformPoint(point: Point, transform: Transform): Point {
  let { x, y } = point;

  // Scale relative to origin
  x = transform.originX + (x - transform.originX) * transform.scaleX;
  y = transform.originY + (y - transform.originY) * transform.scaleY;

  // Rotate relative to origin
  if (transform.rotate !== 0) {
    const rad = (transform.rotate * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = x - transform.originX;
    const dy = y - transform.originY;
    x = transform.originX + dx * cos - dy * sin;
    y = transform.originY + dx * sin + dy * cos;
  }

  // Translate
  x += transform.translateX;
  y += transform.translateY;

  return { x, y };
}

/**
 * Snaps coordinate to nearest grid step
 */
export function snapCoordinate(val: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) return val;
  return Math.round(val / gridSize) * gridSize;
}

/**
 * Calculates transformed bounding box
 */
export function getTransformedBoundingBox(box: BoundingBox, transform: Transform): BoundingBox {
  const corners: Point[] = [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x + box.width, y: box.y + box.height },
    { x: box.x, y: box.y + box.height },
  ];

  const transformedCorners = corners.map(pt => transformPoint(pt, transform));

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pt of transformedCorners) {
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

/**
 * Checks if point is inside box
 */
export function isPointInBox(point: Point, box: BoundingBox, tolerance: number = 4): boolean {
  return (
    point.x >= box.x - tolerance &&
    point.x <= box.x + box.width + tolerance &&
    point.y >= box.y - tolerance &&
    point.y <= box.y + box.height + tolerance
  );
}

/**
 * Distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
