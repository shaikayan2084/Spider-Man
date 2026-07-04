import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'

export default function SpiderVerse360() {
  const containerRef = useRef(null)
  const [phase, setPhase] = useState('loading')
  const [ending, setEnding] = useState(false)
  const endingTimeout = useRef(null)
  const [textureLoaded, setTextureLoaded] = useState(false)

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

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
    camera.position.set(0, 0, 0.1)

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
        scene.add(sky)
        setTextureLoaded(true)
        setPhase('intro')
        introTimer = setTimeout(() => {
          setPhase('viewing')
          endingTimeout.current = setTimeout(() => setEnding(true), 30000)
        }, 4000)
      },
      undefined,
      () => {
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

    const animate = () => {
      requestAnimationFrame(animate)
      if (autoRotate) yaw += autoRotateSpeed
      const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      const qP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch)
      camera.quaternion.copy(qY.multiply(qP))
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      const w2 = container.clientWidth
      const h2 = container.clientHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
    }
    window.addEventListener('resize', handleResize)

    return () => {
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
    </div>
  )
}
