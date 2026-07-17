/**
 * Planet texture paths — sourced via Arka MCP (arka_ask, arka_route) 2026-07-17.
 * Earth/Moon: three.js examples (NASA-derived public domain).
 * Mars/Sun/Saturn: Solar System Scope (free for non-commercial use; credit in README).
 */
export const PLANET_TEXTURES = {
  earth: {
    map: '/textures/earth.jpg',
    normalMap: '/textures/earth_normal.jpg',
    specularMap: '/textures/earth_specular.jpg',
    cloudMap: '/textures/earth_clouds.png',
  },
  moon: {
    map: '/textures/moon.jpg',
  },
  mars: {
    map: '/textures/mars.jpg',
  },
  sun: {
    map: '/textures/sun.jpg',
  },
  saturn: {
    map: '/textures/saturn.jpg',
    ringMap: '/textures/saturn_ring.png',
  },
  mercury: {
    map: '/textures/mercury.jpg',
  },
  venus: {
    map: '/textures/venus.jpg',
  },
  jupiter: {
    map: '/textures/jupiter.jpg',
  },
  uranus: {
    map: '/textures/uranus.jpg',
  },
  neptune: {
    map: '/textures/neptune.jpg',
  },
}

export const TEXTURE_CREDITS = [
  'Earth/Moon textures: three.js examples / NASA',
  'Earth clouds: NASA Blue Marble (three.js examples earth_clouds_1024.png)',
  'Mars, Sun, Saturn, Mercury, Venus, Jupiter, Uranus, Neptune: Solar System Scope (solarsystemscope.com)',
]
