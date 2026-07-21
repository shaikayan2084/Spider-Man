import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'

const SPIDEY_DATA = [
  {
    id: 'tobey',
    name: 'Tobey Maguire',
    era: 'Sam Raimi Trilogy (2002-2007)',
    color: '#cc0000',
    color2: '#0044cc',
    accent: '#ffcc00',
    bgImg: '/images/tobey-bg.gif',
    refImg: '/images/tobey-ref.jpg',
    movies: ['Spider-Man (2002)', 'Spider-Man 2 (2004)', 'Spider-Man 3 (2007)'],
    traits: [
      'Organic web-shooters',
      'Photographer at Daily Bugle',
      'First live-action Spider-Man',
      'Symbiote / Venom arc',
      'Mary Jane Watson love story',
    ],
    desc: 'The original cinematic Spider-Man. Tobey brought Peter Parker to life with a heartfelt portrayal of a shy, nerdy teenager grappling with power and responsibility.',
  },
  {
    id: 'andrew',
    name: 'Andrew Garfield',
    era: 'The Amazing Spider-Man (2012-2014)',
    color: '#8b0000',
    color2: '#00008b',
    accent: '#ff6600',
    bgImg: '/images/andrew-bg.gif',
    refImg: '/images/andrew-ref.jpg',
    movies: ['The Amazing Spider-Man (2012)', 'The Amazing Spider-Man 2 (2014)'],
    traits: [
      'Mechanical web-shooters',
      'Skateboarding, quip-heavy style',
      'Gwen Stacy tragedy arc',
      'More agile, acrobatic fighting',
      'Father\'s mysterious disappearance',
    ],
    desc: 'Andrew brought a new energy — witty, emotional, and physically agile. His chemistry with Emma Stone\'s Gwen Stacy made for one of comics\' most heartbreaking love stories.',
  },
  {
    id: 'tom',
    name: 'Tom Holland',
    era: 'Marvel Cinematic Universe (2016-Present)',
    color: '#cc0000',
    color2: '#1a1a2e',
    accent: '#ffd700',
    bgImg: '/images/tom-bg.gif',
    refImg: '/images/tom-ref.jpg',
    movies: [
      'Captain America: Civil War (2016)',
      'Spider-Man: Homecoming (2017)',
      'Avengers: Infinity War (2018)',
      'Avengers: Endgame (2019)',
      'Spider-Man: Far From Home (2019)',
      'Spider-Man: No Way Home (2021)',
    ],
    traits: [
      'Stark Tech suit with Karen (AI)',
      'Mentored by Iron Man',
      'Youngest live-action Peter Parker',
      'Multiverse team-up with Tobey & Andrew',
      'EDITH glasses & instant-kill mode',
    ],
    desc: 'Tom captured the teenage energy of Peter Parker perfectly. His arc from Iron Man\'s protégé to a hero standing on his own defined the MCU\'s Spider-Man.',
  },
]

