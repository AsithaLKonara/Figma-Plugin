figma.showUI(__html__, { width: 640, height: 520 });

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function rgba(paint) {
  if (!paint || paint.type !== 'SOLID') return '';
  const c = paint.color; const a = (paint.opacity != null ? paint.opacity : 1);
  const r = Math.round(clamp01(c.r) * 255);
  const g = Math.round(clamp01(c.g) * 255);
  const b = Math.round(clamp01(c.b) * 255);
  return `rgba(${r}, ${g}, ${b}, ${(+a).toFixed(2)})`;
}

function colorHex(paint){
  if (!paint || paint.type !== 'SOLID') return '';
  const c = paint.color;
  const r = Math.round(clamp01(c.r) * 255).toString(16).padStart(2,'0');
  const g = Math.round(clamp01(c.g) * 255).toString(16).padStart(2,'0');
  const b = Math.round(clamp01(c.b) * 255).toString(16).padStart(2,'0');
  return `#${r}${g}${b}`;
}

function nodeSize(n){ return `w ${Math.round(n.width)} h ${Math.round(n.height)}`; }

function padding(n){
  if (!('paddingLeft' in n)) return '';
  const pl = (n.paddingLeft != null ? n.paddingLeft : 0);
  const pr = (n.paddingRight != null ? n.paddingRight : 0);
  const pt = (n.paddingTop != null ? n.paddingTop : 0);
  const pb = (n.paddingBottom != null ? n.paddingBottom : 0);
  return `padding left ${pl} right ${pr} top ${pt} bottom ${pb}`;
}

function radius(n){
  if (!('cornerRadius' in n)) return '';
  const r = n.cornerRadius;
  if (typeof r === 'number') return `corner radius ${Math.round(r)}`;
  // mixed radii
  const tl = Math.round(n.topLeftRadius || 0);
  const tr = Math.round(n.topRightRadius || 0);
  const br = Math.round(n.bottomRightRadius || 0);
  const bl = Math.round(n.bottomLeftRadius || 0);
  return `corner radii ${tl}/${tr}/${br}/${bl}`;
}

function fills(n){
  if (!('fills' in n)) return '';
  const f = n.fills;
  if (f === figma.mixed || !Array.isArray(f) || f.length === 0) return '';
  const p = f[0];
  if (p.type === 'SOLID') return `fill ${colorHex(p)} (${rgba(p)})`;
  if (p.type === 'IMAGE') return `fill image`; // keep compact
  return `fill ${p.type.toLowerCase()}`;
}

function strokes(n){
  if (!('strokes' in n)) return '';
  const s = n.strokes;
  if (s === figma.mixed || !Array.isArray(s) || s.length === 0) return '';
  const p = s[0];
  const sw = (typeof n.strokeWeight === 'number' ? n.strokeWeight : 1);
  if (p.type === 'SOLID') return `stroke ${colorHex(p)} ${sw}`;
  return `stroke ${p.type.toLowerCase()} ${sw}`;
}

function textSpec(n){
  let family = '', style = '';
  if (n.fontName && typeof n.fontName !== 'symbol') {
    family = n.fontName.family; style = n.fontName.style;
  }
  const size = Math.round(n.fontSize || 0);
  const lh = (n.lineHeight && typeof n.lineHeight !== 'symbol' && n.lineHeight.unit === 'PIXELS') ? Math.round(n.lineHeight.value) : 0;
  const weight = style.toLowerCase().includes('semi') ? 'semibold' : style.toLowerCase();
  const paints = Array.isArray(n.fills) ? n.fills : [];
  const col = paints.length ? colorHex(paints[0]) : '';
  const line = `text ${nodeSize(n)} ${family}/${size} line ${lh} ${weight || ''} ${col}`.trim();
  return { line, text: n.characters };
}

function layoutSpec(n){
  const children = (n.children || []);
  const mode = n.layoutMode; // 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  const gap = (n.itemSpacing != null ? n.itemSpacing : 0);
  const dir = mode === 'HORIZONTAL' ? 'cols' : mode === 'VERTICAL' ? 'rows' : 'stack';
  return `${dir} ${children.length} gap ${gap}`;
}

