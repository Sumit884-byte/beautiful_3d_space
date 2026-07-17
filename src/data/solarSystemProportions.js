/**
 * Solar system proportions — NASA/JPL ratios, spacing tuned via Arka MCP 2026-07-17.
 *
 * Terrestrial sizes: linear vs Earth (radius 1.2).
 * Gas giants: power-law compression keeps Jupiter > Saturn while avoiding overlap.
 * Orbits: log(AU) ideal positions, then collision-aware forward pass (no mesh overlap).
 * Speeds: Kepler ω ∝ AU^-1.5 (uses real AU, not display orbit radius).
 */

export const EARTH_RADIUS = 1.2
/** Display diameter vs Earth; real Sun ≈ 109×. Radius = half of this × EARTH_RADIUS. */
export const SUN_DISPLAY_DIAMETER_RATIO = 10

export const REAL = {
  sun: { diameterEarth: 109.1, orbitAu: 0, periodDays: null },
  mercury: { diameterEarth: 0.383, orbitAu: 0.387, periodDays: 88 },
  venus: { diameterEarth: 0.949, orbitAu: 0.723, periodDays: 225 },
  earth: { diameterEarth: 1, orbitAu: 1, periodDays: 365.25 },
  moon: { diameterEarth: 0.273, orbitEarthRadii: 60.3, periodDays: 27.3 },
  mars: { diameterEarth: 0.532, orbitAu: 1.524, periodDays: 687 },
  jupiter: { diameterEarth: 11.21, orbitAu: 5.203, periodDays: 4333 },
  saturn: { diameterEarth: 9.45, orbitAu: 9.537, periodDays: 10759 },
  uranus: { diameterEarth: 4.01, orbitAu: 19.19, periodDays: 30687 },
  neptune: { diameterEarth: 3.88, orbitAu: 30.07, periodDays: 60190 },
}

const ORBIT_AU_MIN = 0.387
const ORBIT_AU_MAX = 30.07
const ORBIT_SCENE_OUTER = 58
const ORBIT_GAP = 0.45
const EARTH_ORBIT_SPEED = 0.1
const MOON_ORBIT_SCALE = 0.065
const SATELLITE_ORBIT_SCALE = 0.85
const GIANT_THRESHOLD = 1.15
const GIANT_SIZE_EXPONENT = 0.58

export const HELIOCENTRIC_IDS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

export function bodyRadius(id) {
  const body = REAL[id]
  if (!body) return EARTH_RADIUS
  if (id === 'sun') return (SUN_DISPLAY_DIAMETER_RATIO / 2) * EARTH_RADIUS
  const d = body.diameterEarth
  if (d <= GIANT_THRESHOLD) return d * EARTH_RADIUS
  return EARTH_RADIUS * d ** GIANT_SIZE_EXPONENT
}

/** Radius used for orbit spacing (includes Saturn ring extent). */
export function collisionRadius(id) {
  const r = bodyRadius(id)
  if (id === 'saturn') return r * 1.95
  return r
}

function naturalOrbitFromAu(au, sceneMin, sceneMax) {
  const logMin = Math.log(ORBIT_AU_MIN)
  const logMax = Math.log(ORBIT_AU_MAX)
  const t = (Math.log(au) - logMin) / (logMax - logMin)
  return sceneMin + t * (sceneMax - sceneMin)
}

function computeResolvedOrbits() {
  const sunR = bodyRadius('sun')
  const sceneMin = sunR + ORBIT_GAP
  const resolved = {}

  let prevOrbit = 0
  let prevR = sunR

  for (const id of HELIOCENTRIC_IDS) {
    const r = collisionRadius(id)
    const natural = naturalOrbitFromAu(REAL[id].orbitAu, sceneMin, ORBIT_SCENE_OUTER)
    const minFromSun = sunR + r + ORBIT_GAP
    const minFromPrev = prevOrbit + prevR + r + ORBIT_GAP
    const orbit = Math.max(natural, minFromSun, minFromPrev)
    resolved[id] = orbit
    prevOrbit = orbit
    prevR = r
  }

  return resolved
}

const RESOLVED_ORBITS = computeResolvedOrbits()

export function orbitRadiusFor(id) {
  return RESOLVED_ORBITS[id] ?? 0
}

export function heliocentricOrbit(au) {
  if (!au || au <= 0) return 0
  for (const id of HELIOCENTRIC_IDS) {
    if (REAL[id].orbitAu === au) return RESOLVED_ORBITS[id]
  }
  const sunR = bodyRadius('sun')
  const sceneMin = sunR + ORBIT_GAP
  const sceneMax = maxOrbitRadius()
  return naturalOrbitFromAu(au, sceneMin, sceneMax)
}

export function heliocentricSpeed(au) {
  if (!au || au <= 0) return 0
  return EARTH_ORBIT_SPEED / au ** 1.5
}

export function maxOrbitRadius() {
  return Math.max(...Object.values(RESOLVED_ORBITS))
}

export function maxSceneExtent() {
  return maxOrbitRadius() + collisionRadius('neptune') + 10
}

export function moonOrbitRadius() {
  return REAL.moon.orbitEarthRadii * EARTH_RADIUS * MOON_ORBIT_SCALE
}

export function moonOrbitalSpeed() {
  const earthYear = REAL.earth.periodDays
  const moonPeriod = REAL.moon.periodDays
  return EARTH_ORBIT_SPEED * (earthYear / moonPeriod) * 8
}

export function altitudeToOrbitRadius(altitudeKm) {
  const earthRadiusKm = 6371
  return EARTH_RADIUS * (1 + altitudeKm / earthRadiusKm) * SATELLITE_ORBIT_SCALE
}

export function asteroidBeltRadii() {
  const marsOrbit = orbitRadiusFor('mars')
  const jupiterOrbit = orbitRadiusFor('jupiter')
  const marsR = collisionRadius('mars')
  const jupiterR = collisionRadius('jupiter')
  const inner = marsOrbit + marsR + 0.6
  const outer = Math.max(inner + 0.8, jupiterOrbit - jupiterR - 0.6)
  return { inner, outer, center: (inner + outer) / 2, spread: (outer - inner) / 2 }
}

export function scaleLabel() {
  return 'Sizes: proportional (giants compressed) · Orbits: log(AU) + collision spacing'
}

export function bodyStats(id) {
  const body = REAL[id]
  if (!body) return []
  const stats = []
  if (body.diameterEarth) stats.push({ label: 'Size vs Earth', value: `${body.diameterEarth}× diameter` })
  if (body.orbitAu) stats.push({ label: 'Sun distance', value: `${body.orbitAu} AU` })
  if (body.orbitEarthRadii) stats.push({ label: 'Earth distance', value: `${body.orbitEarthRadii} Earth radii` })
  if (body.periodDays) stats.push({ label: 'Orbital period', value: `${Math.round(body.periodDays)} days` })
  stats.push({ label: 'Scale model', value: scaleLabel() })
  return stats
}

export function heliocentricPlanetConfig(id, extras = {}) {
  const body = REAL[id]
  return {
    id,
    orbitRadius: orbitRadiusFor(id),
    radius: bodyRadius(id),
    speed: heliocentricSpeed(body.orbitAu),
    spin: extras.spin ?? 0.08,
    phase: extras.phase ?? 0,
    tilt: extras.tilt,
    ...extras,
  }
}
