import { 
  VectorDocument, 
  VectorNode, 
  GradientDef, 
  LinearGradientDef, 
  RadialGradientDef, 
  GradientStop, 
  VectorPaint, 
  VectorStroke, 
  StrokeLineCap, 
  StrokeLineJoin, 
  PathFillRule, 
  Transform 
} from '../../types/vector';
import { parseSvgPath } from './pathParser';
import { extractNodePointsFromPathData } from '../geometry/bezier';

/**
 * Parses color strings (hex, rgb, rgba, named colors) to 8-digit hex #AARRGGBB or #RRGGBB
 */
export function normalizeColor(colorStr: string | null | undefined, defaultColor = '#000000'): { color: string; alpha: number } {
  if (!colorStr || colorStr === 'none' || colorStr === 'transparent') {
    return { color: '#000000', alpha: 0 };
  }
  if (colorStr === 'currentColor') {
    return { color: '#000000', alpha: 1 };
  }

  const s = colorStr.trim().toLowerCase();

  // Hex #RGB or #RRGGBB
  if (s.startsWith('#')) {
    if (s.length === 4) {
      const r = s[1] + s[1];
      const g = s[2] + s[2];
      const b = s[3] + s[3];
      return { color: `#${r}${g}${b}`.toUpperCase(), alpha: 1 };
    }
    if (s.length === 7) {
      return { color: s.toUpperCase(), alpha: 1 };
    }
    if (s.length === 9) {
      const hex = s.substring(1, 7).toUpperCase();
      const alphaHex = s.substring(7, 9);
      const alpha = parseInt(alphaHex, 16) / 255;
      return { color: `#${hex}`, alpha: Math.round(alpha * 100) / 100 };
    }
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    const alpha = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    return { color: `#${r}${g}${b}`.toUpperCase(), alpha };
  }

  // Named standard colors
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    purple: '#800080',
    gray: '#808080',
    grey: '#808080',
    orange: '#FFA500',
  };

  if (namedColors[s]) {
    return { color: namedColors[s], alpha: 1 };
  }

  return { color: defaultColor, alpha: 1 };
}

/**
 * Parses SVG transform string e.g. "translate(10, 20) rotate(45) scale(1.5)"
 */
function parseTransform(transformStr: string | null): Transform {
  const defaultTransform: Transform = {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    originX: 0,
    originY: 0,
  };

  if (!transformStr) return defaultTransform;

  const translateMatch = transformStr.match(/translate\(([^)]+)\)/);
  if (translateMatch) {
    const parts = translateMatch[1].split(/[\s,]+/).map(parseFloat);
    defaultTransform.translateX = parts[0] || 0;
    defaultTransform.translateY = parts[1] || 0;
  }

  const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
  if (rotateMatch) {
    const parts = rotateMatch[1].split(/[\s,]+/).map(parseFloat);
    defaultTransform.rotate = parts[0] || 0;
    if (parts.length >= 3) {
      defaultTransform.originX = parts[1];
      defaultTransform.originY = parts[2];
    }
  }

  const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    const parts = scaleMatch[1].split(/[\s,]+/).map(parseFloat);
    defaultTransform.scaleX = parts[0] || 1;
    defaultTransform.scaleY = parts[1] ?? defaultTransform.scaleX;
  }

  return defaultTransform;
}

function getStyleAttr(el: Element, styleProp: string): string | null {
  const svgEl = el as SVGElement;
  return svgEl.style ? (svgEl.style as any)[styleProp] || null : null;
}

/**
 * Parses a gradient stop
 */
function parseGradientStop(el: Element, index: number): GradientStop {
  let offsetStr = el.getAttribute('offset') || '0';
  let offset = 0;
  if (offsetStr.endsWith('%')) {
    offset = parseFloat(offsetStr) / 100;
  } else {
    offset = parseFloat(offsetStr);
  }
  if (isNaN(offset)) offset = 0;

  const stopColorAttr = el.getAttribute('stop-color') || getStyleAttr(el, 'stopColor');
  const stopOpacityAttr = el.getAttribute('stop-opacity') || getStyleAttr(el, 'stopOpacity');

  const { color, alpha } = normalizeColor(stopColorAttr, '#000000');
  const opacity = stopOpacityAttr !== null && stopOpacityAttr !== undefined && stopOpacityAttr !== ''
    ? parseFloat(stopOpacityAttr) 
    : alpha;

  return {
    id: `stop-${index}-${Math.random().toString(36).substr(2, 4)}`,
    offset: Math.min(1, Math.max(0, offset)),
    color,
    opacity: isNaN(opacity) ? 1 : Math.min(1, Math.max(0, opacity)),
  };
}

