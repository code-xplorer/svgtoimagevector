import { 
  VectorDocument, 
  VectorNode, 
  GradientDef, 
  LinearGradientDef, 
  RadialGradientDef, 
  SweepGradientDef, 
  VectorPaint, 
  PathCommand 
} from '../../types/vector';
import { ImageVectorConfig, DEFAULT_IMAGE_VECTOR_CONFIG } from '../../types/imagevector';
import { parseSvgPath } from '../parser/pathParser';
import { rectToPathData, ellipseToPathData, pointsToPathData } from '../geometry/bezier';

/**
 * Formats a float with 'f' suffix for Kotlin (e.g. 12.0f, 0.5f)
 */
function toFloatLit(val: number): string {
  if (isNaN(val)) return '0.0f';
  const fixed = val.toFixed(2);
  // remove trailing zeros if integer like 12.00 -> 12.0f
  const clean = fixed.replace(/\.?0+$/, '');
  return clean.includes('.') ? `${clean}f` : `${clean}.0f`;
}

/**
 * Converts a hex color (#RRGGBB or #AARRGGBB) to Kotlin Color(0x...)
 */
function toKotlinColor(hexColor: string, alpha: number = 1.0): string {
  let hex = hexColor.replace('#', '').toUpperCase();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Calculate ARGB hex
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  const aHex = a.toString(16).padStart(2, '0').toUpperCase();
  
  if (hex.length === 6) {
    return `Color(0x${aHex}${hex})`;
  }
  if (hex.length === 8) {
    return `Color(0x${hex})`;
  }
  return `Color(0xFF000000)`;
}

/**
 * Generates Kotlin Brush expression for Fill or Stroke
 */
function generateBrushCode(
  paint: VectorPaint, 
  gradients: Record<string, GradientDef>, 
  doc: VectorDocument, 
  indent: string
): string | null {
  if (paint.type === 'none') {
    return null;
  }

  if (paint.type === 'solid') {
    const colorCode = toKotlinColor(paint.color || '#000000', paint.alpha ?? 1);
    return `SolidColor(${colorCode})`;
  }

  // Gradient lookup
  const grad: GradientDef | undefined = paint.gradient || (paint.gradientId ? gradients[paint.gradientId] : undefined);
  if (!grad) {
    return `SolidColor(${toKotlinColor('#000000', 1)})`;
  }

  const { viewBox } = doc;

  if (grad.type === 'linear') {
    const lg = grad as LinearGradientDef;
    const x1 = lg.x1 <= 1 && lg.x2 <= 1 ? lg.x1 * viewBox.width : lg.x1;
    const y1 = lg.y1 <= 1 && lg.y2 <= 1 ? lg.y1 * viewBox.height : lg.y1;
    const x2 = lg.x2 <= 1 && lg.x2 <= 1 ? lg.x2 * viewBox.width : lg.x2;
    const y2 = lg.y2 <= 1 && lg.y2 <= 1 ? lg.y2 * viewBox.height : lg.y2;

    const stops = lg.stops.map(s => 
      `${indent}    ${toFloatLit(s.offset)} to ${toKotlinColor(s.color, s.opacity)}`
    ).join(',\n');

    return `Brush.linearGradient(\n${stops},\n${indent}    start = Offset(${toFloatLit(x1)}, ${toFloatLit(y1)}),\n${indent}    end = Offset(${toFloatLit(x2)}, ${toFloatLit(y2)})\n${indent})`;
  }

  if (grad.type === 'radial') {
    const rg = grad as RadialGradientDef;
    const cx = rg.cx <= 1 ? rg.cx * viewBox.width : rg.cx;
    const cy = rg.cy <= 1 ? rg.cy * viewBox.height : rg.cy;
    const r = rg.r <= 1 ? rg.r * Math.max(viewBox.width, viewBox.height) : rg.r;

    const stops = rg.stops.map(s => 
      `${indent}    ${toFloatLit(s.offset)} to ${toKotlinColor(s.color, s.opacity)}`
    ).join(',\n');

    return `Brush.radialGradient(\n${stops},\n${indent}    center = Offset(${toFloatLit(cx)}, ${toFloatLit(cy)}),\n${indent}    radius = ${toFloatLit(r)}\n${indent})`;
  }

  if (grad.type === 'sweep') {
    const sg = grad as SweepGradientDef;
    const cx = sg.cx <= 1 ? sg.cx * viewBox.width : sg.cx;
    const cy = sg.cy <= 1 ? sg.cy * viewBox.height : sg.cy;

    const stops = sg.stops.map(s => 
      `${indent}    ${toFloatLit(s.offset)} to ${toKotlinColor(s.color, s.opacity)}`
    ).join(',\n');

    return `Brush.sweepGradient(\n${stops},\n${indent}    center = Offset(${toFloatLit(cx)}, ${toFloatLit(cy)})\n${indent})`;
  }

  return null;
}

