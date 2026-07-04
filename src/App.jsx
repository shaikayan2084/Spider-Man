import { useState } from 'react'
import SpiderScene from './components/SpiderScene'
import Gallery from './components/Gallery'
import SpiderVerse360 from './components/SpiderVerse360'
import './App.css'

const SUITS = [
  {
    name: 'Tobey Maguire',
    era: 'Classic Trilogy',
    primary: '#cc0000',
    secondary: '#0044cc',
    webColor: '#ffffff',
    accent: '#ffcc00',
    bodyColor: '#cc0000',
    legColor: '#0044cc',
  },
  {
    name: 'Andrew Garfield',
    era: 'Amazing Spider-Man',
    primary: '#8b0000',
    secondary: '#00008b',
    webColor: '#cccccc',
    accent: '#ff6600',
    bodyColor: '#8b0000',
    legColor: '#00008b',
  },
  {
    name: 'Tom Holland',
    era: 'Marvel Cinematic Universe',
    primary: '#cc0000',
    secondary: '#1a1a2e',
    webColor: '#ffcc00',
    accent: '#ffd700',
    bodyColor: '#cc0000',
    legColor: '#1a1a2e',
  },
]

const GALLERY_IMAGES = [
  { src: '/images/spidey1.jpg', alt: 'Spider-Man Costume' },
  { src: '/images/spidey2.jpg', alt: 'Spider-Man Wallpaper' },
  { src: '/images/spidey3.jpg', alt: 'Spider-Man Action' },
  { src: '/images/spidey4.jpg', alt: 'Spider-Man Pose' },
  { src: '/images/spidey5.jpg', alt: 'Spider-Man Hero' },
  { src: '/images/spidey6.jpg', alt: 'Spider-Man Web' },
  { src: '/images/spidey7.jpg', alt: 'Spider-Man Swing' },
  { src: '/images/spidey8.jpg', alt: 'Spider-Man Combat' },
  { src: '/images/spidey9.jpg', alt: 'Spider-Man City' },
]

function App() {
  const [activeSuit, setActiveSuit] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')

  const suit = SUITS[activeSuit]

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setActiveSection('hero')}>
          Spider-Man
        </div>
        <div className="nav-links">
          <button className={activeSection === 'hero' ? 'active' : ''} onClick={() => setActiveSection('hero')}>3D Model</button>
          <button className={activeSection === 'gallery' ? 'active' : ''} onClick={() => setActiveSection('gallery')}>Gallery</button>
          <button className={activeSection === 'spiderverse' ? 'active' : ''} onClick={() => setActiveSection('spiderverse')}>360° Experience</button>
        </div>
      </nav>

      <main>
        {activeSection === 'hero' && (
          <section className="hero-section">
            <div className="scene-container">
              <SpiderScene suit={suit} />
            </div>

            <div className="suit-selector">
              <h2 className="suit-title">{SUITS[activeSuit].name}</h2>
              <p className="suit-era">{SUITS[activeSuit].era}</p>
              <div className="suit-dots">
                {SUITS.map((s, i) => (
                  <button
                    key={i}
                    className={`suit-dot ${i === activeSuit ? 'active' : ''}`}
                    style={{ '--dot-color': s.primary }}
                    onClick={() => setActiveSuit(i)}
                    title={s.name}
                  />
                ))}
              </div>
            </div>

            <div className="scroll-hint" onClick={() => setActiveSection('gallery')}>
              <span>View Gallery</span>
              <div className="scroll-arrow">↓</div>
            </div>
          </section>
        )}

        {activeSection === 'gallery' && (
          <section className="gallery-section">
            <Gallery images={GALLERY_IMAGES} />
            <div className="back-btn" onClick={() => setActiveSection('hero')}>
              ← Back to 3D Model
            </div>
          </section>
        )}

        {activeSection === 'spiderverse' && (
          <section className="spiderverse-section">
            <SpiderVerse360 />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