export default function SpiderVerse360() {
  const containerRef = useRef(null)
  const [phase, setPhase] = useState('loading')
  const [ending, setEnding] = useState(false)
  const [activeSpidey, setActiveSpidey] = useState(null)
  const endingTimeout = useRef(null)

  const showEnding = useCallback(() => {
    if (endingTimeout.current) {
      clearTimeout(endingTimeout.current)
      endingTimeout.current = null
    }
    setEnding(true)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = container.clientWidth
    const h = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0015)

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
    camera.position.set(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const loader = new THREE.TextureLoader()
    loader.load(
      '/images/spiderverse-pano.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        const skyGeo = new THREE.SphereGeometry(500, 64, 64)
        const skyMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
        const sky = new THREE.Mesh(skyGeo, skyMat)
        sky.rotation.y = Math.PI
        scene.add(sky)
        setPhase('intro')
        introTimer = setTimeout(() => {
          setPhase('viewing')
          endingTimeout.current = setTimeout(() => setEnding(true), 30000)
        }, 4000)
      },
      (xhr) => {
        console.log('Loading:', Math.round(xhr.loaded / xhr.total * 100) + '%')
      },
      (err) => {
        console.error('Texture load failed:', err)
        setPhase('viewing')
      }
    )

    let yaw = 0
    let pitch = 0
    let isDragging = false
    let prevMouse = { x: 0, y: 0 }
    let autoRotate = true
    const autoRotateSpeed = 0.003

    const onMouseDown = (e) => {
      isDragging = true
      autoRotate = false
      prevMouse.x = e.clientX
      prevMouse.y = e.clientY
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      const dx = e.clientX - prevMouse.x
      const dy = e.clientY - prevMouse.y
      yaw -= dx * 0.005
      pitch -= dy * 0.005
      pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch))
      prevMouse.x = e.clientX
      prevMouse.y = e.clientY
    }

    const onMouseUp = () => { isDragging = false }
    const onWheel = () => { autoRotate = false }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('wheel', onWheel)

    const touchState = { id: null, x: 0, y: 0 }
    const onTouchStart = (e) => {
      const t = e.changedTouches[0]
      touchState.id = t.identifier
      touchState.x = t.clientX
      touchState.y = t.clientY
      autoRotate = false
    }
    const onTouchMove = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchState.id) {
          const dx = t.clientX - touchState.x
          const dy = t.clientY - touchState.y
          yaw -= dx * 0.005
          pitch -= dy * 0.005
          pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch))
          touchState.x = t.clientX
          touchState.y = t.clientY
        }
      }
    }
    const onTouchEnd = () => { touchState.id = null }

    container.addEventListener('touchstart', onTouchStart)
    container.addEventListener('touchmove', onTouchMove)
    container.addEventListener('touchend', onTouchEnd)

    let introTimer
    let animId

    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (autoRotate) yaw += autoRotateSpeed
      const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      const qP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch)
      camera.quaternion.copy(qY.multiply(qP))
      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    const handleResize = () => {
      const w2 = container.clientWidth
      const h2 = container.clientHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(introTimer)
      if (endingTimeout.current) clearTimeout(endingTimeout.current)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      })
      renderer.dispose()
    }
  }, [])

  return (
    <div className="spiderverse-360">
      <div ref={containerRef} className="pano-container" />

      {phase === 'loading' && (
        <div className="sv-loading">
          <div className="sv-loading-spinner" />
          <span className="sv-loading-text">Loading Spider-Verse...</span>
        </div>
      )}

      {phase === 'intro' && (
        <div className="sv-intro">
          <div className="sv-intro-dots" />
          <div className="sv-title-container">
            <h1 className="sv-title">
              <span className="sv-title-line sv-title-spider">SPIDER</span>
              <span className="sv-title-line sv-title-verse">VERSE</span>
            </h1>
            <div className="sv-movie-titles">
              <span className="sv-movie-tag">INTO THE SPIDER-VERSE</span>
              <span className="sv-movie-dot">•</span>
              <span className="sv-movie-tag">ACROSS THE SPIDER-VERSE</span>
            </div>
          </div>
          <div className="sv-intro-flash" />
        </div>
      )}

      {ending && (
        <div className="sv-ending">
          <div className="sv-ending-overlay" />
          <div className="sv-ending-content">
            <div className="sv-ending-line" />
            <h2 className="sv-ending-text">TO BE CONTINUED</h2>
            <div className="sv-ending-line" />
            <p className="sv-ending-sub">Spider-Verse 360° Experience</p>
            <div className="sv-ending-movies">
              <span>Into the Spider-Verse</span>
              <span className="sv-ending-dot">•</span>
              <span>Across the Spider-Verse</span>
              <span className="sv-ending-dot">•</span>
              <span>Beyond the Spider-Verse</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'viewing' && !ending && (
        <div className="sv-hint">
          <span className="sv-hint-text">Drag to explore the Spider-Verse</span>
        </div>
      )}

      {phase === 'viewing' && !ending && (
        <button className="sv-end-btn" onClick={showEnding}>
          Skip to End
        </button>
      )}

      <div className="sv-actors-nav">
        {SPIDEY_DATA.map((s, i) => (
          <button
            key={s.id}
            className={`sv-actor-btn ${activeSpidey === i ? 'active' : ''}`}
            style={{ '--accent': s.color }}
            onClick={() => setActiveSpidey(activeSpidey === i ? null : i)}
          >
            <img src={s.refImg} alt={s.name} className="sv-actor-avatar" />
            <span className="sv-actor-label">{s.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {activeSpidey !== null && (
        <div className="sv-actor-panel">
          <div className="sv-actor-panel-bg" style={{ backgroundImage: `url(${SPIDEY_DATA[activeSpidey].bgImg})` }} />
          <div className="sv-actor-panel-content">
            <button className="sv-actor-close" onClick={() => setActiveSpidey(null)}>×</button>
            <div className="sv-actor-header">
              <div className="sv-actor-headshot">
                <img src={SPIDEY_DATA[activeSpidey].refImg} alt={SPIDEY_DATA[activeSpidey].name} />
              </div>
              <div>
                <h2 className="sv-actor-name" style={{ color: SPIDEY_DATA[activeSpidey].accent }}>
                  {SPIDEY_DATA[activeSpidey].name}
                </h2>
                <p className="sv-actor-era" style={{ borderColor: SPIDEY_DATA[activeSpidey].color }}>
                  {SPIDEY_DATA[activeSpidey].era}
                </p>
              </div>
            </div>

            <div className="sv-actor-desc">{SPIDEY_DATA[activeSpidey].desc}</div>

            <div className="sv-actor-movies">
              <h3 className="sv-actor-subtitle">Films</h3>
              {SPIDEY_DATA[activeSpidey].movies.map((m, i) => (
                <div key={i} className="sv-actor-movie-item">
                  <span className="sv-movie-bullet" style={{ background: SPIDEY_DATA[activeSpidey].color }} />
                  <span>{m}</span>
                </div>
              ))}
            </div>

            <div className="sv-actor-traits">
              <h3 className="sv-actor-subtitle">Key Traits</h3>
              <div className="sv-traits-grid">
                {SPIDEY_DATA[activeSpidey].traits.map((t, i) => (
                  <span key={i} className="sv-trait-tag" style={{ borderColor: SPIDEY_DATA[activeSpidey].color }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