function describeNode(n, level){
  const indent = '    '.repeat(level);
  const out = [];
  if (n.type === 'TEXT') {
    const t = textSpec(n);
    out.push(`${indent}{${t.line}}`);
    if (t.text && t.text.trim()) out.push(`${indent}{"${t.text.replace(/\n/g,'\\n')}"}`);
    return out;
  }

  if (n.type === 'RECTANGLE' || n.type === 'ELLIPSE' || n.type === 'POLYGON' || n.type === 'STAR' || n.type === 'VECTOR' || n.type === 'LINE') {
    const head = [nodeSize(n), radius(n), fills(n), strokes(n)].filter(Boolean).join(' ');
    out.push(`${indent}{${head}}`);
    return out;
  }

  if (n.type === 'FRAME' || n.type === 'GROUP' || n.type === 'COMPONENT' || n.type === 'INSTANCE') {
    const bits = [nodeSize(n), padding(n), radius(n), fills(n), strokes(n)].filter(Boolean).join(' ');
    const l = (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE') ? layoutSpec(n) : '';
    out.push(`${indent}{${bits} ${l}`.trimEnd());
    const kids = (n.children || []);
    for (const k of kids) out.push(...describeNode(k, level + 1));
    out.push(`${indent}}`);
    return out;
  }

  out.push(`${indent}{${nodeSize(n)}}`);
  return out;
}

function toTempFormat(node){
  const name = node.name || 'Node';
  return [`${name} {`, ...describeNode(node, 1), `}`].join('\n');
}

// -------- Accurate JSON extractor (compat-safe, organized) --------

function serializePaint(p) {
  if (!p) return null;
  var out = { type: p.type };
  if (p.type === 'SOLID') {
    out.color = { r: p.color.r, g: p.color.g, b: p.color.b };
    out.opacity = (p.opacity != null ? p.opacity : 1);
  } else if (p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_RADIAL' || p.type === 'GRADIENT_ANGULAR' || p.type === 'GRADIENT_DIAMOND') {
    out.gradientStops = (p.gradientStops || []).map(function(s){
      return { position: s.position, color: { r: s.color.r, g: s.color.g, b: s.color.b, a: (s.color.a != null ? s.color.a : 1) } };
    });
    out.gradientTransform = p.gradientTransform;
  } else if (p.type === 'IMAGE') {
    out.scaleMode = p.scaleMode;
  }
  out.visible = (p.visible !== false);
  return out;
}

function serializeStrokeCap(v){ return v || null; }
function serializeStrokeJoin(v){ return v || null; }

function serializeEffect(e){
  if (!e) return null;
  var out = { type: e.type, visible: (e.visible !== false) };
  if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
    out.color = { r: e.color.r, g: e.color.g, b: e.color.b, a: (e.color.a != null ? e.color.a : 1) };
    out.offset = e.offset;
    out.radius = e.radius;
    out.spread = (e.spread != null ? e.spread : 0);
    out.blendMode = e.blendMode || null;
  } else if (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') {
    out.radius = e.radius;
  }
  return out;
}

function serializeConstraints(n){
  if (!('constraints' in n)) return null;
  return {
    horizontal: n.constraints ? n.constraints.horizontal : null,
    vertical: n.constraints ? n.constraints.vertical : null
  };
}

function serializeCornerRadii(n){
  if (!('cornerRadius' in n)) return null;
  if (typeof n.cornerRadius === 'number') return { all: n.cornerRadius };
  return {
    topLeft: (n.topLeftRadius || 0),
    topRight: (n.topRightRadius || 0),
    bottomRight: (n.bottomRightRadius || 0),
    bottomLeft: (n.bottomLeftRadius || 0)
  };
}

function serializeLayout(n){
  var obj = {};
  if ('layoutMode' in n) obj.layoutMode = n.layoutMode;
  if ('itemSpacing' in n) obj.itemSpacing = (n.itemSpacing != null ? n.itemSpacing : 0);
  if ('primaryAxisSizingMode' in n) obj.primaryAxisSizingMode = n.primaryAxisSizingMode;
  if ('counterAxisSizingMode' in n) obj.counterAxisSizingMode = n.counterAxisSizingMode;
  if ('paddingLeft' in n) obj.padding = { left: n.paddingLeft||0, right: n.paddingRight||0, top: n.paddingTop||0, bottom: n.paddingBottom||0 };
  if ('primaryAxisAlignItems' in n) obj.primaryAxisAlignItems = n.primaryAxisAlignItems;
  if ('counterAxisAlignItems' in n) obj.counterAxisAlignItems = n.counterAxisAlignItems;
  return obj;
}

