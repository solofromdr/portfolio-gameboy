import './GameBoy.css'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const el = document.getElementById('phaser-container')
    if (el) {
      import('./game/PhaserGame.js')
    }
  }, [])

  const firePointer = () => {
    const canvas = document.querySelector('#phaser-container canvas')
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: cx, clientY: cy, bubbles: true, cancelable: true }))
    canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: cx, clientY: cy, bubbles: true, cancelable: true }))
  }

  const fireKey = (key) => {
    const canvas = document.querySelector('#phaser-container canvas')
    canvas?.focus()
    window.__fireKey?.(key)
  }
  const releaseKey = (key) => {
    window.__releaseKey?.(key)
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
              <div className="dpad-up" onPointerDown={(e) => { e.preventDefault(); fireKey('w') }} onPointerUp={() => releaseKey('w')} />
              <div className="dpad-down" onPointerDown={(e) => { e.preventDefault(); fireKey('s') }} onPointerUp={() => releaseKey('s')} />
              <div className="dpad-left" onPointerDown={(e) => { e.preventDefault(); fireKey('a') }} onPointerUp={() => releaseKey('a')} />
              <div className="dpad-right" onPointerDown={(e) => { e.preventDefault(); fireKey('d') }} onPointerUp={() => releaseKey('d')} />
              <div className="dpad-center" />
            </div>
          </div>
          <div className="screen-section">
            <div className="screen-bezel">
              <div className="screen-inner">
                <div id="phaser-container"></div>
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
              <button className="btn-ab btn-a"
                onPointerDown={(e) => { e.preventDefault(); fireKey('Z') }} onPointerUp={() => releaseKey('Z') }>A</button>
              <button className="btn-ab btn-b"
                onPointerDown={(e) => { e.preventDefault(); fireKey('X') }}
                onPointerUp={() => releaseKey('X')}>B</button>
            </div>
          </div>
        </div>
        <div className="gba-bottom">
          <div className="speaker-grille left-speaker">
            {[...Array(6)].map((_, i) => <div key={i} className="speaker-dot" />)}
          </div>
          <div className="start-select">
            <div className="ss-group">
              <button className="btn-ss"
                onPointerDown={(e) => { e.preventDefault(); fireKey(' ') }}
                onPointerUp={() => releaseKey(' ')}>SELECT</button>
            </div>
            <div className="ss-group">
              <button className="btn-ss"
                onPointerDown={(e) => { e.preventDefault(); fireKey('Escape') }}
                onPointerUp={() => releaseKey('Escape')}>START</button>
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