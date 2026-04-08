import './GameBoy.css'

function App() {

  const fireKey = (key) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}
  const releaseKey = (key) => {
  window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

  return (
    <div className="room">
      <div className="vignette" />

      <div className="gba-shell">
        {/* Hombros superiores */}
        <div className="shoulder shoulder-left" />
        <div className="shoulder shoulder-right" />

        {/* Cuerpo principal */}
        <div className="gba-body">

          {/* Panel izquierdo: D-pad decorativo */}
          <div className="side-panel left-panel">
            <div className="dpad">
              <div className="dpad-v" />
              <div className="dpad-h" />
              <div className="dpad-center" />
            </div>
          </div>

          {/* Centro: pantalla */}
          <div className="screen-inner">
            <iframe
              src="https://roo-portfolio-rpg.netlify.app"
              title="Portfolio RPG"
              scrolling="no"
              />
            {/* Reflejo de pantalla */}
            <div className="screen-glare" />

            {/* LED */}
            <div className="led-row">
              <div className="led" />
              <span className="led-label">POWER</span>
            </div>
          </div>

          {/* Panel derecho: botones A/B */}
          <div className="side-panel right-panel">
            <div className="ab-buttons">
              <button className="btn-ab btn-a" onPointerDown={() => fireKey('Z')} onPointerUp={() => releaseKey('Z')}>A</button>
              <button className="btn-ab btn-b" onPointerDown={() => fireKey('X')} onPointerUp={() => releaseKey('X')}>B</button>
            </div>
          </div>
        </div>

        {/* Franja inferior: Start/Select + altavoces */}
        <div className="gba-bottom">
          <div className="speaker-grille left-speaker">
            {[...Array(6)].map((_, i) => <div key={i} className="speaker-dot" />)}
          </div>
          <div className="start-select">
            <div className="ss-group">
              <button className="btn-ss" onPointerDown={() => fireKey('Escape')}>SELECT</button>
            </div>
            <div className="ss-group">
              <button className="btn-ss" onPointerDown={() => fireKey('Enter')}>START</button>
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