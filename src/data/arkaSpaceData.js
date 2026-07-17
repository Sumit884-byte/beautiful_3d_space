/**
 * Astronomy data fetched via Arka MCP (arka_ask, arka_skill astronomy, arka_timekit)
 * on 2026-07-17 UTC.
 */
export const ARKA_SPACE_DATA = {
  fetchedAt: '2026-07-17T10:37:19+00:00',
  source: 'Arka MCP',
  moon: {
    name: 'Moon',
    phase: 'Full Moon',
    illumination: 100,
    distanceKm: 384_400,
    synodicPeriodDays: 29.5,
    apparentMagnitude: -12.74,
  },
  earth: {
    name: 'Earth',
    sunDistanceAu: 1.0,
    sunDistanceKm: 149_600_000,
  },
  sun: {
    name: 'Sun',
    color: '#ffd27a',
  },
  mars: {
    name: 'Mars',
    color: '#c1440e',
    orbitRadiusAu: 1.52,
    orbitalPeriodDays: 687,
  },
  iss: {
    name: 'ISS',
    altitudeKm: 408,
    orbitalPeriodMinutes: 92,
  },
  saturn: {
    name: 'Saturn',
    ringSystem: 'Seven main rings (A–G)',
    orbitalPeriodDays: 10_759,
  },
  textures: {
    earth: 'NASA Blue Marble (three.js examples)',
    earthClouds: 'NASA Blue Marble cloud layer (Arka MCP bookmark)',
    moon: 'Lunar surface (three.js examples)',
    mars: '2k Mars (Solar System Scope)',
    sun: '2k Sun (Solar System Scope)',
    saturn: '2k Saturn + ring alpha (Solar System Scope)',
    mercury: '2k Mercury (Solar System Scope)',
    venus: '2k Venus atmosphere (Solar System Scope)',
    jupiter: '2k Jupiter (Solar System Scope)',
    uranus: '2k Uranus (Solar System Scope)',
    neptune: '2k Neptune (Solar System Scope)',
  },
  facts: [
    "Earth's clouds are a real NASA Blue Marble layer — they drift slightly faster than the surface.",
    'Light from the Sun takes about 8 minutes 20 seconds to reach Earth.',
    'The ISS orbits Earth roughly every 92 minutes at ~408 km altitude.',
    'Mars appears red due to iron oxide (rust) dust on its surface.',
    'Saturn\'s rings are mostly ice particles ranging from microns to meters in size.',
    'Over 10,000 satellites orbit Earth — LEO swarms, MEO navigation, and GEO weather sentinels.',
    'Hubble has captured light from galaxies over 13 billion light-years away.',
    'Jupiter is so massive that all other planets could fit inside it more than twice.',
    'Uranus rotates on its side — likely from an ancient giant impact.',
    'Neptune was the first planet found through mathematics, not a telescope.',
    'Venus spins backwards compared to most planets — one day there is longer than its year.',
  ],
}

export function formatDistance(km) {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(2)}M km`
  if (km >= 1_000) return `${(km / 1_000).toFixed(1)}k km`
  return `${Math.round(km)} km`
}
