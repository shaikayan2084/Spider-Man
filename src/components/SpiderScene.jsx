import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function SpiderScene({ suit }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const figureRef = useRef(null)
  const particlesRef = useRef(null)
  const webLinesRef = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = container.clientWidth
    const h = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(3, 2, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    sceneRef.current = { scene, camera, renderer }

    const ambLight = new THREE.AmbientLight(0x404060, 0.5)
    scene.add(ambLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 2)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    scene.add(dirLight)

    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.8)
    rimLight.position.set(-3, 1, -4)
    scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0xff4488, 0.3)
    fillLight.position.set(2, -3, 3)
    scene.add(fillLight)

    const figure = new THREE.Group()

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 24, 24),
      new THREE.MeshStandardMaterial({ color: suit.primary, roughness: 0.3, metalness: 0.1 })
    )
    head.position.y = 1.8
    head.castShadow = true
    figure.add(head)

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 })
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeMat)
    leftEye.position.set(-0.2, 1.95, 0.45)
    leftEye.scale.set(1, 0.6, 0.4)
    figure.add(leftEye)

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeMat)
    rightEye.position.set(0.2, 1.95, 0.45)
    rightEye.scale.set(1, 0.6, 0.4)
    figure.add(rightEye)

    const torsoMat = new THREE.MeshStandardMaterial({ color: suit.bodyColor, roughness: 0.4, metalness: 0.2 })
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.2, 12), torsoMat)
    torso.position.y = 0.9
    torso.castShadow = true
    figure.add(torso)

    const chestMat = new THREE.MeshStandardMaterial({ color: suit.secondary, roughness: 0.3, metalness: 0.1 })
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 12), chestMat)
    chest.position.y = 1.2
    chest.scale.set(1, 1, 0.6)
    figure.add(chest)

    const abdomenMat = new THREE.MeshStandardMaterial({ color: suit.secondary, roughness: 0.4, metalness: 0.1 })
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 0.4, 12), abdomenMat)
    abdomen.position.y = 0.55
    abdomen.scale.set(1, 1, 0.7)
    figure.add(abdomen)

    const armMat = new THREE.MeshStandardMaterial({ color: suit.legColor, roughness: 0.4, metalness: 0.2 })
    const makeLimb = (x, y, z, rx, ry, rz, sx, sy, sz) => {
      const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.6, 8), armMat)
      limb.position.set(x, y, z)
      limb.rotation.set(rx, ry, rz)
      limb.scale.set(sx || 1, sy || 1, sz || 1)
      limb.castShadow = true
      figure.add(limb)
      return limb
    }

    const lArm1 = makeLimb(-0.65, 1.5, 0, 0.3, 0, 0.2, 1, 1, 1)
    const rArm1 = makeLimb(0.65, 1.5, 0, -0.3, 0, -0.2, 1, 1, 1)
    const lArm2 = makeLimb(-0.75, 1.1, 0, 0.8, 0, 0.1, 0.9, 1, 0.9)
    const rArm2 = makeLimb(0.75, 1.1, 0, -0.8, 0, -0.1, 0.9, 1, 0.9)

    const lLeg1 = makeLimb(-0.3, 0.2, 0, -0.2, 0, 0, 1, 1, 1)
    const rLeg1 = makeLimb(0.3, 0.2, 0, 0.2, 0, 0, 1, 1, 1)
    const lLeg2 = makeLimb(-0.35, -0.25, 0.1, 0.3, 0, 0, 0.9, 1, 0.9)
    const rLeg2 = makeLimb(0.35, -0.25, 0.1, -0.3, 0, 0, 0.9, 1, 0.9)

    figure.position.y = -0.5
    scene.add(figure)
    figureRef.current = figure

    const limbs = [lArm1, rArm1, lArm2, rArm2, lLeg1, rLeg1, lLeg2, rLeg2]
    figure.userData = { limbs }

    const particleCount = 300
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 2 + Math.random() * 3
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.5 + 0.8
      positions[i * 3 + 2] = Math.cos(phi) * r
      sizes[i] = 0.02 + Math.random() * 0.04
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)
    particlesRef.current = particles

    const webMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    const webLines = []
    for (let i = 0; i < 40; i++) {
      const points = []
      const startAngle = Math.random() * Math.PI * 2
      const startR = 1.5 + Math.random() * 0.5
      const endR = 3 + Math.random() * 2
      const steps = 20
      for (let j = 0; j <= steps; j++) {
        const t = j / steps
        const angle = startAngle + t * (Math.random() - 0.5) * 0.5
        const r = startR + (endR - startR) * t
        const yOff = (Math.random() - 0.5) * 2 * t
        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          0.8 + yOff,
          Math.sin(angle) * r
        ))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geo, webMat)
      scene.add(line)
      webLines.push(line)
    }
    webLinesRef.current = webLines

    const animate = () => {
      requestAnimationFrame(animate)
      const time = Date.now() * 0.001

      if (figureRef.current) {
        figureRef.current.rotation.y += 0.005
        figureRef.current.position.y = -0.5 + Math.sin(time * 0.8) * 0.1

        const limbData = figureRef.current.userData.limbs
        if (limbData) {
          limbData[0].rotation.x = 0.3 + Math.sin(time * 1.2) * 0.15
          limbData[1].rotation.x = -0.3 + Math.sin(time * 1.2 + Math.PI) * 0.15
          limbData[2].rotation.x = 0.8 + Math.sin(time * 1.2 + 0.5) * 0.1
          limbData[3].rotation.x = -0.8 + Math.sin(time * 1.2 + 0.5 + Math.PI) * 0.1
          limbData[4].rotation.x = -0.2 + Math.sin(time * 0.9) * 0.1
          limbData[5].rotation.x = 0.2 + Math.sin(time * 0.9 + Math.PI) * 0.1
          limbData[6].rotation.x = 0.3 + Math.sin(time * 0.9 + 0.3) * 0.08
          limbData[7].rotation.x = -0.3 + Math.sin(time * 0.9 + 0.3 + Math.PI) * 0.08
        }
      }

      if (particlesRef.current) {
        const pos = particlesRef.current.geometry.attributes.position.array
        for (let i = 0; i < pos.length; i += 3) {
          pos[i + 1] += Math.sin(time + i) * 0.001
          pos[i] += Math.cos(time * 0.5 + i * 0.1) * 0.001
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true
        particlesRef.current.rotation.y = time * 0.02
      }

      webLines.forEach((line, i) => {
        line.material.opacity = 0.1 + Math.sin(time * 0.5 + i) * 0.05
      })

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
      window.removeEventListener('resize', handleResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) obj.material.dispose()
      })
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (!figureRef.current) return

    const loader = new THREE.TextureLoader()
    const texture = loader.load(suit.actionImage)

    figureRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.geometry.type === 'SphereGeometry' && child.position.y > 1.7) {
          child.material.map = texture
          child.material.color.set('#ffffff')
          child.material.needsUpdate = true
        } else if (child.geometry.type === 'CylinderGeometry') {
          const y = child.position.y
          if (y > 1.0) {
            child.material.map = texture
            child.material.color.set('#ffffff')
            child.material.needsUpdate = true
          } else if (y > 0.4) {
            child.material.color.set(suit.secondary)
          } else {
            child.material.color.set(suit.legColor)
          }
        }
      }
    })
  }, [suit])

  return (
    <div ref={containerRef} className="spider-scene" />
  )
}