/**
 * Converts PathCommands to Compose PathBuilder DSL calls
 */
function generatePathCommandsCode(commands: PathCommand[], indent: string): string {
  const lines: string[] = [];

  for (const cmd of commands) {
    const { command, params, relative } = cmd;
    const upper = command.toUpperCase();

    switch (upper) {
      case 'M':
        if (relative) {
          lines.push(`${indent}moveToRelative(${toFloatLit(params[0])}, ${toFloatLit(params[1])})`);
        } else {
          lines.push(`${indent}moveTo(${toFloatLit(params[0])}, ${toFloatLit(params[1])})`);
        }
        break;
      case 'L':
        if (relative) {
          lines.push(`${indent}lineToRelative(${toFloatLit(params[0])}, ${toFloatLit(params[1])})`);
        } else {
          lines.push(`${indent}lineTo(${toFloatLit(params[0])}, ${toFloatLit(params[1])})`);
        }
        break;
      case 'H':
        if (relative) {
          lines.push(`${indent}horizontalLineToRelative(${toFloatLit(params[0])})`);
        } else {
          lines.push(`${indent}horizontalLineTo(${toFloatLit(params[0])})`);
        }
        break;
      case 'V':
        if (relative) {
          lines.push(`${indent}verticalLineToRelative(${toFloatLit(params[0])})`);
        } else {
          lines.push(`${indent}verticalLineTo(${toFloatLit(params[0])})`);
        }
        break;
      case 'C':
        if (relative) {
          lines.push(`${indent}curveToRelative(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${toFloatLit(params[3])}, ${toFloatLit(params[4])}, ${toFloatLit(params[5])})`);
        } else {
          lines.push(`${indent}curveTo(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${toFloatLit(params[3])}, ${toFloatLit(params[4])}, ${toFloatLit(params[5])})`);
        }
        break;
      case 'S':
        if (relative) {
          lines.push(`${indent}reflectiveCurveToRelative(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${toFloatLit(params[3])})`);
        } else {
          lines.push(`${indent}reflectiveCurveTo(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${toFloatLit(params[3])})`);
        }
        break;
      case 'Q':
        if (relative) {
          lines.push(`${indent}quadToRelative(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${toFloatLit(params[3])})`);
        } else {
          lines.push(`${indent}quadTo(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${toFloatLit(params[3])})`);
        }
        break;
      case 'T':
        if (relative) {
          lines.push(`${indent}reflectiveQuadToRelative(${toFloatLit(params[0])}, ${toFloatLit(params[1])})`);
        } else {
          lines.push(`${indent}reflectiveQuadTo(${toFloatLit(params[0])}, ${toFloatLit(params[1])})`);
        }
        break;
      case 'A':
        if (relative) {
          lines.push(`${indent}arcToRelative(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${params[3] === 1}, ${params[4] === 1}, ${toFloatLit(params[5])}, ${toFloatLit(params[6])})`);
        } else {
          lines.push(`${indent}arcTo(${toFloatLit(params[0])}, ${toFloatLit(params[1])}, ${toFloatLit(params[2])}, ${params[3] === 1}, ${params[4] === 1}, ${toFloatLit(params[5])}, ${toFloatLit(params[6])})`);
        }
        break;
      case 'Z':
        lines.push(`${indent}close()`);
        break;
    }
  }

  return lines.join('\n');
}

