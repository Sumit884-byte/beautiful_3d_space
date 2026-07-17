import { useRef, useMemo, Suspense, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Line, Sparkles, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { ARKA_SPACE_DATA } from '../data/arkaSpaceData'
import { ARKA_PLANETS, EARTH_ORBIT, planetBodyInfo } from '../data/arkaPlanets'
import {
  bodyRadius,
  moonOrbitRadius,
  moonOrbitalSpeed,
  altitudeToOrbitRadius,
  asteroidBeltRadii,
  bodyStats,
  maxSceneExtent,
} from '../data/solarSystemProportions'
import { PLANET_TEXTURES } from '../data/planetTextures'
import TexturedPlanet from './TexturedPlanet'
import EarthClouds from './EarthClouds'
import SatelliteFleet from './SatelliteFleet'
import OrbitingPlanet from './OrbitingPlanet'
import { SatelliteModel } from './SatelliteModel'

const BODY_INFO = {
  earth: {
    name: 'Earth',
    description: 'Our home world — oceans, atmosphere, and the only known life in the universe.',
    stats: [
      { label: 'Texture', value: ARKA_SPACE_DATA.textures.earth },
      { label: 'Cloud layer', value: ARKA_SPACE_DATA.textures.earthClouds },
      { label: 'Moon distance', value: '384,400 km' },
      ...bodyStats('earth'),
    ],
  },
  moon: {
    name: 'Moon',
    description: ARKA_SPACE_DATA.moon.phase + ' — fully illuminated as seen from Earth today (Arka data).',
    stats: [
      { label: 'Texture', value: ARKA_SPACE_DATA.textures.moon },
      { label: 'Phase', value: `${ARKA_SPACE_DATA.moon.illumination}% lit` },
    ],
  },
  sun: {
    name: 'Sun',
    description: 'The star at the center of our solar system, powering all life on Earth.',
    stats: [
      { label: 'Texture', value: ARKA_SPACE_DATA.textures.sun },
      { label: 'Light delay', value: '~8 min 20 s' },
      ...bodyStats('sun'),
    ],
  },
  mars: {
    name: 'Mars',
    description: 'The red planet — rusty dust, thin atmosphere, and two small moons.',
    stats: [
      { label: 'Texture', value: ARKA_SPACE_DATA.textures.mars },
      { label: 'Year', value: `${ARKA_SPACE_DATA.mars.orbitalPeriodDays} Earth days` },
      ...bodyStats('mars'),
    ],
  },
  iss: {
    name: 'ISS',
    description: 'International Space Station — a microgravity laboratory orbiting Earth.',
    stats: [
      { label: 'Altitude', value: `${ARKA_SPACE_DATA.iss.altitudeKm} km` },
      { label: 'Orbit', value: `${ARKA_SPACE_DATA.iss.orbitalPeriodMinutes} min` },
      { label: '3D model', value: 'NASA 3D Resources — International Space Station' },
    ],
  },
  saturn: {
    name: 'Saturn',
    description: 'Gas giant famous for its spectacular ring system of ice and rock.',
    stats: [
      { label: 'Texture', value: ARKA_SPACE_DATA.textures.saturn },
      { label: 'Year', value: `${ARKA_SPACE_DATA.saturn.orbitalPeriodDays} Earth days` },
      ...bodyStats('saturn'),
    ],
  },
  ...Object.fromEntries(
    ARKA_PLANETS.map((planet) => [
      planet.id,
      planetBodyInfo(planet, ARKA_SPACE_DATA.textures[planet.id] || 'Solar System Scope 2k'),
    ]),
  ),
}

function CameraRig({ controlsRef, focusTarget, bodyRefs, sceneExtent, draggingRef }) {
  const { camera } = useThree()
  const worldPos = useMemo(() => new THREE.Vector3(), [])
  const lerpTarget = useMemo(() => new THREE.Vector3(), [])
  const initialized = useRef(false)
  const lastFocus = useRef(focusTarget)

  const focusDistance = useCallback(
    (key) => {
      const distances = {
        sun: bodyRadius('sun') * 4.5,
        mercury: bodyRadius('mercury') * 12,
        venus: bodyRadius('venus') * 10,
        earth: bodyRadius('earth') * 9,
        moon: moonOrbitRadius() * 4,
        mars: bodyRadius('mars') * 14,
        jupiter: bodyRadius('jupiter') * 5.5,
        saturn: bodyRadius('saturn') * 6,
        uranus: bodyRadius('uranus') * 8,
        neptune: bodyRadius('neptune') * 8,
      }
      return distances[key] ?? sceneExtent * 0.42
    },
    [sceneExtent],
  )

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    camera.position.set(sceneExtent * 0.06, sceneExtent * 0.38, sceneExtent * 0.78)
    camera.far = sceneExtent * 2.5
    camera.near = 0.05
    camera.updateProjectionMatrix()
    const controls = controlsRef.current
    if (controls) {
      controls.target.set(0, 0, 0)
      controls.update()
    }
  }, [camera, controlsRef, sceneExtent])

  useEffect(() => {
    if (focusTarget === lastFocus.current) return
    lastFocus.current = focusTarget
    if (focusTarget === 'free') return

    const controls = controlsRef.current
    const ref = bodyRefs.current[focusTarget]
    if (!controls || !ref?.current) return

    ref.current.getWorldPosition(worldPos)
    const dist = focusDistance(focusTarget)
    const radial = worldPos.clone()
    if (radial.lengthSq() < 0.01) radial.set(0, 0, 1)
    radial.normalize()
    const tangent = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), radial)
    if (tangent.lengthSq() < 0.01) tangent.set(1, 0, 0)
    tangent.normalize()
    const camDir = tangent
      .clone()
      .multiplyScalar(0.7)
      .add(new THREE.Vector3(0, 0.42, 0))
      .add(radial.clone().multiplyScalar(0.12))
      .normalize()

    camera.position.copy(worldPos).add(camDir.multiplyScalar(dist))
    controls.target.copy(worldPos)
    controls.update()
  }, [focusTarget, bodyRefs, camera, controlsRef, focusDistance, worldPos])

  useEffect(() => {
    if (focusTarget !== 'free') return
    const controls = controlsRef.current
    if (!controls) return

    const dist = camera.position.distanceTo(controls.target)
    if (dist >= sceneExtent * 0.35) return

    controls.target.set(0, 0, 0)
    camera.position.set(sceneExtent * 0.06, sceneExtent * 0.38, sceneExtent * 0.78)
    controls.update()
  }, [focusTarget, camera, controlsRef, sceneExtent])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || focusTarget === 'free' || draggingRef.current) return

    const ref = bodyRefs.current[focusTarget]
    if (!ref?.current) return

    ref.current.getWorldPosition(worldPos)
    const smooth = 1 - Math.exp(-8 * delta)
    lerpTarget.copy(controls.target).lerp(worldPos, smooth)
    controls.target.copy(lerpTarget)
  })

  return null
}

