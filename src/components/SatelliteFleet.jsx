import { Suspense, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { ARKA_SATELLITES, satelliteInfo } from '../data/satellites'
import { SatelliteModel } from './SatelliteModel'

function SatelliteGlow({ color, size = 0.12, pulse = 1 }) {
  return (
    <mesh scale={size * pulse}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.18}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function SignalBeacon({ color, offset = [0, 0.08, 0] }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    const blink = 0.35 + Math.sin(clock.elapsedTime * 4.5) * 0.25
    ref.current.material.opacity = blink
  })

  return (
    <mesh ref={ref} position={offset}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} toneMapped={false} />
    </mesh>
  )
}

function SolarArray({ width = 1.2, depth = 0.35, tint = '#223355' }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[width, 0.035, depth]} />
        <meshStandardMaterial
          color={tint}
          metalness={0.9}
          roughness={0.12}
          emissive="#112244"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.92, depth * 0.88, 1, 1]} />
        <meshBasicMaterial color="#4a6688" transparent opacity={0.35} wireframe />
      </mesh>
    </group>
  )
}

function InclinedOrbitArc({ radius, inclination, color, opacity = 0.18 }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * radius,
          Math.sin(a * 0.7) * 0.08 * Math.sin(inclination),
          Math.sin(a) * radius * Math.cos(inclination),
        ),
      )
    }
    return pts
  }, [radius, inclination])

  return <Line points={points} color={color} lineWidth={0.6} transparent opacity={opacity} />
}

function SatelliteMesh({ variant, color, scale }) {
  const hull = { color, emissive: color, emissiveIntensity: 0.22, metalness: 0.72, roughness: 0.28 }

  if (variant === 'telescope') {
    return (
      <group scale={scale}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.45, 1.2, 12]} />
          <meshStandardMaterial {...hull} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.55]}>
          <cylinderGeometry args={[0.12, 0.12, 0.9, 10]} />
          <meshStandardMaterial color="#8899aa" metalness={0.85} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0, 0.95]}>
          <cylinderGeometry args={[0.28, 0.22, 0.08, 16]} />
          <meshStandardMaterial color="#ccccdd" metalness={0.95} roughness={0.08} emissive="#aaaacc" emissiveIntensity={0.15} />
        </mesh>
        <SolarArray width={0.7} depth={0.25} tint="#1a3355" />
        <SatelliteGlow color={color} size={0.14} />
        <SignalBeacon color="#88ccff" />
      </group>
    )
  }

  if (variant === 'station') {
    return (
      <group scale={scale}>
        <mesh>
          <boxGeometry args={[1.4, 0.35, 0.35]} />
          <meshStandardMaterial {...hull} emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 8]} />
          <meshStandardMaterial color="#99aabb" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[-0.35, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.45, 8]} />
          <meshStandardMaterial color="#8899aa" metalness={0.65} />
        </mesh>
        <group position={[0, 0.22, 0]}>
          <SolarArray width={2.4} depth={0.55} />
        </group>
        <SatelliteGlow color={color} size={0.16} />
        <SignalBeacon color="#ffaa88" offset={[0, 0.12, 0.15]} />
      </group>
    )
  }

  if (variant === 'geo') {
    return (
      <group scale={scale}>
        <mesh>
          <boxGeometry args={[0.9, 0.5, 0.5]} />
          <meshStandardMaterial {...hull} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.45, 0]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 20]} />
          <meshStandardMaterial color="#ccccdd" metalness={0.9} roughness={0.1} emissive="#888899" emissiveIntensity={0.12} />
        </mesh>
        <group position={[0, 0.55, 0]} rotation={[0.4, 0, 0]}>
          <SolarArray width={1.6} depth={0.45} tint="#2a4466" />
        </group>
        <SatelliteGlow color={color} size={0.2} />
        <pointLight intensity={0.15} color={color} distance={0.8} decay={2} />
      </group>
    )
  }

  if (variant === 'nav') {
    return (
      <group scale={scale}>
        <mesh>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial {...hull} emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.4, 0.03, 0.35]} />
          <meshStandardMaterial color="#ddeeff" metalness={0.55} roughness={0.2} emissive="#aaccff" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <torusGeometry args={[0.22, 0.025, 8, 24]} />
          <meshStandardMaterial color="#bbccdd" metalness={0.8} roughness={0.15} />
        </mesh>
        <SatelliteGlow color={color} size={0.15} />
      </group>
    )
  }

  if (variant === 'array') {
    return (
      <group scale={scale}>
        <mesh>
          <boxGeometry args={[0.5, 0.25, 0.25]} />
          <meshStandardMaterial {...hull} />
        </mesh>
        <group position={[0, 0, 0]}>
          <SolarArray width={1.8} depth={0.42} />
        </group>
        <mesh position={[0.28, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 6]} />
          <meshStandardMaterial color="#778899" metalness={0.75} />
        </mesh>
        <SatelliteGlow color={color} size={0.11} />
        <SignalBeacon color={color} />
      </group>
    )
  }

  return (
    <group scale={scale}>
      <mesh>
        <boxGeometry args={[0.45, 0.22, 0.22]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      <group position={[0, 0, 0]}>
        <SolarArray width={1.15} depth={0.35} />
      </group>
      <SatelliteGlow color={color} size={0.1} />
    </group>
  )
}