/**
 * Gets path commands for any VectorNode
 */
function getCommandsForNode(node: VectorNode): PathCommand[] {
  if (node.type === 'path') {
    if (node.pathData) {
      return parseSvgPath(node.pathData);
    }
    if (node.commands && node.commands.length > 0) {
      return node.commands;
    }
  }

  if (node.type === 'rect') {
    const d = rectToPathData(node.x ?? 0, node.y ?? 0, node.width ?? 0, node.height ?? 0, node.rx, node.ry);
    return parseSvgPath(d);
  }

  if (node.type === 'circle') {
    const d = ellipseToPathData(node.cx ?? 0, node.cy ?? 0, node.r ?? 0, node.r ?? 0);
    return parseSvgPath(d);
  }

  if (node.type === 'ellipse') {
    const d = ellipseToPathData(node.cx ?? 0, node.cy ?? 0, node.rxRadius ?? 0, node.ryRadius ?? 0);
    return parseSvgPath(d);
  }

  if (node.type === 'line') {
    const d = `M ${node.x1 ?? 0} ${node.y1 ?? 0} L ${node.x2 ?? 0} ${node.y2 ?? 0}`;
    return parseSvgPath(d);
  }

  if (node.type === 'polygon' || node.type === 'polyline') {
    const d = pointsToPathData(node.polyPoints || [], node.type === 'polygon');
    return parseSvgPath(d);
  }

  return [];
}

/**
 * Generates Kotlin code for a single node (or group)
 */
