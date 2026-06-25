import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'
import { locations, type LocationData } from '../data/locations'
import gsap from 'gsap'

interface GlobeProps {
  onDotClick: (location: LocationData) => void
  onDotHover: (location: LocationData | null) => void
  activeLocationId: string | null
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  // Dark ocean background
  ctx.fillStyle = '#080808'
  ctx.fillRect(0, 0, 2048, 1024)

  function drawContinent(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rotation = 0
  ) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)

    const grad = ctx.createRadialGradient(0, -ry * 0.3, 0, 0, 0, Math.max(rx, ry))
    grad.addColorStop(0, '#D8D8E8')
    grad.addColorStop(0.35, '#A8A8B8')
    grad.addColorStop(0.65, '#787888')
    grad.addColorStop(1, '#505058')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()

    // Metallic sheen highlight
    const sheen = ctx.createLinearGradient(-rx, -ry, rx, ry)
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.25)')
    sheen.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)')
    sheen.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)')
    sheen.addColorStop(1, 'rgba(200, 200, 220, 0.15)')
    ctx.fillStyle = sheen
    ctx.beginPath()
    ctx.ellipse(0, 0, rx * 0.95, ry * 0.95, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  drawContinent(350, 280, 180, 140, -0.2)
  drawContinent(420, 380, 100, 80, 0.3)
  drawContinent(480, 550, 70, 160, 0.1)
  drawContinent(1000, 250, 100, 70)
  drawContinent(1050, 420, 90, 140)
  drawContinent(1350, 280, 220, 130)
  drawContinent(1550, 600, 80, 50)
  drawContinent(650, 160, 60, 40)

  // Subtle metallic texture on landmasses
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 2048
    const y = Math.random() * 1024
    const r = Math.random() * 2.5
    const brightness = 120 + Math.random() * 80
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness + 10}, 0.12)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default function Globe({ onDotClick, onDotHover, activeLocationId }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const dotsRef = useRef<THREE.Mesh[]>([])
  const ringsRef = useRef<THREE.Mesh[]>([])
  const outerRingsRef = useRef<(THREE.Mesh | null)[]>([])
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const hoveredDotRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const isAnimatingCameraRef = useRef(false)
  const autoRotatePausedRef = useRef(false)

  const handleDotClick = useCallback((location: LocationData) => {
    onDotClick(location)
  }, [onDotClick])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 240)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight1.position.set(100, 50, 50)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x888888, 0.3)
    dirLight2.position.set(-50, -30, -50)
    scene.add(dirLight2)

    // Globe group
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    // Globe sphere
    const earthTexture = createEarthTexture()
    const globeGeometry = new THREE.SphereGeometry(80, 64, 64)
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      color: 0x888898,
      emissive: 0x101018,
      specular: 0xccccdd,
      shininess: 35,
      transparent: true,
    })
    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    globeGroup.add(globe)

    // Atmosphere glow
    const atmosphereGeo = new THREE.SphereGeometry(85, 64, 64)
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.75, 0.75, 0.75, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat)
    globeGroup.add(atmosphere)

    // Dot markers
    const dots: THREE.Mesh[] = []
    const rings: THREE.Mesh[] = []
    const outerRings: (THREE.Mesh | null)[] = []

    locations.forEach((location, index) => {
      const pos = latLngToVector3(location.lat, location.lng, 82)

      // Dot sphere
      const dotGeo = new THREE.SphereGeometry(1.2, 16, 16)
      const dotMat = new THREE.MeshPhongMaterial({
        color: 0xC0C0C0,
        emissive: 0x222222,
        specular: 0xffffff,
        shininess: 50,
      })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.copy(pos)
      dot.scale.set(0, 0, 0) // Start invisible for entrance animation
      dot.userData = { location, index }
      globeGroup.add(dot)
      dots.push(dot)

      // Facing ring
      const ringGeo = new THREE.RingGeometry(2.0, 2.4, 32)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xC0C0C0,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.copy(pos)
      ring.scale.set(0, 0, 0)
      globeGroup.add(ring)
      rings.push(ring)

      outerRings.push(null)
    })

    dotsRef.current = dots
    ringsRef.current = rings
    outerRingsRef.current = outerRings

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.minDistance = 150
    controls.maxDistance = 400
    controls.rotateSpeed = 0.4
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3
    controlsRef.current = controls

    // Dot entrance animation
    setTimeout(() => {
      dots.forEach((dot, i) => {
        setTimeout(() => {
          gsap.to(dot.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.4,
            ease: 'back.out(2)',
          })
          gsap.to(rings[i].scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.4,
            ease: 'back.out(2)',
          })
        }, i * 120)
      })
    }, 800)

    // Mouse move handler
    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    // Click handler
    const onClick = (event: MouseEvent) => {
      if (isAnimatingCameraRef.current) return

      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(dots)

      if (intersects.length > 0) {
        const clickedDot = intersects[0].object as THREE.Mesh
        const location = clickedDot.userData.location as LocationData

        // Pause auto-rotate
        autoRotatePausedRef.current = true
        controls.autoRotate = false
        isAnimatingCameraRef.current = true

        // Camera animation to dot
        const targetPos = latLngToVector3(location.lat, location.lng, 180)

        gsap.to(camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: () => {
            camera.lookAt(0, 0, 0)
          },
          onComplete: () => {
            isAnimatingCameraRef.current = false
            controls.enabled = true
          },
        })

        controls.enabled = false
        handleDotClick(location)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onClick)

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    function animate() {
      rafRef.current = requestAnimationFrame(animate)

      controls.update()

      // Rings face camera
      rings.forEach((ring) => {
        ring.quaternion.copy(camera.quaternion)
      })
      outerRings.forEach((ring) => {
        if (ring) ring.quaternion.copy(camera.quaternion)
      })

      // Raycasting for hover
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(dots)

      if (intersects.length > 0) {
        const hoveredDot = intersects[0].object as THREE.Mesh
        const index = hoveredDot.userData.index as number

        if (hoveredDotRef.current !== index) {
          // Reset previous hover
          if (hoveredDotRef.current !== null) {
            const prevIndex = hoveredDotRef.current
            const prevDot = dots[prevIndex]
            const prevRing = rings[prevIndex]
            const prevOuterRing = outerRings[prevIndex]

            gsap.to(prevDot.scale, { x: 1, y: 1, z: 1, duration: 0.2 })
            ;(prevDot.material as THREE.MeshPhongMaterial).color.setHex(0xC0C0C0)
            gsap.to(prevRing.scale, { x: 1, y: 1, z: 1, duration: 0.2 })
            ;(prevRing.material as THREE.MeshBasicMaterial).opacity = 0.4
            ;(prevRing.material as THREE.MeshBasicMaterial).color.setHex(0xC0C0C0)

            if (prevOuterRing) {
              gsap.to(prevOuterRing.scale, {
                x: 0, y: 0, z: 0, duration: 0.2,
                onComplete: () => {
                  if (prevOuterRing.parent) prevOuterRing.parent.remove(prevOuterRing)
                  outerRings[prevIndex] = null
                },
              })
            }
          }

          // Apply new hover
          hoveredDotRef.current = index
          const dot = dots[index]
          const ring = rings[index]

          gsap.to(dot.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.2 })
          ;(dot.material as THREE.MeshPhongMaterial).color.setHex(0xFFD700)
          gsap.to(ring.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.2 })
          ;(ring.material as THREE.MeshBasicMaterial).opacity = 0.8
          ;(ring.material as THREE.MeshBasicMaterial).color.setHex(0xFFD700)

          // Create outer ring
          const outerRingGeo = new THREE.RingGeometry(3.0, 3.1, 32)
          const outerRingMat = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            opacity: 0.15,
            transparent: true,
            side: THREE.DoubleSide,
          })
          const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat)
          outerRing.position.copy(dot.position)
          outerRing.scale.set(0, 0, 0)
          globeGroup.add(outerRing)
          outerRings[index] = outerRing

          gsap.to(outerRing.scale, { x: 1, y: 1, z: 1, duration: 0.3 })

          onDotHover(hoveredDot.userData.location as LocationData)
        }
      } else {
        if (hoveredDotRef.current !== null) {
          const prevIndex = hoveredDotRef.current
          const prevDot = dots[prevIndex]
          const prevRing = rings[prevIndex]
          const prevOuterRing = outerRings[prevIndex]

          gsap.to(prevDot.scale, { x: 1, y: 1, z: 1, duration: 0.2 })
          ;(prevDot.material as THREE.MeshPhongMaterial).color.setHex(0xC0C0C0)
          gsap.to(prevRing.scale, { x: 1, y: 1, z: 1, duration: 0.2 })
          ;(prevRing.material as THREE.MeshBasicMaterial).opacity = 0.4
          ;(prevRing.material as THREE.MeshBasicMaterial).color.setHex(0xC0C0C0)

          if (prevOuterRing) {
            gsap.to(prevOuterRing.scale, {
              x: 0, y: 0, z: 0, duration: 0.2,
              onComplete: () => {
                if (prevOuterRing.parent) prevOuterRing.parent.remove(prevOuterRing)
                outerRings[prevIndex] = null
              },
            })
          }

          hoveredDotRef.current = null
          onDotHover(null)
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      globeGeometry.dispose()
      globeMaterial.dispose()
      atmosphereGeo.dispose()
      atmosphereMat.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [handleDotClick, onDotHover])

  // Resume auto-rotate when card closes
  useEffect(() => {
    if (!activeLocationId && controlsRef.current && autoRotatePausedRef.current) {
      autoRotatePausedRef.current = false
      setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.autoRotate = true
        }
      }, 2000)
    }
  }, [activeLocationId])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  )
}
