import { VectorDocument, VectorNode, LinearGradientDef, RadialGradientDef } from '../../types/vector';

/**
 * Serializes VectorDocument back to clean SVG XML
 */
export function exportSvgString(doc: VectorDocument): string {
  const { viewBox, width, height, gradients, nodes } = doc;

  const defsContent: string[] = [];

  // Gradients
  for (const [id, grad] of Object.entries(gradients)) {
    if (grad.type === 'linear') {
      const lg = grad as LinearGradientDef;
      const stopsStr = lg.stops
        .map(s => `    <stop offset="${(s.offset * 100).toFixed(1)}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`)
        .join('\n');
      defsContent.push(`  <linearGradient id="${id}" x1="${lg.x1}" y1="${lg.y1}" x2="${lg.x2}" y2="${lg.y2}">\n${stopsStr}\n  </linearGradient>`);
    } else if (grad.type === 'radial') {
      const rg = grad as RadialGradientDef;
      const stopsStr = rg.stops
        .map(s => `    <stop offset="${(s.offset * 100).toFixed(1)}%" stop-color="${s.color}" stop-opacity="${s.opacity}" />`)
        .join('\n');
      defsContent.push(`  <radialGradient id="${id}" cx="${rg.cx}" cy="${rg.cy}" r="${rg.r}">\n${stopsStr}\n  </radialGradient>`);
    }
  }

  function serializeNode(node: VectorNode, indent = '  '): string {
    if (!node.visible) return '';

    // Style attributes
    const attrs: string[] = [];

    // Fill
    if (node.fill.type === 'none') {
      attrs.push('fill="none"');
    } else if (node.fill.type === 'solid') {
      attrs.push(`fill="${node.fill.color || '#000000'}"`);
      if (node.fill.alpha !== undefined && node.fill.alpha < 1) {
        attrs.push(`fill-opacity="${node.fill.alpha}"`);
      }
    } else if (node.fill.gradientId) {
      attrs.push(`fill="url(#${node.fill.gradientId})"`);
    }

    // Stroke
    if (node.stroke.type === 'none') {
      attrs.push('stroke="none"');
    } else {
      attrs.push(`stroke="${node.stroke.color || '#000000'}"`);
      if (node.stroke.alpha !== undefined && node.stroke.alpha < 1) {
        attrs.push(`stroke-opacity="${node.stroke.alpha}"`);
      }
      attrs.push(`stroke-width="${node.stroke.width}"`);
      if (node.stroke.cap !== 'butt') attrs.push(`stroke-linecap="${node.stroke.cap}"`);
      if (node.stroke.join !== 'miter') attrs.push(`stroke-linejoin="${node.stroke.join}"`);
      if (node.stroke.miterLimit !== 4) attrs.push(`stroke-miterlimit="${node.stroke.miterLimit}"`);
      if (node.stroke.dashArray) attrs.push(`stroke-dasharray="${node.stroke.dashArray}"`);
    }

    // Fill rule
    if (node.fillRule === 'evenodd') {
      attrs.push('fill-rule="evenodd"');
    }

    // Opacity
    if (node.opacity < 1) {
      attrs.push(`opacity="${node.opacity}"`);
    }

    // Transform
    const t = node.transform;
    const transformParts: string[] = [];
    if (t.translateX !== 0 || t.translateY !== 0) transformParts.push(`translate(${t.translateX}, ${t.translateY})`);
    if (t.rotate !== 0) transformParts.push(`rotate(${t.rotate} ${t.originX} ${t.originY})`);
    if (t.scaleX !== 1 || t.scaleY !== 1) transformParts.push(`scale(${t.scaleX}, ${t.scaleY})`);
    if (transformParts.length > 0) {
      attrs.push(`transform="${transformParts.join(' ')}"`);
    }

    // Group
    if (node.type === 'group') {
      const childMarkup = (node.children || [])
        .map(c => serializeNode(c, indent + '  '))
        .filter(Boolean)
        .join('\n');
      return `${indent}<g id="${node.id}" ${attrs.join(' ')}>\n${childMarkup}\n${indent}</g>`;
    }

    // Specific shape tags or paths
    let tag = 'path';
    let specificAttrs = '';

    if (node.type === 'path' && node.pathData) {
      tag = 'path';
      specificAttrs = `d="${node.pathData}"`;
    } else if (node.type === 'rect') {
      tag = 'rect';
      specificAttrs = `x="${node.x ?? 0}" y="${node.y ?? 0}" width="${node.width ?? 0}" height="${node.height ?? 0}" rx="${node.rx ?? 0}" ry="${node.ry ?? 0}"`;
    } else if (node.type === 'circle') {
      tag = 'circle';
      specificAttrs = `cx="${node.cx ?? 0}" cy="${node.cy ?? 0}" r="${node.r ?? 0}"`;
    } else if (node.type === 'ellipse') {
      tag = 'ellipse';
      specificAttrs = `cx="${node.cx ?? 0}" cy="${node.cy ?? 0}" rx="${node.rxRadius ?? 0}" ry="${node.ryRadius ?? 0}"`;
    } else if (node.type === 'line') {
      tag = 'line';
      specificAttrs = `x1="${node.x1 ?? 0}" y1="${node.y1 ?? 0}" x2="${node.x2 ?? 0}" y2="${node.y2 ?? 0}"`;
    } else if (node.type === 'polygon' || node.type === 'polyline') {
      tag = node.type;
      const pts = (node.polyPoints || []).map(p => `${p.x},${p.y}`).join(' ');
      specificAttrs = `points="${pts}"`;
    }

    return `${indent}<${tag} id="${node.id}" ${specificAttrs} ${attrs.join(' ')} />`;
  }

  const nodesMarkup = nodes.map(n => serializeNode(n)).filter(Boolean).join('\n');
  const defsMarkup = defsContent.length > 0 ? `  <defs>\n${defsContent.join('\n')}\n  </defs>\n` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}" width="${width}" height="${height}">\n${defsMarkup}${nodesMarkup}\n</svg>`;
}
