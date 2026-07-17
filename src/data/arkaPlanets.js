/**
 * Planet catalog — descriptions from Arka MCP; sizes/orbits/speeds from solarSystemProportions.js
 */
import {
  EARTH_RADIUS,
  REAL,
  bodyRadius,
  heliocentricOrbit,
  heliocentricSpeed,
  heliocentricPlanetConfig,
  scaleLabel,
  orbitRadiusFor,
} from './solarSystemProportions'

const COLORS = {
  mercury: '#b8b8b8',
  venus: '#e8c080',
  mars: '#c1440e',
  jupiter: '#c9a070',
  saturn: '#c9a66b',
  uranus: '#93b8c8',
  neptune: '#4166b5',
}

const DESCRIPTIONS = {
  mercury: 'Smallest planet — airless, cratered, and scorched on the Sun-facing side, frozen on the night side.',
  venus: 'Thick carbon-dioxide clouds trap heat — the hottest planet despite being second from the Sun.',
  mars: 'The red planet — rusty dust, thin atmosphere, and two small moons.',
  jupiter: 'Largest planet — banded gas giant with the centuries-old Great Red Spot.',
  saturn: 'Gas giant with spectacular rings of ice and rock — second largest after Jupiter.',
  uranus: 'Ice giant tipped on its side — pale cyan atmosphere with faint rings.',
  neptune: 'Deep blue ice giant with the fastest winds in the solar system.',
}

const MATERIALS = {
  mercury: { roughness: 0.95, metalness: 0.05 },
  venus: { roughness: 0.55, metalness: 0.12, emissive: '#553311', emissiveIntensity: 0.08 },
  mars: { roughness: 0.92, metalness: 0.03 },
  jupiter: { roughness: 0.7, metalness: 0.08 },
  saturn: { roughness: 0.75, metalness: 0.1 },
  uranus: { roughness: 0.6, metalness: 0.1 },
  neptune: { roughness: 0.55, metalness: 0.12 },
}

const EXTRAS = {
  mercury: { phase: 1.1, spin: 0.04, segments: 48 },
  venus: { phase: 2.4, spin: -0.03, segments: 48 },
  mars: { phase: 0.5, spin: 0.08, segments: 48 },
  jupiter: { phase: 0.8, spin: 0.12, segments: 64 },
  saturn: { phase: 1.6, spin: 0.06, segments: 48, hasRing: true },
  uranus: { phase: 3.2, spin: 0.04, segments: 48, tilt: [1.05, 0.2, 0.15] },
  neptune: { phase: 4.5, spin: 0.05, segments: 48 },
}

function buildPlanet(id) {
  const body = REAL[id]
  const cfg = heliocentricPlanetConfig(id, EXTRAS[id] || {})
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    description: DESCRIPTIONS[id],
    orbitRadiusAu: body.orbitAu,
    orbitalPeriodDays: body.periodDays,
    diameterEarth: body.diameterEarth,
    color: COLORS[id] ?? '#ffffff',
    orbitRadius: cfg.orbitRadius,
    radius: cfg.radius,
    segments: cfg.segments ?? 48,
    speed: cfg.speed,
    spin: cfg.spin,
    phase: cfg.phase,
    tilt: cfg.tilt,
    hasRing: cfg.hasRing,
    material: MATERIALS[id] ?? {},
  }
}

export const ARKA_PLANETS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(buildPlanet)

export const EARTH_ORBIT = {
  orbitRadius: orbitRadiusFor('earth'),
  speed: heliocentricSpeed(REAL.earth.orbitAu),
  radius: EARTH_RADIUS,
}

export function planetBodyInfo(planet, textureLabel) {
  return {
    name: planet.name,
    description: planet.description,
    stats: [
      { label: 'Size vs Earth', value: `${planet.diameterEarth}× diameter` },
      { label: 'Sun distance', value: `${planet.orbitRadiusAu} AU` },
      { label: 'Orbital period', value: `${Math.round(planet.orbitalPeriodDays)} days` },
      { label: 'Texture', value: textureLabel },
      { label: 'Scale', value: scaleLabel() },
    ],
  }
}

export { bodyRadius, heliocentricOrbit, scaleLabel }
