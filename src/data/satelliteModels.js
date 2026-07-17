/**
 * Realistic satellite GLB assets — sourced via Arka MCP (arka_ask, arka_bookmarks,
 * three_js_model guide, compose_3d check) and NASA 3D Resources CDN downloads.
 *
 * NASA assets are free to use; see https://www.nasa.gov/nasa-brand-center/images-and-media/
 */

export const SATELLITE_MODELS = {
  hubble: {
    url: '/models/hubble.glb',
    source: 'NASA 3D Resources — Hubble Space Telescope (A)',
    sourceUrl: 'https://science.nasa.gov/3d-resources/hubble-space-telescope-a/',
    scaleFactor: 1,
    rotation: [0, Math.PI / 2, 0],
  },
  iss: {
    url: '/models/iss.glb',
    source: 'NASA 3D Resources — International Space Station',
    sourceUrl: 'https://science.nasa.gov/resource/international-space-station-3d-model/',
    scaleFactor: 0.85,
    rotation: [0, Math.PI / 2, 0],
  },
  terra: {
    url: '/models/terra.glb',
    source: 'NASA 3D Resources — Terra',
    sourceUrl: 'https://science.nasa.gov/3d-resources/terra/',
    scaleFactor: 1,
    rotation: [0, 0, 0],
  },
  'suomi-npp': {
    url: '/models/suomi-npp.glb',
    source: 'NASA 3D Resources — Suomi NPP',
    sourceUrl: 'https://science.nasa.gov/3d-resources/suomi-national-polar-orbiting-partnership-suomi-npp/',
    scaleFactor: 1,
    rotation: [0, 0, 0],
  },
  tdrs: {
    url: '/models/tdrs.glb',
    source: 'NASA 3D Resources — TDRS (D)',
    sourceUrl: 'https://science.nasa.gov/3d-resources/tracking-and-data-relay-satellites-tdrs-d/',
    scaleFactor: 1,
    rotation: [0, Math.PI / 2, 0],
  },
  aura: {
    url: '/models/aura.glb',
    source: 'NASA 3D Resources — Aura (D)',
    sourceUrl: 'https://science.nasa.gov/3d-resources/aura-d/',
    scaleFactor: 1,
    rotation: [0, 0, 0],
  },
  acrimsat: {
    url: '/models/acrimsat.glb',
    source: 'NASA 3D Resources — AcrimSAT (A)',
    sourceUrl: 'https://science.nasa.gov/3d-resources/active-cavity-irradiance-monitor-satellite-acrimsat-a/',
    scaleFactor: 1,
    rotation: [0, 0, 0],
  },
}

/** GLB models with missing external textures — use procedural meshes instead. */
const BROKEN_MODEL_KEYS = new Set(['terra'])

/** Per-satellite model assignment (variant defaults used when id is absent). */
const MODEL_BY_ID = {
  iss: 'iss',
  hubble: 'hubble',
  tiangong: 'iss',
  sentinel1: 'aura',
  noaa20: 'suomi-npp',
  metop: 'suomi-npp',
  aeolus: 'acrimsat',
  gps: 'acrimsat',
  galileo: 'acrimsat',
  goes16: 'tdrs',
  tdrs: 'tdrs',
}

const MODEL_BY_VARIANT = {
  telescope: 'hubble',
  station: 'iss',
  array: 'aura',
  nav: 'acrimsat',
  geo: 'tdrs',
}

export function resolveSatelliteModelKey({ id, variant }) {
  if (id && MODEL_BY_ID[id]) {
    const key = MODEL_BY_ID[id]
    return BROKEN_MODEL_KEYS.has(key) ? null : key
  }
  if (variant && MODEL_BY_VARIANT[variant]) {
    const key = MODEL_BY_VARIANT[variant]
    return BROKEN_MODEL_KEYS.has(key) ? null : key
  }
  return null
}

export function modelAttribution(modelKey) {
  const entry = SATELLITE_MODELS[modelKey]
  if (!entry) return 'Procedural fallback mesh'
  return entry.source
}
