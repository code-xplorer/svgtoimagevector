import { Point } from './matrix';
import { BoundingBox, NodePoint, VectorNode } from '../../types/vector';

/**
 * Converts a rectangle into SVG path data
 */
export function rectToPathData(x: number, y: number, w: number, h: number, rx: number = 0, ry: number = 0): string {
  if (rx <= 0 && ry <= 0) {
    return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  }
  const rX = Math.min(rx, w / 2);
  const rY = Math.min(ry || rx, h / 2);

  return [
    `M ${x + rX} ${y}`,
    `H ${x + w - rX}`,
    `A ${rX} ${rY} 0 0 1 ${x + w} ${y + rY}`,
    `V ${y + h - rY}`,
    `A ${rX} ${rY} 0 0 1 ${x + w - rX} ${y + h}`,
    `H ${x + rX}`,
    `A ${rX} ${rY} 0 0 1 ${x} ${y + h - rY}`,
    `V ${y + rY}`,
    `A ${rX} ${rY} 0 0 1 ${x + rX} ${y}`,
    `Z`
  ].join(' ');
}

/**
 * Converts circle/ellipse to path data using 4 cubic bezier arcs
 */
export function ellipseToPathData(cx: number, cy: number, rx: number, ry: number): string {
  // Magic constant for approximating circle with 4 cubic beziers: kappa = 0.5522847498
  const kx = rx * 0.5522847498;
  const ky = ry * 0.5522847498;

  return [
    `M ${cx} ${cy - ry}`,
    `C ${cx + kx} ${cy - ry}, ${cx + rx} ${cy - ky}, ${cx + rx} ${cy}`,
    `C ${cx + rx} ${cy + ky}, ${cx + kx} ${cy + ry}, ${cx} ${cy + ry}`,
    `C ${cx - kx} ${cy + ry}, ${cx - rx} ${cy + ky}, ${cx - rx} ${cy}`,
    `C ${cx - rx} ${cy - ky}, ${cx - kx} ${cy - ry}, ${cx} ${cy - ry}`,
    `Z`
  ].join(' ');
}

/**
 * Converts regular polygon or star to path data
 */
export function polygonToPathData(
  cx: number, 
  cy: number, 
  radius: number, 
  pointsCount: number = 5, 
  isStar: boolean = false, 
  innerRadiusRatio: number = 0.5
): string {
  const points: Point[] = [];
  const total = isStar ? pointsCount * 2 : pointsCount;
  const step = (Math.PI * 2) / total;
  const startAngle = -Math.PI / 2;

  for (let i = 0; i < total; i++) {
    const angle = startAngle + i * step;
    const r = (isStar && i % 2 === 1) ? radius * innerRadiusRatio : radius;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }

  if (points.length === 0) return '';
  const first = points[0];
  const rest = points.slice(1).map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${rest} Z`;
}

/**
 * Converts polyPoints to path data
 */
export function pointsToPathData(pts: Point[], closed: boolean = false): string {
  if (pts.length === 0) return '';
  const first = pts[0];
  const rest = pts.slice(1).map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${rest}${closed ? ' Z' : ''}`;
}

/**
 * Converts smooth freehand stroke into cubic bezier path
 */
export function smoothPointsToPath(points: Point[], closed: boolean = false): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  if (closed) {
    d += ' Z';
  }
  return d;
}

/**
 * Extracts NodePoints (anchors + handles) from path commands or simple paths
 */
