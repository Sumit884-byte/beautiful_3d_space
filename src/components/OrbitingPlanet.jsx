import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import TexturedPlanet, { TexturedRing } from './TexturedPlanet'
import { PLANET_TEXTURES } from '../data/planetTextures'

function PlanetLabel({ label, visible }) {
  if (!visible) return null
  return (
    <Billboard follow>
      <Text
        fontSize={0.18}
        color="#c8d8ff"
        anchorX="center"
        anchorY="bottom"
        position={[0, 0.9, 0]}
        outlineWidth={0.02}
        outlineColor="#02040a"
        renderOrder={10}
      >
        {label}
      </Text>
    </Billboard>
  )
}

export default function OrbitingPlanet({ planet, showLabels, onSelect, sim, angles, bodyRef, bodyInfo }) {
  const ref = useRef()
  const maps = PLANET_TEXTURES[planet.id]

  useFrame((_, delta) => {
    if (!bodyRef.current || !ref.current) return
    if (sim.current.active) {
      angles.current[planet.id] += delta * sim.current.speed * planet.speed
      ref.current.rotation.y += delta * sim.current.speed * planet.spin
    }
    const t = angles.current[planet.id] + planet.phase
    bodyRef.current.position.set(
      Math.cos(t) * planet.orbitRadius + (planet.orbitOffsetX || 0),
      Math.sin(t * 0.5) * (planet.orbitLift || 0),
      Math.sin(t) * planet.orbitRadius,
    )
  })

  return (
    <group ref={bodyRef}>
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect(bodyInfo)
        }}
      >
        <group rotation={planet.tilt || [0, 0, 0]}>
          <TexturedPlanet
            meshRef={ref}
            maps={maps}
            radius={planet.radius}
            segments={planet.segments}
            material={planet.material}
          />
          {planet.hasRing && PLANET_TEXTURES.saturn?.ringMap && (
            <TexturedRing
              ringMap={PLANET_TEXTURES.saturn.ringMap}
              innerRadius={planet.radius * 1.28}
              outerRadius={planet.radius * 2.05}
            />
          )}
        </group>
        <PlanetLabel label={planet.name} visible={showLabels} />
      </group>
    </group>
  )
}