/**
 * Parses <defs> and collects gradients
 */
function parseGradients(doc: Document): Record<string, GradientDef> {
  const gradients: Record<string, GradientDef> = {};

  const linearGrads = doc.querySelectorAll('linearGradient');
  linearGrads.forEach(el => {
    const id = el.getAttribute('id');
    if (!id) return;

    const parseUnit = (attr: string | null, def: number): number => {
      if (!attr) return def;
      if (attr.endsWith('%')) return parseFloat(attr) / 100;
      const num = parseFloat(attr);
      return isNaN(num) ? def : num;
    };

    const stops: GradientStop[] = [];
    el.querySelectorAll('stop').forEach((stopEl, idx) => {
      stops.push(parseGradientStop(stopEl, idx));
    });

    // Default stops if none specified
    if (stops.length === 0) {
      stops.push({ id: 's1', offset: 0, color: '#000000', opacity: 1 });
      stops.push({ id: 's2', offset: 1, color: '#FFFFFF', opacity: 1 });
    }

    const grad: LinearGradientDef = {
      id,
      type: 'linear',
      x1: parseUnit(el.getAttribute('x1'), 0),
      y1: parseUnit(el.getAttribute('y1'), 0),
      x2: parseUnit(el.getAttribute('x2'), 1),
      y2: parseUnit(el.getAttribute('y2'), 0),
      stops,
    };
    gradients[id] = grad;
  });

  const radialGrads = doc.querySelectorAll('radialGradient');
  radialGrads.forEach(el => {
    const id = el.getAttribute('id');
    if (!id) return;

    const parseUnit = (attr: string | null, def: number): number => {
      if (!attr) return def;
      if (attr.endsWith('%')) return parseFloat(attr) / 100;
      const num = parseFloat(attr);
      return isNaN(num) ? def : num;
    };

    const stops: GradientStop[] = [];
    el.querySelectorAll('stop').forEach((stopEl, idx) => {
      stops.push(parseGradientStop(stopEl, idx));
    });

    if (stops.length === 0) {
      stops.push({ id: 's1', offset: 0, color: '#FFFFFF', opacity: 1 });
      stops.push({ id: 's2', offset: 1, color: '#000000', opacity: 1 });
    }

    const grad: RadialGradientDef = {
      id,
      type: 'radial',
      cx: parseUnit(el.getAttribute('cx'), 0.5),
      cy: parseUnit(el.getAttribute('cy'), 0.5),
      r: parseUnit(el.getAttribute('r'), 0.5),
      fx: parseUnit(el.getAttribute('fx'), 0.5),
      fy: parseUnit(el.getAttribute('fy'), 0.5),
      stops,
    };
    gradients[id] = grad;
  });

  return gradients;
}

/**
 * Extracts fill property
 */