export function extractNodePointsFromPathData(d: string): NodePoint[] {
  const result: NodePoint[] = [];
  if (!d) return result;

  // Simple tokenization of path commands
  const commandRegex = /([a-df-z])([^a-df-z]*)/gi;
  let match: RegExpExecArray | null;
  let currX = 0;
  let currY = 0;

  while ((match = commandRegex.exec(d)) !== null) {
    const cmd = match[1];
    const argsStr = match[2].trim();
    const args = argsStr ? argsStr.split(/[\s,]+/).filter(Boolean).map(Number) : [];

    const isUpper = cmd === cmd.toUpperCase();
    const type = cmd.toUpperCase();

    if (type === 'M' || type === 'L') {
      for (let i = 0; i < args.length; i += 2) {
        const x = isUpper ? args[i] : currX + args[i];
        const y = isUpper ? args[i + 1] : currY + args[i + 1];
        currX = x;
        currY = y;
        result.push({ x, y, isCurve: false });
      }
    } else if (type === 'C') {
      for (let i = 0; i < args.length; i += 6) {
        const cp1x = isUpper ? args[i] : currX + args[i];
        const cp1y = isUpper ? args[i + 1] : currY + args[i + 1];
        const cp2x = isUpper ? args[i + 2] : currX + args[i + 2];
        const cp2y = isUpper ? args[i + 3] : currY + args[i + 3];
        const endX = isUpper ? args[i + 4] : currX + args[i + 4];
        const endY = isUpper ? args[i + 5] : currY + args[i + 5];

        if (result.length > 0) {
          result[result.length - 1].handleOut = { x: cp1x, y: cp1y };
          result[result.length - 1].isCurve = true;
        }

        result.push({
          x: endX,
          y: endY,
          handleIn: { x: cp2x, y: cp2y },
          isCurve: true,
        });

        currX = endX;
        currY = endY;
      }
    } else if (type === 'S') {
      for (let i = 0; i < args.length; i += 4) {
        const cp2x = isUpper ? args[i] : currX + args[i];
        const cp2y = isUpper ? args[i + 1] : currY + args[i + 1];
        const endX = isUpper ? args[i + 2] : currX + args[i + 2];
        const endY = isUpper ? args[i + 3] : currY + args[i + 3];

        result.push({
          x: endX,
          y: endY,
          handleIn: { x: cp2x, y: cp2y },
          isCurve: true,
        });

        currX = endX;
        currY = endY;
      }
    } else if (type === 'Q') {
      for (let i = 0; i < args.length; i += 4) {
        const cp1x = isUpper ? args[i] : currX + args[i];
        const cp1y = isUpper ? args[i + 1] : currY + args[i + 1];
        const endX = isUpper ? args[i + 2] : currX + args[i + 2];
        const endY = isUpper ? args[i + 3] : currY + args[i + 3];

        if (result.length > 0) {
          result[result.length - 1].handleOut = { x: cp1x, y: cp1y };
          result[result.length - 1].isCurve = true;
        }

        result.push({
          x: endX,
          y: endY,
          handleIn: { x: cp1x, y: cp1y },
          isCurve: true,
        });

        currX = endX;
        currY = endY;
      }
    } else if (type === 'A') {
      for (let i = 0; i < args.length; i += 7) {
        const endX = isUpper ? args[i + 5] : currX + args[i + 5];
        const endY = isUpper ? args[i + 6] : currY + args[i + 6];
        currX = endX;
        currY = endY;
        result.push({ x: currX, y: currY, isCurve: true });
      }
    } else if (type === 'H') {
      for (let i = 0; i < args.length; i++) {
        const x = isUpper ? args[i] : currX + args[i];
        currX = x;
        result.push({ x: currX, y: currY, isCurve: false });
      }
    } else if (type === 'V') {
      for (let i = 0; i < args.length; i++) {
        const y = isUpper ? args[i] : currY + args[i];
        currY = y;
        result.push({ x: currX, y: currY, isCurve: false });
      }
    } else if (type === 'Z') {
      // closed
    }
  }

  return result;
}

/**
 * Builds SVG path data from NodePoints
 */
export function nodePointsToPathData(points: NodePoint[], closed: boolean = true): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (prev.handleOut || curr.handleIn) {
      const cp1 = prev.handleOut || { x: prev.x, y: prev.y };
      const cp2 = curr.handleIn || { x: curr.x, y: curr.y };
      d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    } else {
      d += ` L ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    }
  }

  if (closed && points.length > 2) {
    const last = points[points.length - 1];
    const first = points[0];
    if (last.handleOut || first.handleIn) {
      const cp1 = last.handleOut || { x: last.x, y: last.y };
      const cp2 = first.handleIn || { x: first.x, y: first.y };
      d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${first.x.toFixed(2)} ${first.y.toFixed(2)} Z`;
    } else {
      d += ' Z';
    }
  }

  return d;
}

/**
 * Gets approximate bounding box for a VectorNode
 */
export function getNodeBoundingBox(node: VectorNode): BoundingBox {
  switch (node.type) {
    case 'rect': {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const w = node.width ?? 0;
      const h = node.height ?? 0;
      return { x, y, width: w, height: h };
    }
    case 'circle': {
      const cx = node.cx ?? 0;
      const cy = node.cy ?? 0;
      const r = node.r ?? 0;
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    case 'ellipse': {
      const cx = node.cx ?? 0;
      const cy = node.cy ?? 0;
      const rx = node.rxRadius ?? 0;
      const ry = node.ryRadius ?? 0;
      return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 };
    }
    case 'line': {
      const x1 = node.x1 ?? 0;
      const y1 = node.y1 ?? 0;
      const x2 = node.x2 ?? 0;
      const y2 = node.y2 ?? 0;
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };
    }
    case 'polygon':
    case 'polyline': {
      if (!node.polyPoints || node.polyPoints.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const pt of node.polyPoints) {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    case 'path': {
      // Compute from points
      const pts = (node.points && node.points.length > 0)
        ? node.points
        : (node.pathData ? extractNodePointsFromPathData(node.pathData) : []);

      if (pts.length > 0) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const pt of pts) {
          if (pt.x < minX) minX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y > maxY) maxY = pt.y;
        }
        if (minX !== Infinity && minY !== Infinity) {
          return { x: minX, y: minY, width: Math.max(0.5, maxX - minX), height: Math.max(0.5, maxY - minY) };
        }
      }
      return { x: 0, y: 0, width: 24, height: 24 };
    }
    case 'group': {
      if (!node.children || node.children.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const child of node.children) {
        const box = getNodeBoundingBox(child);
        if (box.x < minX) minX = box.x;
        if (box.y < minY) minY = box.y;
        if (box.x + box.width > maxX) maxX = box.x + box.width;
        if (box.y + box.height > maxY) maxY = box.y + box.height;
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    default:
      return { x: 0, y: 0, width: 24, height: 24 };
  }
}
