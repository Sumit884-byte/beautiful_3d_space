import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SATELLITE_MODELS, resolveSatelliteModelKey } from '../data/satelliteModels'

function sanitizeMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((mat) => {
      if (!mat) return
      for (const key of ['map', 'normalMap', 'emissiveMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'alphaMap']) {
        const tex = mat[key]
        if (tex && (!tex.image || tex.image.width === 0)) mat[key] = null
      }
      mat.needsUpdate = true
    })
  })
}

function normalizeScene(scene) {
  const clone = scene.clone(true)
  sanitizeMaterials(clone)
  const box = new THREE.Box3().setFromObject(clone)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  clone.position.sub(center)
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6)
  clone.scale.multiplyScalar(1 / maxDim)
  return clone
}

function extractInstancedMesh(scene) {
  let geometry = null
  let material = null
  scene.traverse((child) => {
    if (child.isMesh && !geometry) {
      geometry = child.geometry
      material = child.material?.clone?.() ?? child.material
    }
  })
  return { geometry, material }
}

function RealisticSatelliteMesh({ modelKey, scale = 1, color, children }) {
  const config = SATELLITE_MODELS[modelKey]
  const { scene } = useGLTF(config.url)
  const normalized = useMemo(() => normalizeScene(scene), [scene])
  const finalScale = scale * (config.scaleFactor ?? 1)

  return (
    <group scale={finalScale} rotation={config.rotation ?? [0, 0, 0]}>
      <primitive object={normalized} />
      {children}
    </group>
  )
}

export function SatelliteModel({ id, variant, scale, color, glow, beacon, fallback }) {
  const modelKey = resolveSatelliteModelKey({ id, variant })
  if (!modelKey || !SATELLITE_MODELS[modelKey]) return fallback

  return (
    <Suspense fallback={fallback}>
      <RealisticSatelliteMesh modelKey={modelKey} scale={scale} color={color}>
        {glow}
        {beacon}
      </RealisticSatelliteMesh>
    </Suspense>
  )
}

export function useSatelliteInstancedMesh(modelKey = 'aura') {
  const config = SATELLITE_MODELS[modelKey] ?? SATELLITE_MODELS.aura
  const { scene } = useGLTF(config.url)

  return useMemo(() => {
    const normalized = normalizeScene(scene)
    const mesh = extractInstancedMesh(normalized)
    if (!mesh.geometry) return null
    return {
      ...mesh,
      scaleFactor: config.scaleFactor ?? 1,
      rotation: config.rotation ?? [0, 0, 0],
    }
  }, [scene, config])
}

Object.values(SATELLITE_MODELS)
  .filter(({ url }) => !url.includes('terra'))
  .forEach(({ url }) => useGLTF.preload(url))
