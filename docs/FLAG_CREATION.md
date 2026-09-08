# Drawing a missing country map

Covers the country outline icons this repo draws itself, in [maps/](../maps/).  Flags are not drawn here -- they come from flagcdn, with a worldflags.net fallback, both keyed off the country's ISO code in [data/capitals.json](../data/capitals.json).

## Why any map is drawn here at all

Every other country's outline loads from [mapsicon](https://github.com/djaiss/mapsicon) at `all/<iso>/vector.svg`.  Five countries have no folder there: `fm`, `mh`, `ps`, `tv`, `xk`.  Kosovo (`xk`) is covered by [an upstream PR](https://github.com/djaiss/mapsicon/pull/29) that has been open since 2020, so it loads from the contributor's fork pinned to that PR's commit.  Palestine (`ps`) and Micronesia (`fm`) have no upstream fix, so their outlines are generated from public-domain geometry and committed here.

Marshall Islands (`mh`) and Tuvalu (`tv`) are still missing.  They render with no map.

## How a country resolves its map

`mapUrl` in [data/capitals.json](../data/capitals.json) overrides the mapsicon URL.  It takes either an absolute URL or a repo-relative path:

```json
"Palestine": { "capital": "Jerusalem", "iso": null, "flagSlug": "palestine", "mapUrl": "maps/ps.svg" }
```

[js/country_images.js](../js/country_images.js) prefers the override, falls back to the ISO-derived mapsicon URL, and hides the image when there is neither.  A country with `iso: null` still gets a map this way -- that is how Palestine and Micronesia work.

## Generating an icon

[tools/make_map_icon.py](../tools/make_map_icon.py) turns Natural Earth geometry into a mapsicon-shaped SVG.  Stdlib only, no dependencies.

```sh
curl -sSLo /tmp/ne10.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
python3 tools/make_map_icon.py /tmp/ne10.geojson maps
```

The source is [Natural Earth](https://www.naturalearthdata.com/) 1:10m Admin 0, which is public domain -- no attribution required, safe to redistribute.  The 1:110m file is 60x smaller but drops small islands and reduces Palestine to the West Bank alone, so use 10m.

To add a country, append it to `TARGETS` in the script: the Natural Earth `NAME`, the output filename, and the island-growth threshold (0 for anything that is not a scattered archipelago).  Then add its `mapUrl` to [data/capitals.json](../data/capitals.json).

## What the script does

**Picks the outer ring of every part.**  A MultiPolygon becomes one ring per part, so all 20 Micronesian islands survive.  Holes are dropped, matching mapsicon's solid silhouettes.

**Projects equirectangular, with the standard parallel at the country's own centre.**  Longitude is multiplied by `cos(mid_latitude)` so a degree of longitude gets the same ground length as a degree of latitude there.  Without it every country looks stretched sideways, badly so at high latitudes.  Over a single country this is visually indistinguishable from Mercator.

**Fits to a 1024 square with 32px of padding**, scaling on the longer axis so the aspect ratio holds.

**Grows islands that would otherwise vanish.**  Micronesia's islands are a few km across but spread over 2500km of ocean, so fitted honestly they land at roughly one pixel each and the icon reads as blank.  Each ring smaller than the threshold is scaled about its own centre until it clears it, which keeps every island's true position and shape while making the archipelago legible.  100px was picked by eye against 70 and 130 -- 70 still reads as specks, 130 starts merging neighbours.

**Emits one `<path>`, no `fill`.**  Same as mapsicon: the default black fill is what the game's CSS expects.

## Checking the result

The projection is verified against a country mapsicon already has.  Generate Serbia, put it next to `all/rs/vector.svg`, and the outlines should match:

```sh
python3 - <<'EOF'
import sys; sys.path.insert(0, 'tools')
from make_map_icon import build
build('/tmp/ne10.geojson', 'Serbia', '/tmp/rs_check.svg')
EOF
curl -sSLo /tmp/rs_mapsicon.svg https://raw.githubusercontent.com/djaiss/mapsicon/master/all/rs/vector.svg
```

Open both.  If the generated one is visibly wider or narrower, the projection is wrong.

[tests/countryImages.test.js](../tests/countryImages.test.js) covers the rest: each committed icon exists on disk, uses the 1024 viewBox, holds exactly one path, and sets no `fill`; each remote override is pinned to a 40-character commit SHA rather than a branch.
