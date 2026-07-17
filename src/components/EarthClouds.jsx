import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { PLANET_TEXTURES } from '../data/planetTextures'

export default function EarthClouds({ radius = 1.2, sim, segments = 64 }) {
  const ref = useRef()
  const cloudMap = useTexture(PLANET_TEXTURES.earth.cloudMap)
  cloudMap.colorSpace = THREE.SRGBColorSpace

  useFrame((_, delta) => {
    if (!ref.current || !sim.current.active) return
    ref.current.rotation.y += delta * sim.current.speed * 0.22
  })

  return (
    <mesh ref={ref} renderOrder={2}>
      <sphereGeometry args={[radius * 1.014, segments, segments]} />
      <meshBasicMaterial
        map={cloudMap}
        transparent
        opacity={0.92}
        depthWrite={false}
        alphaTest={0.04}
        blending={THREE.NormalBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
