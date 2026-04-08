
import './GameBoy.css'
import { useRef, useState } from 'react'

function App() {
  const iframeRef = useRef(null)
  const [started, setStarted] = useState(false)

  const fireKey = (key) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'keydown', key }, '*')
  }
  const releaseKey = (key) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'keyup', key }, '*')
  }

  return (
    <div className="room">
      <div className="vignette" />
      <div className="gba-shell">
        <div className="shoulder shoulder-left" />
        <div className="shoulder shoulder-right" />
        <div className="gba-body">
          <div className="side-panel left-panel">
            <div className="dpad">
              <div className="dpad-v" />
              <div className="dpad-h" />
              <div className="dpad-center" />
            </div>
          </div>
          <div className="screen-section">
            <div className="screen-bezel">
              <div className="screen-inner" onClick={() => { setStarted(true); iframeRef.current?.focus() }}>
                <iframe
                  ref={iframeRef}
                  src="https://roo-portfolio-rpg.netlify.app"
                  title="Portfolio RPG"
                  scrolling="no"
                  tabIndex={0}
                  style={{ pointerEvents: started ? 'auto' : 'none' }}
                />
                {!started && (
                  <div className="press-start-overlay">
                    <span>CLICK TO START</span>
                  </div>
                )}
              </div>
              <div className="screen-glare" />
            </div>
            <div className="led-row">
              <div className="led" />
              <span className="led-label">POWER</span>
            </div>
          </div>
          <div className="side-panel right-panel">
            <div className="ab-buttons">
              <button className="btn-ab btn-a" onPointerDown={() => fireKey('Z')} onPointerUp={() => releaseKey('Z')}>A</button>
              <button className="btn-ab btn-b" onPointerDown={() => fireKey('X')} onPointerUp={() => releaseKey('X')}>B</button>
            </div>
          </div>
        </div>
        <div className="gba-bottom">
          <div className="speaker-grille left-speaker">
            {[...Array(6)].map((_, i) => <div key={i} className="speaker-dot" />)}
          </div>
          <div className="start-select">
            <div className="ss-group">
              <button className="btn-ss" onPointerDown={() => fireKey(' ')} onPointerUp={() => releaseKey(' ')}>SELECT</button>
            </div>
            <div className="ss-group">
              <button className="btn-ss" onPointerDown={() => fireKey('Enter')} onPointerUp={() => releaseKey('Enter')}>START</button>
            </div>
          </div>
          <div className="speaker-grille right-speaker">
            {[...Array(6)].map((_, i) => <div key={i} className="speaker-dot" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