function parsePaint(
  fillAttr: string | null, 
  fillOpacityAttr: string | null, 
  gradients: Record<string, GradientDef>, 
  defaultFill = '#000000'
): VectorPaint {
  if (!fillAttr) {
    return { type: 'solid', color: defaultFill, alpha: 1 };
  }

  const trimmed = fillAttr.trim();
  if (trimmed === 'none' || trimmed === '') {
    return { type: 'none' };
  }

  // Check url(#id)
  const urlMatch = trimmed.match(/url\(#([^)]+)\)/);
  if (urlMatch) {
    const gradId = urlMatch[1];
    if (gradients[gradId]) {
      return {
        type: gradients[gradId].type,
        gradientId: gradId,
        gradient: gradients[gradId],
        alpha: fillOpacityAttr ? parseFloat(fillOpacityAttr) : 1,
      };
    }
  }

  const { color, alpha } = normalizeColor(trimmed, defaultFill);
  const finalAlpha = fillOpacityAttr ? parseFloat(fillOpacityAttr) * alpha : alpha;

  return {
    type: 'solid',
    color,
    alpha: isNaN(finalAlpha) ? 1 : finalAlpha,
  };
}

/**
 * Extracts stroke property
 */
function parseStroke(
  strokeAttr: string | null, 
  strokeWidthAttr: string | null, 
  strokeCapAttr: string | null, 
  strokeJoinAttr: string | null, 
  strokeMiterAttr: string | null,
  strokeDashAttr: string | null,
  strokeOpacityAttr: string | null
): VectorStroke {
  if (!strokeAttr || strokeAttr === 'none') {
    return {
      type: 'none',
      width: strokeWidthAttr ? parseFloat(strokeWidthAttr) || 1 : 1,
      cap: 'round',
      join: 'round',
      miterLimit: 4,
    };
  }

  const { color, alpha } = normalizeColor(strokeAttr, '#000000');
  const finalAlpha = strokeOpacityAttr ? parseFloat(strokeOpacityAttr) * alpha : alpha;

  let cap: StrokeLineCap = 'butt';
  if (strokeCapAttr === 'round' || strokeCapAttr === 'square') {
    cap = strokeCapAttr;
  }

  let join: StrokeLineJoin = 'miter';
  if (strokeJoinAttr === 'round' || strokeJoinAttr === 'bevel') {
    join = strokeJoinAttr;
  }

  return {
    type: 'solid',
    color,
    alpha: isNaN(finalAlpha) ? 1 : finalAlpha,
    width: strokeWidthAttr ? parseFloat(strokeWidthAttr) || 1 : 1,
    cap,
    join,
    miterLimit: strokeMiterAttr ? parseFloat(strokeMiterAttr) || 4 : 4,
    dashArray: strokeDashAttr || undefined,
  };
}

let nodeCounter = 1;

/**
 * Recursively parses SVG elements into VectorNodes
 */
function parseSvgElement(
  el: Element, 
  gradients: Record<string, GradientDef>, 
  inheritedFill = '#000000'
): VectorNode | null {
  const tagName = el.tagName.toLowerCase();
  const id = el.getAttribute('id') || `layer-${nodeCounter++}`;
  const name = el.getAttribute('data-name') || el.getAttribute('name') || `${tagName.charAt(0).toUpperCase() + tagName.slice(1)} ${nodeCounter}`;

  // Common styling attributes
  const fillAttr = el.getAttribute('fill') || getStyleAttr(el, 'fill');
  const fillOpacityAttr = el.getAttribute('fill-opacity') || getStyleAttr(el, 'fillOpacity');
  const strokeAttr = el.getAttribute('stroke') || getStyleAttr(el, 'stroke');
  const strokeWidthAttr = el.getAttribute('stroke-width') || getStyleAttr(el, 'strokeWidth');
  const strokeCapAttr = el.getAttribute('stroke-linecap') || getStyleAttr(el, 'strokeLinecap');
  const strokeJoinAttr = el.getAttribute('stroke-linejoin') || getStyleAttr(el, 'strokeLinejoin');
  const strokeMiterAttr = el.getAttribute('stroke-miterlimit') || getStyleAttr(el, 'strokeMiterlimit');
  const strokeDashAttr = el.getAttribute('stroke-dasharray') || getStyleAttr(el, 'strokeDasharray');
  const strokeOpacityAttr = el.getAttribute('stroke-opacity') || getStyleAttr(el, 'strokeOpacity');
  const opacityAttr = el.getAttribute('opacity') || getStyleAttr(el, 'opacity');
  const fillRuleAttr = el.getAttribute('fill-rule') || el.getAttribute('clip-rule');

  const fill = parsePaint(fillAttr, fillOpacityAttr, gradients, inheritedFill);
  const stroke = parseStroke(strokeAttr, strokeWidthAttr, strokeCapAttr, strokeJoinAttr, strokeMiterAttr, strokeDashAttr, strokeOpacityAttr);
  const fillRule: PathFillRule = fillRuleAttr === 'evenodd' ? 'evenodd' : 'nonzero';
  const transform = parseTransform(el.getAttribute('transform'));
  const opacity = opacityAttr ? Math.min(1, Math.max(0, parseFloat(opacityAttr))) : 1;

  const baseNode: Partial<VectorNode> = {
    id,
    name,
    visible: true,
    locked: false,
    opacity: isNaN(opacity) ? 1 : opacity,
    fill,
    stroke,
    fillRule,
    transform,
  };

  switch (tagName) {
    case 'path': {
      const d = el.getAttribute('d') || '';
      const commands = parseSvgPath(d);
      const points = extractNodePointsFromPathData(d);
      return {
        ...baseNode,
        type: 'path',
        pathData: d,
        commands,
        points,
      } as VectorNode;
    }
    case 'rect': {
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const width = parseFloat(el.getAttribute('width') || '0');
      const height = parseFloat(el.getAttribute('height') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      return {
        ...baseNode,
        type: 'rect',
        x,
        y,
        width,
        height,
        rx,
        ry: ry || rx,
      } as VectorNode;
    }
    case 'circle': {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      return {
        ...baseNode,
        type: 'circle',
        cx,
        cy,
        r,
      } as VectorNode;
    }
    case 'ellipse': {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      return {
        ...baseNode,
        type: 'ellipse',
        cx,
        cy,
        rxRadius: rx,
        ryRadius: ry,
      } as VectorNode;
    }
    case 'line': {
      const x1 = parseFloat(el.getAttribute('x1') || '0');
      const y1 = parseFloat(el.getAttribute('y1') || '0');
      const x2 = parseFloat(el.getAttribute('x2') || '0');
      const y2 = parseFloat(el.getAttribute('y2') || '0');
      return {
        ...baseNode,
        type: 'line',
        x1,
        y1,
        x2,
        y2,
      } as VectorNode;
    }
    case 'polygon':
    case 'polyline': {
      const pointsAttr = el.getAttribute('points') || '';
      const coords = pointsAttr.trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
      const polyPoints: { x: number; y: number }[] = [];
      for (let i = 0; i < coords.length; i += 2) {
        polyPoints.push({ x: coords[i], y: coords[i + 1] ?? coords[i] });
      }
      return {
        ...baseNode,
        type: tagName === 'polygon' ? 'polygon' : 'polyline',
        polyPoints,
      } as VectorNode;
    }
    case 'g': {
      const children: VectorNode[] = [];
      const currentFill = fill.type === 'solid' && fill.color ? fill.color : inheritedFill;
      for (const childEl of Array.from(el.children)) {
        const parsedChild = parseSvgElement(childEl, gradients, currentFill);
        if (parsedChild) children.push(parsedChild);
      }
      return {
        ...baseNode,
        type: 'group',
        children,
      } as VectorNode;
    }
    default:
      return null;
  }
}

/**
 * Main function: Parses an SVG string into a structured VectorDocument
 */
export function parseSvgDocument(svgString: string, documentName = 'VectorDocument'): VectorDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`SVG Parsing Error: ${parseError.textContent}`);
  }

  const svgEl = doc.querySelector('svg');
  if (!svgEl) {
    throw new Error('No <svg> root element found in document');
  }

  // Parse viewBox
  let minX = 0;
  let minY = 0;
  let width = 24;
  let height = 24;

  const viewBoxAttr = svgEl.getAttribute('viewBox');
  if (viewBoxAttr) {
    const parts = viewBoxAttr.trim().split(/[\s,]+/).map(parseFloat);
    if (parts.length >= 4) {
      minX = parts[0];
      minY = parts[1];
      width = parts[2];
      height = parts[3];
    }
  } else {
    const wAttr = svgEl.getAttribute('width');
    const hAttr = svgEl.getAttribute('height');
    if (wAttr) width = parseFloat(wAttr) || 24;
    if (hAttr) height = parseFloat(hAttr) || 24;
  }

  // Collect gradients from <defs>
  const gradients = parseGradients(doc);

  // Parse child nodes
  const nodes: VectorNode[] = [];
  for (const child of Array.from(svgEl.children)) {
    const tagName = child.tagName.toLowerCase();
    if (tagName === 'defs' || tagName === 'title' || tagName === 'desc' || tagName === 'style') {
      continue;
    }
    const node = parseSvgElement(child, gradients);
    if (node) {
      nodes.push(node);
    }
  }

  return {
    id: `doc-${Date.now()}`,
    name: documentName,
    width,
    height,
    viewBox: { minX, minY, width, height },
    gradients,
    nodes,
  };
}