function generateNodeCode(
  node: VectorNode, 
  doc: VectorDocument, 
  config: ImageVectorConfig, 
  indent: string
): string {
  if (!node.visible) return '';

  if (node.type === 'group') {
    const lines: string[] = [];
    const t = node.transform;
    const hasTransform = t.translateX !== 0 || t.translateY !== 0 || t.scaleX !== 1 || t.scaleY !== 1 || t.rotate !== 0;

    let groupHeader = `${indent}group(`;
    const groupParams: string[] = [];
    if (node.name) groupParams.push(`name = "${node.name}"`);
    if (hasTransform) {
      if (t.rotate !== 0) groupParams.push(`rotate = ${toFloatLit(t.rotate)}`);
      if (t.originX !== 0) groupParams.push(`pivotX = ${toFloatLit(t.originX)}`);
      if (t.originY !== 0) groupParams.push(`pivotY = ${toFloatLit(t.originY)}`);
      if (t.scaleX !== 1) groupParams.push(`scaleX = ${toFloatLit(t.scaleX)}`);
      if (t.scaleY !== 1) groupParams.push(`scaleY = ${toFloatLit(t.scaleY)}`);
      if (t.translateX !== 0) groupParams.push(`translationX = ${toFloatLit(t.translateX)}`);
      if (t.translateY !== 0) groupParams.push(`translationY = ${toFloatLit(t.translateY)}`);
    }

    if (groupParams.length > 0) {
      groupHeader += groupParams.join(', ') + ') {';
    } else {
      groupHeader += ') {';
    }

    lines.push(groupHeader);

    if (node.children) {
      for (const child of node.children) {
        const childCode = generateNodeCode(child, doc, config, indent + '    ');
        if (childCode) lines.push(childCode);
      }
    }

    lines.push(`${indent}}`);
    return lines.join('\n');
  }

  const commands = getCommandsForNode(node);
  if (commands.length === 0) return '';

  const fillBrush = generateBrushCode(node.fill, doc.gradients, doc, indent);
  const strokeBrush = node.stroke.type !== 'none'
    ? generateBrushCode({ type: node.stroke.type, color: node.stroke.color, alpha: node.stroke.alpha }, doc.gradients, doc, indent)
    : null;

  const pathParams: string[] = [];

  // Name
  if (node.name) {
    pathParams.push(`name = "${node.name}"`);
  }

  const effectiveOpacity = node.opacity !== undefined ? node.opacity : 1;

  // Fill
  if (fillBrush) {
    pathParams.push(`fill = ${fillBrush}`);
    const effFillAlpha = (node.fill.alpha !== undefined ? node.fill.alpha : 1) * effectiveOpacity;
    if (effFillAlpha < 1) {
      pathParams.push(`fillAlpha = ${toFloatLit(effFillAlpha)}`);
    }
  }

  // Stroke
  if (strokeBrush) {
    pathParams.push(`stroke = ${strokeBrush}`);
    const effStrokeAlpha = (node.stroke.alpha !== undefined ? node.stroke.alpha : 1) * effectiveOpacity;
    if (effStrokeAlpha < 1) {
      pathParams.push(`strokeAlpha = ${toFloatLit(effStrokeAlpha)}`);
    }
    if (node.stroke.width !== 1) {
      pathParams.push(`strokeLineWidth = ${toFloatLit(node.stroke.width)}`);
    }
    if (node.stroke.cap && node.stroke.cap !== 'butt') {
      const capName = node.stroke.cap.charAt(0).toUpperCase() + node.stroke.cap.slice(1);
      pathParams.push(`strokeLineCap = StrokeCap.${capName}`);
    }
    if (node.stroke.join && node.stroke.join !== 'miter') {
      const joinName = node.stroke.join.charAt(0).toUpperCase() + node.stroke.join.slice(1);
      pathParams.push(`strokeLineJoin = StrokeJoin.${joinName}`);
    }
    if (node.stroke.miterLimit !== 4) {
      pathParams.push(`strokeLineMiter = ${toFloatLit(node.stroke.miterLimit)}`);
    }
  }

  // Fill Rule
  if (node.fillRule === 'evenodd') {
    pathParams.push(`pathFillType = PathFillType.EvenOdd`);
  }

  let pathCall = `${indent}path(\n`;
  pathCall += pathParams.map(p => `${indent}    ${p}`).join(',\n');
  pathCall += `\n${indent}) {\n`;

  // Path Commands
  pathCall += generatePathCommandsCode(commands, indent + '    ');
  pathCall += `\n${indent}}`;

  // Check if this node has non-identity transform applied (e.g. moved, scaled, or rotated on canvas)
  const t = node.transform;
  const hasTransform = t && (
    t.translateX !== 0 || 
    t.translateY !== 0 || 
    t.scaleX !== 1 || 
    t.scaleY !== 1 || 
    t.rotate !== 0
  );

  if (hasTransform) {
    const groupParams: string[] = [];
    if (node.name) groupParams.push(`name = "${node.name}Group"`);
    if (t.rotate !== 0) groupParams.push(`rotate = ${toFloatLit(t.rotate)}`);
    if (t.originX !== 0) groupParams.push(`pivotX = ${toFloatLit(t.originX)}`);
    if (t.originY !== 0) groupParams.push(`pivotY = ${toFloatLit(t.originY)}`);
    if (t.scaleX !== 1) groupParams.push(`scaleX = ${toFloatLit(t.scaleX)}`);
    if (t.scaleY !== 1) groupParams.push(`scaleY = ${toFloatLit(t.scaleY)}`);
    if (t.translateX !== 0) groupParams.push(`translationX = ${toFloatLit(t.translateX)}`);
    if (t.translateY !== 0) groupParams.push(`translationY = ${toFloatLit(t.translateY)}`);

    const groupHeader = `${indent}group(${groupParams.join(', ')}) {\n`;
    const indentedPath = pathCall
      .split('\n')
      .map(line => '    ' + line)
      .join('\n');
    return `${groupHeader}${indentedPath}\n${indent}}`;
  }

  return pathCall;
}

/**
 * Sanitizes identifier for Kotlin val / fun name (e.g. "My Custom Icon" -> "MyCustomIcon")
 */
export function sanitizeKotlinName(name: string): string {
  if (!name) return 'MyIcon';
  const clean = name.replace(/[^a-zA-Z0-9_]/g, ' ');
  const words = clean.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'MyIcon';
  const camel = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return /^[0-9]/.test(camel) ? `Icon${camel}` : camel;
}

