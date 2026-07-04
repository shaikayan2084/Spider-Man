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

function createLogoTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 256, 256)
  const cx = 128, cy = 128, r = 70
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = '#cc0000'
  ctx.fill()
  ctx.strokeStyle = '#0044cc'
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 80px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🕷', cx, cy + 5)
  ctx.fillStyle = '#0044cc'
  ctx.font = 'bold 20px Arial'
  ctx.fillText('SPIDER', cx, cy - r - 20)
  return new THREE.CanvasTexture(canvas)
}

function createSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 1024)
  grad.addColorStop(0, '#0a0015')
  grad.addColorStop(0.4, '#1a0030')
  grad.addColorStop(0.7, '#2a1040')
  grad.addColorStop(1, '#0a0a1a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 2048, 1024)
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 2048
    const y = Math.random() * 600
    const size = Math.random() * 2 + 0.5
    const bright = Math.random() * 0.7 + 0.3
    ctx.fillStyle = `rgba(255,255,255,${bright * 0.6})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  return new THREE.CanvasTexture(canvas)
}

export default function SpiderVerse360() {
  const containerRef = useRef(null)
  const sceneState = useRef(null)
  const [phase, setPhase] = useState('loading')
  const [ending, setEnding] = useState(false)
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
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 200)
    camera.position.set(0, 1.6, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    const skyGeo = new THREE.SphereGeometry(80, 32, 32)
    const skyMat = new THREE.MeshBasicMaterial({ map: createSkyTexture(), side: THREE.BackSide })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)

    const ambLight = new THREE.AmbientLight(0x222244, 0.6)
    scene.add(ambLight)

    const moonLight = new THREE.DirectionalLight(0x4488ff, 1.5)
    moonLight.position.set(-10, 20, 15)
    scene.add(moonLight)

    const warmLight = new THREE.DirectionalLight(0xff8844, 0.8)
    warmLight.position.set(15, 5, -10)
    scene.add(warmLight)

    const buildings = []
    const buildingCount = 14
    const windowTex = createWindowTexture()
    const logoTex = createLogoTexture()

    for (let i = 0; i < buildingCount; i++) {
      const angle = (i / buildingCount) * Math.PI * 2
      const dist = 6 + Math.random() * 6
      const height = 3 + Math.random() * 7
      const width = 1.2 + Math.random() * 1.5
      const depth = 1.2 + Math.random() * 1.5

      const mat = new THREE.MeshStandardMaterial({
        map: i % 3 === 0 ? windowTex : undefined,
        color: i % 3 === 0 ? 0xffffff : new THREE.Color().setHSL(0.65 + Math.random() * 0.08, 0.3, 0.08 + Math.random() * 0.1),
        roughness: 0.7,
        metalness: 0.2,
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
        const logoMat = new THREE.MeshStandardMaterial({ map: logoTex, transparent: true, emissive: 0xcc0000, emissiveIntensity: 0.3 })
        const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), logoMat)
        const towardCenter = new THREE.Vector3(0, height * 0.6, 0).sub(box.position).normalize()
        logoPlane.position.copy(box.position).add(towardCenter.multiplyScalar(width / 2 + 0.05))
        logoPlane.position.y = height * 0.6
        logoPlane.lookAt(0, height * 0.6, 0)
        scene.add(logoPlane)
      }

      if (i % 3 === 0) {
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0xff0044, emissiveIntensity: 0.2 })
        const roofLight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), roofMat)
        roofLight.position.set(box.position.x, height + 0.2, box.position.z)
        scene.add(roofLight)
      }
    }

    const webStrands = []
    const webMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })

    for (let i = 0; i < 30; i++) {
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
      const line = new THREE.Line(geo, webMat.clone())
      scene.add(line)
      webStrands.push({ line, speed: 0.2 + Math.random() * 0.3, offset: Math.random() * Math.PI * 2 })
    }

    const particleCount = 500
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const particleVelocities = []

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = 3 + Math.random() * 15
      const y = Math.random() * 8
      positions[i * 3] = Math.cos(theta) * r
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(theta) * r

      const colorChoice = Math.random()
      if (colorChoice < 0.33) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 0
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.3; colors[i * 3 + 2] = 1
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1
      }

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005,
      })
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

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

    const onMouseUp = () => {
      isDragging = false
    }

    const onWheel = () => {
      autoRotate = false
    }

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

    const onTouchEnd = () => {
      touchState.id = null
    }

    container.addEventListener('touchstart', onTouchStart)
    container.addEventListener('touchmove', onTouchMove)
    container.addEventListener('touchend', onTouchEnd)

    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      if (autoRotate) {
        yaw += autoRotateSpeed
      }

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
        if (dist > 18 || pos[i * 3 + 1] > 10 || pos[i * 3 + 1] < 0) {
          const theta = Math.random() * Math.PI * 2
          const r = 3 + Math.random() * 12
          pos[i * 3] = Math.cos(theta) * r
          pos[i * 3 + 1] = Math.random() * 8
          pos[i * 3 + 2] = Math.sin(theta) * r
        }
      }
      particles.geometry.attributes.position.needsUpdate = true
      particles.rotation.y = time * 0.01

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

    sceneState.current = { scene, camera, renderer, buildings, webStrands, particles }
    setPhase('intro')

    const introTimer = setTimeout(() => {
      setPhase('viewing')
      endingTimeout.current = setTimeout(() => {
        setEnding(true)
      }, 25000)
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
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

      {phase === 'intro' && (
        <div className="sv-intro">
          <div className="sv-intro-dots" />
          <div className="sv-title-container">
            <h1 className="sv-title">
              <span className="sv-title-line sv-title-spider">SPIDER</span>
              <span className="sv-title-line sv-title-verse">VERSE</span>
            </h1>
            <div className="sv-subtitle">A 360° Experience</div>
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
            <p className="sv-ending-sub">Spider-Verse 360°</p>
          </div>
        </div>
      )}

      {phase === 'viewing' && !ending && (
        <div className="sv-hint">
          <span className="sv-hint-text">Drag to look around</span>
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
