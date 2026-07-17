import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import HUD from './components/HUD'
import SpaceScene from './components/SpaceScene'

import { maxSceneExtent } from './data/solarSystemProportions'

const sceneExtent = maxSceneExtent()

export default function App() {
  const [utcTime, setUtcTime] = useState('')
  const [timeScale, setTimeScale] = useState(1)
  const [paused, setPaused] = useState(false)
  const [focusTarget, setFocusTarget] = useState('free')
  const [showOrbits, setShowOrbits] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [selectedBody, setSelectedBody] = useState(null)

  useEffect(() => {
    const tick = () => {
      setUtcTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">
      <HUD
        utcTime={utcTime}
        timeScale={timeScale}
        paused={paused}
        focusTarget={focusTarget}
        showOrbits={showOrbits}
        showLabels={showLabels}
        selectedBody={selectedBody}
        onTimeScaleChange={setTimeScale}
        onTogglePause={() => setPaused((p) => !p)}
        onFocusChange={setFocusTarget}
        onToggleOrbits={() => setShowOrbits((v) => !v)}
        onToggleLabels={() => setShowLabels((v) => !v)}
      />
      <Canvas
        camera={{ position: [0, sceneExtent * 0.38, sceneExtent * 0.78], fov: 50, near: 0.05, far: sceneExtent * 2.5 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => setSelectedBody(null)}
      >
        <SpaceScene
          timeScale={timeScale}
          paused={paused}
          focusTarget={focusTarget}
          showOrbits={showOrbits}
          showLabels={showLabels}
          onSelectBody={setSelectedBody}
        />
      </Canvas>
    </div>
  )
}