function serializeTypography(n){
  if (n.type !== 'TEXT') return null;
  var family = '', style = '';
  if (n.fontName && typeof n.fontName !== 'symbol') { family = n.fontName.family; style = n.fontName.style; }
  var lh = (n.lineHeight && typeof n.lineHeight !== 'symbol' && n.lineHeight.unit === 'PIXELS') ? n.lineHeight.value : null;
  return {
    fontFamily: family || null,
    fontStyle: style || null,
    fontSize: (n.fontSize != null ? n.fontSize : null),
    lineHeightPx: lh,
    letterSpacing: (n.letterSpacing && typeof n.letterSpacing !== 'symbol') ? n.letterSpacing : null,
    textCase: n.textCase || null,
    textDecoration: n.textDecoration || null,
    fills: (Array.isArray(n.fills) && n.fills !== figma.mixed) ? n.fills.map(serializePaint) : [],
    characters: n.characters || ''
  };
}

function serializeStrokes(n){
  if (!('strokes' in n)) return [];
  if (n.strokes === figma.mixed) return [];
  var sw = (typeof n.strokeWeight === 'number' ? n.strokeWeight : 1);
  return (Array.isArray(n.strokes) ? n.strokes : []).map(function(s){
    var o = serializePaint(s) || {};
    o.weight = sw;
    o.alignment = n.strokeAlign || null;
    o.cap = serializeStrokeCap(n.strokeCap);
    o.join = serializeStrokeJoin(n.strokeJoin);
    return o;
  });
}

function serializeFills(n){
  if (!('fills' in n)) return [];
  if (n.fills === figma.mixed) return [];
  return (Array.isArray(n.fills) ? n.fills : []).map(serializePaint).filter(function(x){return !!x;});
}

function serializeEffects(n){
  if (!('effects' in n)) return [];
  if (n.effects === figma.mixed) return [];
  return (Array.isArray(n.effects) ? n.effects : []).map(serializeEffect).filter(function(x){return !!x;});
}

function serializeComponentInfo(n){
  var info = { type: n.type };
  if (n.type === 'INSTANCE') {
    info.componentId = (n.mainComponent ? n.mainComponent.id : null);
    info.componentName = (n.mainComponent ? n.mainComponent.name : null);
    info.variantProperties = n.variantProperties || null;
  } else if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') {
    info.componentId = n.id;
    info.componentName = n.name;
  }
  return info;
}

function extractNode(node){
  var o = {
    id: node.id,
    name: node.name || null,
    type: node.type,
    visible: (node.visible !== false),
    width: Math.round(node.width),
    height: Math.round(node.height),
    opacity: ('opacity' in node ? node.opacity : 1),
    blendMode: ('blendMode' in node ? node.blendMode : null),
    layout: serializeLayout(node),
    cornerRadii: serializeCornerRadii(node),
    fills: serializeFills(node),
    strokes: serializeStrokes(node),
    effects: serializeEffects(node),
    constraints: serializeConstraints(node),
    typography: serializeTypography(node),
    component: serializeComponentInfo(node)
  };
  var kids = (node.children || []);
  if (kids && kids.length) o.children = kids.map(extractNode);
  return o;
}

function toJSONSpec(node){
  var payload = extractNode(node);
  return JSON.stringify(payload, null, 2);
}

async function sendToApp(name, content, endpoint){
  try {
    var url = endpoint || 'http://localhost:3000/api/figma-spec';
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, content })
    });
    figma.ui.postMessage({ posted: true });
  } catch (e) {
    figma.ui.postMessage({ posted: false, error: String(e) });
  }
}

function run(opts){
  const sel = figma.currentPage.selection[0];
  if (!sel){ figma.ui.postMessage({ error: 'Select a frame or group.' }); return; }
  var format = (opts && opts.format) ? opts.format : 'json';
  var spec = (format === 'json') ? toJSONSpec(sel) : toTempFormat(sel);
  figma.ui.postMessage({ spec, name: sel.name || 'Spec' });
}

run({ format: 'json' });

figma.ui.onmessage = async (msg) => {
  if (msg && msg.action === 'refresh') run({ format: msg.format || 'json' });
  if (msg && msg.action === 'send' && msg.name && msg.content){
    await sendToApp(msg.name, msg.content, msg.endpoint);
  }
};


