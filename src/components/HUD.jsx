import { ARKA_SPACE_DATA, formatDistance } from '../data/arkaSpaceData'
import { SATELLITE_COUNT } from '../data/satellites'
import { scaleLabel } from '../data/solarSystemProportions'

export default function HUD({
  utcTime,
  timeScale,
  paused,
  focusTarget,
  showOrbits,
  showLabels,
  onTimeScaleChange,
  onTogglePause,
  onFocusChange,
  onToggleOrbits,
  onToggleLabels,
  selectedBody,
}) {
  const factIndex = Math.floor((Date.now() / 12000) % ARKA_SPACE_DATA.facts.length)

  return (
    <>
      <header className="hud">
        <div className="hud-badge">Powered by Arka MCP</div>
        <h1>Beautiful 3D Space</h1>
        <p>Drag to orbit · scroll to zoom · click a body for details</p>
      </header>

      <aside className="hud-panel arka-panel">
        <h2>Live telemetry</h2>
        <dl>
          <div>
            <dt>UTC</dt>
            <dd>{utcTime}</dd>
          </div>
          <div>
            <dt>Moon phase</dt>
            <dd>
              {ARKA_SPACE_DATA.moon.phase} ({ARKA_SPACE_DATA.moon.illumination}%)
            </dd>
          </div>
          <div>
            <dt>Earth–Moon</dt>
            <dd>{formatDistance(ARKA_SPACE_DATA.moon.distanceKm)}</dd>
          </div>
          <div>
            <dt>Sun–Earth</dt>
            <dd>{ARKA_SPACE_DATA.earth.sunDistanceAu.toFixed(2)} AU</dd>
          </div>
          <div>
            <dt>ISS altitude</dt>
            <dd>{ARKA_SPACE_DATA.iss.altitudeKm} km</dd>
          </div>
          <div>
            <dt>Active satellites</dt>
            <dd>{SATELLITE_COUNT + 1} (incl. ISS)</dd>
          </div>
        </dl>
        <p className="arka-fact">{ARKA_SPACE_DATA.facts[factIndex]}</p>
        <p className="arka-source">Data via Arka · {ARKA_SPACE_DATA.fetchedAt.slice(0, 10)} · {scaleLabel()}</p>
      </aside>

      {selectedBody && (
        <aside className="hud-panel body-panel">
          <h2>{selectedBody.name}</h2>
          <p>{selectedBody.description}</p>
          {selectedBody.stats?.map((stat) => (
            <div key={stat.label} className="body-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </aside>
      )}

      <footer className="controls">
        <button type="button" className={paused ? 'active' : ''} onClick={onTogglePause}>
          {paused ? '▶ Play' : '⏸ Pause'}
        </button>

        <label className="control-slider">
          <span>Speed {timeScale.toFixed(1)}×</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={timeScale}
            onChange={(e) => onTimeScaleChange(Number(e.target.value))}
          />
        </label>

        <div className="control-group">
          {['free', 'earth', 'moon', 'sun', 'mars', 'saturn'].map((target) => (
            <button
              key={target}
              type="button"
              className={focusTarget === target ? 'active' : ''}
              onClick={() => onFocusChange(target)}
            >
              {target === 'free' ? 'Free cam' : target.charAt(0).toUpperCase() + target.slice(1)}
            </button>
          ))}
        </div>

        <div className="control-group">
          {['mercury', 'venus', 'jupiter', 'uranus', 'neptune'].map((target) => (
            <button
              key={target}
              type="button"
              className={focusTarget === target ? 'active' : ''}
              onClick={() => onFocusChange(target)}
            >
              {target.charAt(0).toUpperCase() + target.slice(1)}
            </button>
          ))}
        </div>

        <div className="control-group">
          <button type="button" className={showOrbits ? 'active' : ''} onClick={onToggleOrbits}>
            Orbits
          </button>
          <button type="button" className={showLabels ? 'active' : ''} onClick={onToggleLabels}>
            Labels
          </button>
        </div>
      </footer>
    </>
  )
}
