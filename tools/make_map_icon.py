"""Build a mapsicon-style 1024x1024 silhouette SVG from Natural Earth 10m geometry."""
import json, math, sys

SIZE = 1024
PADDING = 32  # mapsicon leaves a little air around the outline

def load_country(path, name):
    for feature in json.load(open(path))['features']:
        if feature['properties'].get('NAME') == name:
            geometry = feature['geometry']
            if geometry['type'] == 'MultiPolygon':
                return [ring for poly in geometry['coordinates'] for ring in poly[:1]]
            return [geometry['coordinates'][0]]
    raise SystemExit(f'{name} not found')

def project(rings):
    """Equirectangular with the standard parallel at the country's centre, so
    longitude degrees get the same ground length as latitude degrees there."""
    lats = [lat for ring in rings for _, lat in ring]
    mid_lat = (min(lats) + max(lats)) / 2
    k = math.cos(math.radians(mid_lat))
    return [[(lon * k, -lat) for lon, lat in ring] for ring in rings]

def bounds(rings):
    xs = [x for ring in rings for x, _ in ring]
    ys = [y for ring in rings for _, y in ring]
    return min(xs), min(ys), max(xs), max(ys)

def grow_small_islands(rings, min_span):
    """Islands a couple of pixels across vanish at icon size.  Scale each one
    about its own centre until it clears min_span, leaving its real position
    and shape intact."""
    grown = []
    for ring in rings:
        x0, y0, x1, y1 = bounds([ring])
        span = max(x1 - x0, y1 - y0)
        if span >= min_span or span == 0:
            grown.append(ring)
            continue
        factor = min_span / span
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        grown.append([(cx + (x - cx) * factor, cy + (y - cy) * factor) for x, y in ring])
    return grown

def fit(rings):
    x0, y0, x1, y1 = bounds(rings)
    scale = (SIZE - 2 * PADDING) / max(x1 - x0, y1 - y0)
    dx = (SIZE - (x1 - x0) * scale) / 2 - x0 * scale
    dy = (SIZE - (y1 - y0) * scale) / 2 - y0 * scale
    return [[(x * scale + dx, y * scale + dy) for x, y in ring] for ring in rings], scale

def to_path(rings, decimals=1):
    parts = []
    for ring in rings:
        points = [(round(x, decimals), round(y, decimals)) for x, y in ring]
        deduped = [p for i, p in enumerate(points) if i == 0 or p != points[i - 1]]
        if len(deduped) < 3:
            continue
        parts.append('M' + 'L'.join(f'{x},{y}' for x, y in deduped) + 'Z')
    return ''.join(parts)

def build(geojson, name, out_path, min_span_px=0):
    rings = project(load_country(geojson, name))
    fitted, scale = fit(rings)
    if min_span_px:
        fitted, _ = fit(grow_small_islands(fitted, min_span_px))
    svg = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        f'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" '
        f'viewBox="0 0 {SIZE} {SIZE}" xml:space="preserve">\n'
        f'<path d="{to_path(fitted)}"/>\n</svg>\n'
    )
    open(out_path, 'w').write(svg)
    print(f'{name}: {len(rings)} rings, {len(svg)} bytes -> {out_path}')

# Natural Earth names, the icon filename, and how far a lone island has to be
# grown before it survives at icon size.
TARGETS = [
    ('Palestine', 'ps.svg', 0),
    ('Micronesia', 'fm.svg', 100),
    ('Tuvalu', 'tv.svg', 120),
    ('Marshall Is.', 'mh.svg', 90),
]

# The UK shares one ISO code across four countries that mapsicon draws as a
# single union outline.  Admin 0 has no separate entry for any of them --
# admin_0_map_subunits does, so these come from that file instead.
SUBUNIT_TARGETS = [
    ('England', 'england.svg', 0),
    ('Scotland', 'scotland.svg', 0),
    ('Wales', 'wales.svg', 0),
    ('N. Ireland', 'northern-ireland.svg', 0),
]

if __name__ == '__main__':
    geojson, out_dir = sys.argv[1], sys.argv[2]
    for name, filename, min_span in TARGETS:
        build(geojson, name, f'{out_dir}/{filename}', min_span_px=min_span)
    if len(sys.argv) > 3:
        subunits_geojson = sys.argv[3]
        for name, filename, min_span in SUBUNIT_TARGETS:
            build(subunits_geojson, name, f'{out_dir}/{filename}', min_span_px=min_span)