function OrbitingSatellite({ sat, sim, angles, showLabels, showOrbits, onSelect }) {
  const ref = useRef()

  useFrame((_, delta) => {
    if (!ref.current) return
    if (sim.current.active) angles.current[sat.id] += delta * sim.current.speed * sat.speed
    const t = angles.current[sat.id] + sat.phase
    const y = Math.sin(t * 0.7) * 0.08 * Math.sin(sat.inclination)
    ref.current.position.set(
      Math.cos(t) * sat.orbitRadius,
      y,
      Math.sin(t) * sat.orbitRadius * Math.cos(sat.inclination),
    )
    ref.current.rotation.y = -t
  })

  return (
    <>
      {showOrbits && (
        <InclinedOrbitArc
          radius={sat.orbitRadius}
          inclination={sat.inclination}
          color={sat.color}
          opacity={sat.orbitType === 'GEO' ? 0.12 : 0.16}
        />
      )}
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(satelliteInfo(sat))
        }}
      >
        <SatelliteModel
          id={sat.id}
          variant={sat.variant}
          color={sat.color}
          scale={sat.scale}
          glow={<SatelliteGlow color={sat.color} size={0.14} />}
          beacon={
            sat.variant === 'telescope' || sat.variant === 'array' || sat.variant === 'station' ? (
              <SignalBeacon color={sat.color === '#7ec8ff' ? '#88ccff' : sat.color} />
            ) : null
          }
          fallback={<SatelliteMesh variant={sat.variant} color={sat.color} scale={sat.scale} />}
        />
        {showLabels && sat.showLabel !== false && (
          <Billboard follow lockX={false} lockY={false} lockZ={false}>
            <Text
              fontSize={0.07}
              color="#c8d8ff"
              position={[0, 0.2, 0]}
              anchorX="center"
              outlineWidth={0.012}
              outlineColor="#02040a"
            >
              {sat.name}
            </Text>
          </Billboard>
        )}
      </group>
    </>
  )
}

function StarlinkSwarm({ swarm, sim, angles, showLabels, showOrbits, onSelect }) {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const offsets = useMemo(() => {
    const out = []
    for (let i = 0; i < swarm.count; i++) {
      out.push({
        phase: (i / swarm.count) * Math.PI * 2,
        radius: swarm.orbitRadius + (Math.random() - 0.5) * swarm.spread,
        lift: (Math.random() - 0.5) * 0.12,
      })
    }
    return out
  }, [swarm.count, swarm.orbitRadius, swarm.spread])

  useFrame((_, delta) => {
    if (!ref.current) return
    if (sim.current.active) angles.current.starlink += delta * sim.current.speed * swarm.speed
    const base = angles.current.starlink
    offsets.forEach((o, i) => {
      const t = base + o.phase
      dummy.position.set(
        Math.cos(t) * o.radius,
        o.lift,
        Math.sin(t) * o.radius * Math.cos(swarm.inclination),
      )
      dummy.rotation.y = -t
      dummy.scale.setScalar(0.028)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {showOrbits && (
        <InclinedOrbitArc radius={swarm.orbitRadius} inclination={swarm.inclination} color={swarm.color} opacity={0.14} />
      )}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect(satelliteInfo({ ...swarm, name: `${swarm.name} (${swarm.count})` }))
        }}
      >
        <instancedMesh ref={ref} args={[null, null, swarm.count]}>
          <boxGeometry args={[1, 0.18, 0.45]} />
          <meshStandardMaterial
            color={swarm.color}
            emissive="#5588cc"
            emissiveIntensity={0.55}
            metalness={0.82}
            roughness={0.18}
          />
        </instancedMesh>
        {showLabels && (
          <Billboard follow>
            <Text
              fontSize={0.08}
              color="#dde8ff"
              position={[swarm.orbitRadius + 0.3, 0.35, 0]}
              anchorX="left"
              outlineWidth={0.012}
              outlineColor="#02040a"
            >
              Starlink ×{swarm.count}
            </Text>
          </Billboard>
        )}
      </group>
    </>
  )
}

export default function SatelliteFleet({ sim, angles, showLabels, showOrbits = true, onSelect }) {
  return (
    <group name="satellite-fleet">
      {ARKA_SATELLITES.catalog.map((sat) => (
        <OrbitingSatellite
          key={sat.id}
          sat={sat}
          sim={sim}
          angles={angles}
          showLabels={showLabels}
          showOrbits={showOrbits}
          onSelect={onSelect}
        />
      ))}
      <StarlinkSwarm
        swarm={ARKA_SATELLITES.starlinkSwarm}
        sim={sim}
        angles={angles}
        showLabels={showLabels}
        showOrbits={showOrbits}
        onSelect={onSelect}
      />
    </group>
  )
}