/**
 * Recursively checks if any node in the document hierarchy uses gradients
 */
function hasAnyGradients(nodes: VectorNode[]): boolean {
  for (const n of nodes) {
    if (n.fill.type === 'linear' || n.fill.type === 'radial' || n.fill.type === 'sweep') return true;
    if (n.stroke.type === 'linear') return true;
    if (n.children && hasAnyGradients(n.children)) return true;
  }
  return false;
}

/**
 * Generates the complete Jetpack Compose ImageVector Kotlin snippet
 */
export function generateImageVectorCode(
  doc: VectorDocument, 
  userConfig?: Partial<ImageVectorConfig>
): string {
  const config: ImageVectorConfig = {
    ...DEFAULT_IMAGE_VECTOR_CONFIG,
    ...userConfig,
  };

  const vectorName = sanitizeKotlinName(config.name || doc.name);
  const backingFieldName = `_${vectorName.charAt(0).toLowerCase() + vectorName.slice(1)}`;
  const { viewBox, width, height } = doc;

  const defaultW = userConfig?.defaultWidthDp !== undefined ? userConfig.defaultWidthDp : width;
  const defaultH = userConfig?.defaultHeightDp !== undefined ? userConfig.defaultHeightDp : height;

  const hasGradients = Object.values(doc.gradients).length > 0 || hasAnyGradients(doc.nodes);

  // Imports
  let importsCode = '';
  if (config.generateImports) {
    const imports = [
      'import androidx.compose.ui.graphics.Color',
      'import androidx.compose.ui.graphics.SolidColor',
      'import androidx.compose.ui.graphics.StrokeCap',
      'import androidx.compose.ui.graphics.StrokeJoin',
      'import androidx.compose.ui.graphics.PathFillType',
      'import androidx.compose.ui.graphics.vector.ImageVector',
      'import androidx.compose.ui.graphics.vector.path',
      'import androidx.compose.ui.graphics.vector.group',
      'import androidx.compose.ui.unit.dp',
    ];

    if (hasGradients) {
      imports.push('import androidx.compose.ui.graphics.Brush');
      imports.push('import androidx.compose.ui.geometry.Offset');
    }

    if (config.format === 'remember') {
      imports.push('import androidx.compose.runtime.Composable');
      imports.push('import androidx.compose.runtime.remember');
    }

    importsCode = (config.packageName ? `package ${config.packageName}\n\n` : '') + imports.join('\n') + '\n\n';
  }

  // Builder code
  const indent = '        ';
  const nodesCode = doc.nodes
    .map(n => generateNodeCode(n, doc, config, indent))
    .filter(Boolean)
    .join('\n\n');

  const builderBlock = `ImageVector.Builder(
    name = "${vectorName}",
    defaultWidth = ${toFloatLit(defaultW)}.dp,
    defaultHeight = ${toFloatLit(defaultH)}.dp,
    viewportWidth = ${toFloatLit(viewBox.width)},
    viewportHeight = ${toFloatLit(viewBox.height)}
).apply {
${nodesCode}
}.build()`;

  let body = '';

  if (config.format === 'materialIcon') {
    body = `public val ${vectorName}: ImageVector
    get() {
        if (${backingFieldName} != null) {
            return ${backingFieldName}!!
        }
        ${backingFieldName} = ${builderBlock.split('\n').map((l, i) => (i === 0 ? l : '        ' + l)).join('\n')}
        return ${backingFieldName}!!
    }

private var ${backingFieldName}: ImageVector? = null`;
  } else if (config.format === 'remember') {
    body = `@Composable
public fun remember${vectorName}(): ImageVector {
    return remember {
        ${builderBlock.split('\n').map((l, i) => (i === 0 ? l : '        ' + l)).join('\n')}
    }
}`;
  } else if (config.format === 'property') {
    body = `public val ${vectorName}: ImageVector by lazy {
    ${builderBlock.split('\n').map((l, i) => (i === 0 ? l : '    ' + l)).join('\n')}
}`;
  } else {
    // builderOnly
    body = builderBlock;
  }

  return importsCode + body;
}
