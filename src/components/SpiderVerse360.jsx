import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'

function createWindowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, 128, 256)
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      const lit = Math.random() > 0.35
      ctx.fillStyle = lit ? '#ffdd77' : '#0a0a18'
      ctx.fillRect(8 + col * 30, 8 + row * 30, 16, 22)
      if (lit) {
        ctx.fillStyle = 'rgba(255,220,100,0.3)'
        ctx.fillRect(8 + col * 30 + 2, 8 + row * 30 + 2, 12, 18)
      }
    }
  }
  return new THREE.CanvasTexture(canvas)
}

function createComicSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 1024)
  grad.addColorStop(0, '#ff0055')
  grad.addColorStop(0.2, '#cc00ff')
  grad.addColorStop(0.4, '#0044ff')
  grad.addColorStop(0.6, '#ff6600')
  grad.addColorStop(0.8, '#1a0030')
  grad.addColorStop(1, '#0a0015')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 2048, 1024)
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 2048
    const y = Math.random() * 700
    const size = Math.random() * 3 + 1
    const hue = Math.random() * 360
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${0.3 + Math.random() * 0.4})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 2048
    const y = Math.random() * 800
    const w = 10 + Math.random() * 30
    const h = 10 + Math.random() * 30
    ctx.strokeStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.1})`
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)
  }
  return new THREE.CanvasTexture(canvas)
}

function createPosterTexture(title, color1, color2) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 384
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 384)
  grad.addColorStop(0, color1)
  grad.addColorStop(1, color2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 384)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2
  ctx.strokeRect(10, 10, 236, 364)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lines = title.split('\n')
  lines.forEach((line, i) => {
    ctx.fillText(line, 128, 192 + (i - lines.length / 2) * 28)
  })
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.beginPath()
  ctx.arc(128, 200, 60, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = '36px Arial'
  ctx.fillText('🕷', 128, 205)
  return new THREE.CanvasTexture(canvas)
}

function createGlitchTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ff00ff'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 20; i++) {
    const y = Math.random() * 256
    const h = 2 + Math.random() * 8
    ctx.fillStyle = `rgba(0,255,255,${0.3 + Math.random() * 0.5})`
    ctx.fillRect(0, y, 256, h)
  }
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 256
    const w = 2 + Math.random() * 6
    ctx.fillStyle = `rgba(255,255,0,${0.2 + Math.random() * 0.4})`
    ctx.fillRect(x, 0, w, 256)
  }
  return new THREE.CanvasTexture(canvas)
}

function createBendayDotsTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, 64, 64)
  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      const hue = Math.random() > 0.5 ? 0 : 240
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.15 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.arc(x + 4, y + 4, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return new THREE.CanvasTexture(canvas)
}

export default function SpiderVerse360({ bgVideo }) {
  const containerRef = useRef(null)
  const sceneState = useRef(null)
  const [phase, setPhase] = useState('loading')
  const [ending, setEnding] = useState(false)
  const endingTimeout = useRef(null)
  const glitchMeshes = useRef([])

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

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 200)
    camera.position.set(0, 1.6, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    const skyGeo = new THREE.SphereGeometry(80, 32, 32)
    const skyMat = new THREE.MeshBasicMaterial({ map: createComicSkyTexture(), side: THREE.BackSide })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)

    const ambLight = new THREE.AmbientLight(0x444466, 0.6)
    scene.add(ambLight)

    const moonLight = new THREE.DirectionalLight(0x6688ff, 1.5)
    moonLight.position.set(-10, 20, 15)
    scene.add(moonLight)

    const warmLight = new THREE.DirectionalLight(0xff4488, 0.8)
    warmLight.position.set(15, 5, -10)
    scene.add(warmLight)

    const buildings = []
    const buildingCount = 14
    const windowTex = createWindowTexture()
    const bendayTex = createBendayDotsTexture()

    for (let i = 0; i < buildingCount; i++) {
      const angle = (i / buildingCount) * Math.PI * 2
      const dist = 6 + Math.random() * 6
      const height = 3 + Math.random() * 7
      const width = 1.2 + Math.random() * 1.5
      const depth = 1.2 + Math.random() * 1.5

      const hue = [0, 240, 300, 30, 180][i % 5]
      const mat = new THREE.MeshStandardMaterial({
        map: i % 3 === 0 ? windowTex : (i % 3 === 1 ? bendayTex : undefined),
        color: new THREE.Color().setHSL(hue / 360, 0.4, 0.08 + Math.random() * 0.15),
        roughness: 0.6,
        metalness: 0.1,
      })

      const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat)
      box.position.set(
        Math.cos(angle) * dist,
        height / 2,
        Math.sin(angle) * dist
      )
      box.castShadow = true
      box.receiveShadow = true
      scene.add(box)
      buildings.push(box)

      if (i % 4 === 0) {
        const logoTex = createLogoTexture(i)
        const logoMat = new THREE.MeshStandardMaterial({ map: logoTex, transparent: true, emissive: 0xcc0000, emissiveIntensity: 0.2 })
        const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), logoMat)
        const towardCenter = new THREE.Vector3(0, height * 0.6, 0).sub(box.position).normalize()
        logoPlane.position.copy(box.position).add(towardCenter.multiplyScalar(width / 2 + 0.05))
        logoPlane.position.y = height * 0.6
        logoPlane.lookAt(0, height * 0.6, 0)
        scene.add(logoPlane)
      }

      if (i % 3 === 0) {
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0xff0044, emissiveIntensity: 0.3 })
        const roofLight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), roofMat)
        roofLight.position.set(box.position.x, height + 0.2, box.position.z)
        scene.add(roofLight)
      }
    }

    const posterTextures = [
      createPosterTexture('INTO THE\nSPIDER-VERSE', '#ff0055', '#0044ff'),
      createPosterTexture('ACROSS THE\nSPIDER-VERSE', '#ff6600', '#cc00ff'),
      createPosterTexture('BEYOND THE\nSPIDER-VERSE', '#00ff88', '#0044ff'),
    ]

    for (let i = 0; i < 3; i++) {
      const bIdx = i * 5 + 2
      if (bIdx < buildings.length) {
        const b = buildings[bIdx]
        const posterMat = new THREE.MeshStandardMaterial({ map: posterTextures[i], transparent: true, emissive: 0xffffff, emissiveIntensity: 0.1 })
        const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), posterMat)
        const dir = new THREE.Vector3(0, b.position.y * 0.5, 0).sub(b.position).normalize()
        poster.position.copy(b.position).add(dir.multiplyScalar(1))
        poster.position.y = b.position.y * 0.7
        poster.lookAt(0, b.position.y * 0.7, 0)
        scene.add(poster)
      }
    }

    const webStrands = []
    const webColors = [0xff0055, 0x00ccff, 0xffcc00, 0xffffff]

    for (let i = 0; i < 40; i++) {
      const idx1 = Math.floor(Math.random() * buildingCount)
      let idx2 = Math.floor(Math.random() * buildingCount)
      if (idx2 === idx1) idx2 = (idx1 + 1) % buildingCount

      const b1 = buildings[idx1]
      const b2 = buildings[idx2]
      const p1 = new THREE.Vector3(b1.position.x, Math.random() * 6 + 1, b1.position.z)
      const p2 = new THREE.Vector3(b2.position.x, Math.random() * 6 + 1, b2.position.z)
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
      mid.y -= 1.5 + Math.random() * 2

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
      const points = curve.getPoints(16)
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const lineMat = new THREE.LineBasicMaterial({
        color: webColors[i % webColors.length],
        transparent: true,
        opacity: 0.08 + Math.random() * 0.08,
      })
      const line = new THREE.Line(geo, lineMat)
      scene.add(line)
      webStrands.push({ line, speed: 0.1 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2 })
    }

    const particleCount = 800
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const particleVelocities = []

    const svColors = [
      [1, 0, 0.33],
      [0, 0.5, 1],
      [1, 0.8, 0],
      [1, 0, 0.66],
      [0, 1, 0.5],
      [1, 1, 1],
    ]

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = 2 + Math.random() * 18
      const y = Math.random() * 10 - 1
      positions[i * 3] = Math.cos(theta) * r
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(theta) * r

      const c = svColors[Math.floor(Math.random() * svColors.length)]
      colors[i * 3] = c[0]
      colors[i * 3 + 1] = c[1]
      colors[i * 3 + 2] = c[2]

      sizes[i] = 0.03 + Math.random() * 0.1

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.008,
      })
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    const glitchTex = createGlitchTexture()
    const glitchGeos = []
    const glitchList = []
    for (let i = 0; i < 8; i++) {
      const glitchMat = new THREE.MeshBasicMaterial({
        map: glitchTex,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const glitchMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 20 + Math.random() * 15), glitchMat)
      const angle = Math.random() * Math.PI * 2
      const dist = 10 + Math.random() * 10
      glitchMesh.position.set(Math.cos(angle) * dist, 3 + Math.random() * 4, Math.sin(angle) * dist)
      glitchMesh.lookAt(0, 3, 0)
      scene.add(glitchMesh)
      glitchList.push({
        mesh: glitchMesh,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        origOpacity: 0.05 + Math.random() * 0.08,
      })
    }
    glitchMeshes.current = glitchList

    const portalParticles = 200
    const portalGeo = new THREE.BufferGeometry()
    const portalPos = new Float32Array(portalParticles * 3)
    for (let i = 0; i < portalParticles; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 6
      const y = (Math.random() - 0.5) * 8
      portalPos[i * 3] = Math.cos(theta) * r
      portalPos[i * 3 + 1] = y
      portalPos[i * 3 + 2] = Math.sin(theta) * r
    }
    portalGeo.setAttribute('position', new THREE.BufferAttribute(portalPos, 3))
    const portalMat = new THREE.PointsMaterial({
      color: 0xff44aa,
      size: 0.15,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    })
    const portalPoints = new THREE.Points(portalGeo, portalMat)
    portalPoints.position.set(0, 3, 0)
    scene.add(portalPoints)

    let yaw = 0
    let pitch = 0
    let isDragging = false
    let prevMouse = { x: 0, y: 0 }
    let autoRotate = true
    const autoRotateSpeed = 0.002

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

    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      if (autoRotate) yaw += autoRotateSpeed

      const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      const qP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch)
      camera.quaternion.copy(qY.multiply(qP))

      webStrands.forEach((ws) => {
        ws.line.material.opacity = 0.08 + Math.sin(time * ws.speed + ws.offset) * 0.06
      })

      const pos = particles.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x
        pos[i * 3 + 1] += particleVelocities[i].y
        pos[i * 3 + 2] += particleVelocities[i].z
        const px = pos[i * 3]
        const pz = pos[i * 3 + 2]
        const dist = Math.sqrt(px * px + pz * pz)
        if (dist > 20 || pos[i * 3 + 1] > 12 || pos[i * 3 + 1] < -2) {
          const theta = Math.random() * Math.PI * 2
          const r = 2 + Math.random() * 15
          pos[i * 3] = Math.cos(theta) * r
          pos[i * 3 + 1] = Math.random() * 10 - 1
          pos[i * 3 + 2] = Math.sin(theta) * r
        }
      }
      particles.geometry.attributes.position.needsUpdate = true

      glitchList.forEach((g) => {
        g.mesh.material.opacity = g.origOpacity + Math.sin(time * g.speed + g.phase) * 0.03
        g.mesh.position.y = 3 + Math.sin(time * 0.3 + g.phase) * 2
      })

      portalPoints.rotation.x = Math.sin(time * 0.2) * 0.1
      portalPoints.rotation.z = Math.cos(time * 0.3) * 0.1
      portalPoints.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.1

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

    sceneState.current = { scene, camera, renderer }
    setPhase('intro')

    const introTimer = setTimeout(() => {
      setPhase('viewing')
      endingTimeout.current = setTimeout(() => setEnding(true), 25000)
    }, 4000)

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

  function createLogoTexture(i) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 256, 256)
    const cx = 128, cy = 128, r = 70
    const colors = [['#ff0055','#0044ff'],['#ff6600','#cc00ff'],['#00ff88','#0044ff']]
    const c = colors[i % colors.length]
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = c[0]
    ctx.fill()
    ctx.strokeStyle = c[1]
    ctx.lineWidth = 6
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 80px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🕷', cx, cy + 5)
    return new THREE.CanvasTexture(canvas)
  }

  return (
    <div className="spiderverse-360">
      {bgVideo && (
        <video className="sv-bg-video" autoPlay loop muted playsInline>
          <source src={bgVideo} type="video/mp4" />
        </video>
      )}
      <div ref={containerRef} className="pano-container" />

      {phase === 'intro' && (
        <div className="sv-intro">
          <div className="sv-intro-dots" />
          <div className="sv-particles-rain" />
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
          <span className="sv-hint-text">🕷 Drag to explore the Spider-Verse</span>
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