function OrbitRing({ radius, color = '#4a6fa5', opacity = 0.35 }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return pts
  }, [radius])

  return <Line points={points} color={color} lineWidth={1} transparent opacity={opacity} />
}

function BodyLabel({ label, visible }) {
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

function ClickableBody({ children, bodyKey, onSelect, bodyRef, ...props }) {
  return (
    <group {...props} ref={bodyRef}>
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect(BODY_INFO[bodyKey])
        }}
      >
        {children}
      </group>
    </group>
  )
}

function Sun({ showLabels, onSelect, sim, bodyRef, glowPhaseRef, lightDistance }) {
  const ref = useRef()
  const glowRef = useRef()

  useFrame((_, delta) => {
    if (!sim.current.active) return
    const step = delta * sim.current.speed
    if (ref.current) ref.current.rotation.y += step * 0.05
    glowPhaseRef.current += step
    if (glowRef.current) {
      const pulse = 1 + Math.sin(glowPhaseRef.current * 2) * 0.04
      glowRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <ClickableBody bodyKey="sun" onSelect={onSelect} bodyRef={bodyRef}>
      <TexturedPlanet
        meshRef={ref}
        maps={PLANET_TEXTURES.sun}
        radius={bodyRadius('sun')}
        segments={48}
        material={{ emissive: '#ffaa33', emissiveIntensity: 1.4, roughness: 0.45, metalness: 0.05 }}
      />
      <mesh ref={glowRef}>
        <sphereGeometry args={[bodyRadius('sun') * 1.25, 32, 32]} />
        <meshBasicMaterial color="#ffcc66" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <pointLight intensity={4} color="#ffd27a" distance={lightDistance} decay={1.1} />
      <Sparkles count={40} scale={bodyRadius('sun') * 2.5} size={2} speed={0.3} color="#ffe4a0" />
      <BodyLabel label="Sun" visible={showLabels} />
    </ClickableBody>
  )
}

function EarthSystem({
  showLabels,
  showOrbits,
  onSelect,
  sim,
  angles,
  bodyRef,
  moonBodyRef,
  issBodyRef,
}) {
  const orbitRef = useRef()
  const spinRef = useRef()

  useFrame((_, delta) => {
    if (sim.current.active) {
      angles.current.earth += delta * sim.current.speed * EARTH_ORBIT.speed
      if (spinRef.current) spinRef.current.rotation.y += delta * sim.current.speed * 0.15
    }
    const t = angles.current.earth
    if (orbitRef.current) {
      orbitRef.current.position.set(
        Math.cos(t) * EARTH_ORBIT.orbitRadius,
        0,
        Math.sin(t) * EARTH_ORBIT.orbitRadius,
      )
    }
  })

  return (
    <group ref={orbitRef}>
      <group ref={bodyRef}>
        <ClickableBody bodyKey="earth" onSelect={onSelect}>
          <TexturedPlanet
            meshRef={spinRef}
            maps={PLANET_TEXTURES.earth}
            radius={EARTH_ORBIT.radius}
            segments={64}
            material={{ roughness: 0.65, metalness: 0.08 }}
          />
          <EarthClouds radius={EARTH_ORBIT.radius} sim={sim} />
          <BodyLabel label="Earth" visible={showLabels} />
        </ClickableBody>
        <Moon showLabels={showLabels} onSelect={onSelect} sim={sim} angles={angles} bodyRef={moonBodyRef} />
        <ISS showLabels={showLabels} onSelect={onSelect} sim={sim} angles={angles} bodyRef={issBodyRef} />
        <Suspense fallback={null}>
          <SatelliteFleet
            sim={sim}
            angles={angles}
            showLabels={showLabels}
            showOrbits={showOrbits}
            onSelect={onSelect}
          />
        </Suspense>
      </group>
    </group>
  )
}

function Moon({ showLabels, onSelect, sim, angles, bodyRef }) {
  const ref = useRef()
  const orbitRadius = moonOrbitRadius()
  const moonR = bodyRadius('moon')

  useFrame((_, delta) => {
    if (!bodyRef.current || !ref.current) return
    if (sim.current.active) {
      angles.current.moon += delta * sim.current.speed * moonOrbitalSpeed()
      ref.current.rotation.y += delta * sim.current.speed * 0.6
    }
    const t = angles.current.moon
    bodyRef.current.position.set(Math.cos(t) * orbitRadius, 0, Math.sin(t) * orbitRadius)
  })

  return (
    <ClickableBody bodyKey="moon" onSelect={onSelect} bodyRef={bodyRef}>
      <TexturedPlanet
        meshRef={ref}
        maps={PLANET_TEXTURES.moon}
        radius={moonR}
        segments={48}
        material={{
          roughness: 0.92,
          metalness: 0.04,
          emissive: '#443322',
          emissiveIntensity: 0.12,
        }}
      />
      <mesh>
        <sphereGeometry args={[moonR * 1.08, 24, 24]} />
        <meshBasicMaterial color="#8899aa" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <BodyLabel label="Moon" visible={showLabels} />
    </ClickableBody>
  )
}

function ISS({ showLabels, onSelect, sim, angles, bodyRef }) {
  const orbitRadius = altitudeToOrbitRadius(408)
  const beaconRef = useRef()

  useFrame((_, delta) => {
    if (!bodyRef.current) return
    if (sim.current.active) angles.current.iss += delta * sim.current.speed * 2.2
    const t = angles.current.iss
    bodyRef.current.position.set(
      Math.cos(t) * orbitRadius,
      Math.sin(t * 1.3) * 0.15,
      Math.sin(t) * orbitRadius,
    )
    bodyRef.current.rotation.y = -t
    if (beaconRef.current) {
      beaconRef.current.material.opacity = 0.4 + Math.sin(t * 6) * 0.3
    }
  })

  return (
    <ClickableBody bodyKey="iss" onSelect={onSelect} bodyRef={bodyRef}>
      <SatelliteModel
        id="iss"
        variant="station"
        color="#e8eefc"
        scale={0.11}
        glow={
          <mesh scale={0.09}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#88aaff" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        }
        beacon={
          <mesh ref={beaconRef} position={[0, 0.06, 0.1]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#aaccff" transparent opacity={0.5} toneMapped={false} />
          </mesh>
        }
        fallback={
          <group>
            <mesh>
              <boxGeometry args={[0.1, 0.05, 0.22]} />
              <meshStandardMaterial color="#e8eefc" emissive="#6688cc" emissiveIntensity={0.55} metalness={0.82} roughness={0.2} />
            </mesh>
            <mesh position={[0.06, 0, 0.04]}>
              <cylinderGeometry args={[0.025, 0.025, 0.14, 8]} />
              <meshStandardMaterial color="#99aabb" metalness={0.75} roughness={0.25} />
            </mesh>
            <mesh position={[-0.05, 0, -0.03]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshStandardMaterial color="#8899aa" metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <boxGeometry args={[0.28, 0.012, 0.08]} />
              <meshStandardMaterial color="#334466" metalness={0.88} roughness={0.12} emissive="#112244" emissiveIntensity={0.2} />
            </mesh>
          </group>
        }
      />
      {showLabels && (
        <Billboard follow>
          <Text
            fontSize={0.1}
            color="#c8d8ff"
            position={[0, 0.16, 0]}
            anchorX="center"
            outlineWidth={0.015}
            outlineColor="#02040a"
          >
            ISS
          </Text>
        </Billboard>
      )}
    </ClickableBody>
  )
}

function AsteroidBelt({ sim, angles }) {
  const ref = useRef()
  const belt = useMemo(() => asteroidBeltRadii(), [])
  const geometry = useMemo(() => {
    const arr = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = belt.center + (Math.random() - 0.5) * belt.spread * 2
      const y = (Math.random() - 0.5) * 0.35
      arr[i * 3] = Math.cos(angle) * radius
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = Math.sin(angle) * radius
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return geo
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    if (sim.current.active) angles.current.belt += delta * sim.current.speed * 0.02
    ref.current.rotation.y = angles.current.belt
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.035} color="#8a7a6a" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

export default function SpaceScene({
  timeScale,
  paused,
  focusTarget,
  showOrbits,
  showLabels,
  onSelectBody,
}) {
  const controlsRef = useRef()
  const sim = useRef({ active: true, speed: 1 })
  const angles = useRef({
    moon: 0,
    mars: 0,
    saturn: 0,
    earth: 0,
    iss: 0,
    belt: 0,
    hubble: 0,
    tiangong: 0,
    terra: 0,
    landsat9: 0,
    sentinel1: 0,
    noaa20: 0,
    worldview: 0,
    metop: 0,
    aeolus: 0,
    iridium: 0,
    oneweb: 0,
    gps: 0,
    galileo: 0,
    goes16: 0,
    tdrs: 0,
    starlink: 0,
    mercury: 0,
    venus: 0,
    jupiter: 0,
    uranus: 0,
    neptune: 0,
  })
  const glowPhaseRef = useRef(0)
  const draggingRef = useRef(false)
  const focusTargetRef = useRef(focusTarget)
  const sceneExtent = useMemo(() => maxSceneExtent(), [])
  const bodyRefs = useRef({})
  const sunBodyRef = useRef()
  const earthBodyRef = useRef()
  const moonBodyRef = useRef()
  const marsBodyRef = useRef()
  const saturnBodyRef = useRef()
  const issBodyRef = useRef()
  const mercuryBodyRef = useRef()
  const venusBodyRef = useRef()
  const jupiterBodyRef = useRef()
  const uranusBodyRef = useRef()
  const neptuneBodyRef = useRef()

  useEffect(() => {
    bodyRefs.current = {
      sun: sunBodyRef,
      earth: earthBodyRef,
      moon: moonBodyRef,
      mars: marsBodyRef,
      saturn: saturnBodyRef,
      mercury: mercuryBodyRef,
      venus: venusBodyRef,
      jupiter: jupiterBodyRef,
      uranus: uranusBodyRef,
      neptune: neptuneBodyRef,
    }
  }, [])

  useEffect(() => {
    sim.current.active = !paused
    sim.current.speed = timeScale
  }, [paused, timeScale])

  useEffect(() => {
    focusTargetRef.current = focusTarget
  }, [focusTarget])

  return (
    <>
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#02040a', sceneExtent * 0.55, sceneExtent * 1.35]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[0, 8, 0]} intensity={1.6} color="#ffd27a" castShadow={false} />
      <hemisphereLight args={['#1a2844', '#02040a', 0.35]} />
      <pointLight position={[-5, -2, -4]} intensity={0.4} color="#6ea8ff" />

      <Stars radius={sceneExtent * 1.4} depth={50} count={8000} factor={3.5} saturation={0.15} fade speed={0.6} />

      <CameraRig
        controlsRef={controlsRef}
        focusTarget={focusTarget}
        bodyRefs={bodyRefs}
        sceneExtent={sceneExtent}
        draggingRef={draggingRef}
      />

      <Suspense fallback={null}>
        <Sun
          showLabels={showLabels}
          onSelect={onSelectBody}
          sim={sim}
          bodyRef={sunBodyRef}
          glowPhaseRef={glowPhaseRef}
          lightDistance={sceneExtent * 1.2}
        />
        <EarthSystem
          showLabels={showLabels}
          showOrbits={showOrbits}
          onSelect={onSelectBody}
          sim={sim}
          angles={angles}
          bodyRef={earthBodyRef}
          moonBodyRef={moonBodyRef}
          issBodyRef={issBodyRef}
        />
        {ARKA_PLANETS.map((planet) => {
          const refMap = {
            mercury: mercuryBodyRef,
            venus: venusBodyRef,
            mars: marsBodyRef,
            jupiter: jupiterBodyRef,
            saturn: saturnBodyRef,
            uranus: uranusBodyRef,
            neptune: neptuneBodyRef,
          }
          return (
            <OrbitingPlanet
              key={planet.id}
              planet={planet}
              showLabels={showLabels}
              onSelect={onSelectBody}
              sim={sim}
              angles={angles}
              bodyRef={refMap[planet.id]}
              bodyInfo={BODY_INFO[planet.id]}
            />
          )
        })}
      </Suspense>
      <AsteroidBelt sim={sim} angles={angles} />

      {showOrbits && (
        <>
          <OrbitRing radius={EARTH_ORBIT.orbitRadius} color="#4488ff" opacity={0.28} />
          <OrbitRing radius={moonOrbitRadius()} color="#8899bb" opacity={0.25} />
          <OrbitRing radius={altitudeToOrbitRadius(408)} color="#66aaff" opacity={0.2} />
          {ARKA_PLANETS.map((p) => (
            <OrbitRing key={p.id} radius={p.orbitRadius} color={p.color || '#6688aa'} opacity={0.12} />
          ))}
          <OrbitRing radius={asteroidBeltRadii().inner} color="#665544" opacity={0.15} />
          <OrbitRing radius={asteroidBeltRadii().outer} color="#665544" opacity={0.12} />
        </>
      )}

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.08}
        minDistance={bodyRadius('sun') + 1.5}
        maxDistance={sceneExtent}
        onStart={() => {
          draggingRef.current = true
        }}
        onEnd={() => {
          draggingRef.current = false
        }}
      />
    </>
  )
}
