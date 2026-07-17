import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'

const STANDARD_TEXTURE_KEYS = new Set([
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'emissiveMap',
  'bumpMap',
  'displacementMap',
  'alphaMap',
  'lightMap',
  'envMap',
])

export default function TexturedPlanet({
  maps,
  radius = 1,
  segments = 64,
  material = {},
  meshRef,
  castShadow = false,
  receiveShadow = false,
}) {
  const entries = useMemo(
    () =>
      Object.entries(maps || {}).filter(
        ([key, path]) =>
          key !== 'ringMap' &&
          STANDARD_TEXTURE_KEYS.has(key) &&
          typeof path === 'string' &&
          path.length > 0,
      ),
    [maps],
  )

  const paths = entries.map(([, path]) => path)
  const loaded = useTexture(paths)
  const textures = useMemo(() => {
    const out = {}
    entries.forEach(([key], index) => {
      out[key] = Array.isArray(loaded) ? loaded[index] : loaded
    })
    return out
  }, [entries, loaded])

  return (
    <mesh ref={meshRef} castShadow={castShadow} receiveShadow={receiveShadow}>
      <sphereGeometry args={[radius, segments, segments]} />
      <meshStandardMaterial {...textures} {...material} />
    </mesh>
  )
}

export function TexturedRing({ ringMap, innerRadius = 1.4, outerRadius = 2.2, rotation = [1.05, 0, 0] }) {
  const map = useTexture(ringMap)
  return (
    <mesh rotation={rotation} renderOrder={2}>
      <ringGeometry args={[innerRadius, outerRadius, 128]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={0.88}
        side={2}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
