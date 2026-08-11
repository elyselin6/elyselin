import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'
import { getGlobeLocations, getLocationsForMarker, type LocationData } from '../data/locations'
import gsap from 'gsap'

const DRAG_THRESHOLD = 5
const MIN_ZOOM_DISTANCE = 95
const MAX_ZOOM_DISTANCE = 480

interface GlobeProps {
  onDotClick: (locations: LocationData[]) => void
  onDotHover: (location: LocationData | null) => void
  activeLocationId: string | null
  isMobile?: boolean
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

function getMarkerCoords(location: LocationData): { lat: number; lng: number } {
  return { lat: location.lat, lng: location.lng }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function createEarthTexture(): Promise<THREE.CanvasTexture> {
  const width = 2048
  const height = 1024
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const maskImg = await loadImage(
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'
  )

  ctx.drawImage(maskImg, 0, 0, width, height)
  const source = ctx.getImageData(0, 0, width, height)
  const land = new Uint8Array(width * height)

  for (let i = 0; i < width * height; i++) {
    land[i] = source.data[i * 4] > 20 ? 1 : 0
  }

  const imageData = ctx.createImageData(width, height)
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4
    if (land[i]) {
      imageData.data[offset] = 168
      imageData.data[offset + 1] = 168
      imageData.data[offset + 2] = 184
      imageData.data[offset + 3] = 255
    } else {
      imageData.data[offset] = 6
      imageData.data[offset + 1] = 6
      imageData.data[offset + 2] = 8
      imageData.data[offset + 3] = 255
    }
  }

  // Coastline outlines for clearly defined continents
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      if (!land[i]) continue

      const touchesOcean =
        !land[i - 1] ||
        !land[i + 1] ||
        !land[i - width] ||
        !land[i + width] ||
        !land[i - width - 1] ||
        !land[i - width + 1] ||
        !land[i + width - 1] ||
        !land[i + width + 1]

      if (touchesOcean) {
        const offset = i * 4
        imageData.data[offset] = 220
        imageData.data[offset + 1] = 220
        imageData.data[offset + 2] = 232
        imageData.data[offset + 3] = 255
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function createSilverMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0xc0c0c0,
    emissive: 0x222222,
    specular: 0xffffff,
    shininess: 55,
  })
}

function createCopperMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0xb87333,
    emissive: 0x2a1508,
    specular: 0xffeedd,
    shininess: 52,
  })
}

function createBronzeMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0xcd7f32,
    emissive: 0x2a1808,
    specular: 0xffeedd,
    shininess: 48,
  })
}

function createGoldMaterial(): THREE.MeshPhongMaterial {
  return new THREE.MeshPhongMaterial({
    color: 0xffd700,
    emissive: 0x3a2a00,
    specular: 0xffffff,
    shininess: 50,
  })
}

function createMonopolyHomeMarker(material: THREE.MeshPhongMaterial): THREE.Group {
  const marker = new THREE.Group()

  const bodyWidth = 1.05
  const bodyDepth = 0.82
  const bodyHeight = 0.62
  const roofHeight = 0.48
  const overhang = 0.1
  const roofDepth = bodyDepth + overhang * 2
  const roofHalfWidth = (bodyWidth + overhang * 2) / 2
  const roofPanelLength = Math.hypot(roofHalfWidth, roofHeight)
  const roofAngle = Math.atan2(roofHeight, roofHalfWidth)
  const roofThickness = 0.09

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth),
    material
  )
  body.position.y = bodyHeight / 2

  const leftRoof = new THREE.Mesh(
    new THREE.BoxGeometry(roofPanelLength, roofThickness, roofDepth),
    material
  )
  leftRoof.position.set(-bodyWidth / 4, bodyHeight + roofHeight / 2, 0)
  leftRoof.rotation.z = roofAngle

  const rightRoof = new THREE.Mesh(
    new THREE.BoxGeometry(roofPanelLength, roofThickness, roofDepth),
    material
  )
  rightRoof.position.set(bodyWidth / 4, bodyHeight + roofHeight / 2, 0)
  rightRoof.rotation.z = -roofAngle

  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.065, 0.18, 12),
    material
  )
  chimney.position.set(bodyWidth * 0.22, bodyHeight + roofHeight * 0.58, bodyDepth * 0.12)
  chimney.rotation.z = -roofAngle

  marker.add(body, leftRoof, rightRoof, chimney)

  return marker
}

function createDotMarker(material: THREE.MeshPhongMaterial): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), material)
}

async function createGoldCrestTexture(src: string): Promise<THREE.CanvasTexture> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i]
    const green = imageData.data[i + 1]
    const blue = imageData.data[i + 2]
    const alpha = imageData.data[i + 3]
    if (alpha < 20) continue

    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
    if (luminance < 0.08 || (red < 40 && green < 40 && blue < 40)) {
      imageData.data[i + 3] = 0
      continue
    }

    imageData.data[i] = Math.min(255, 90 + luminance * 165)
    imageData.data[i + 1] = Math.min(255, 70 + luminance * 145)
    imageData.data[i + 2] = Math.min(255, 10 + luminance * 55)
  }

  ctx.putImageData(imageData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function createUpennCrestMarker(texture: THREE.Texture): THREE.Group {
  const marker = new THREE.Group()
  const crestWidth = 1.35
  const crestHeight = 1.55

  const crest = new THREE.Mesh(
    new THREE.PlaneGeometry(crestWidth, crestHeight),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  )
  crest.rotation.x = -Math.PI / 2
  crest.position.y = 0.06

  marker.add(crest)
  return marker
}

function createMetropolisMarker(material: THREE.MeshPhongMaterial): THREE.Group {
  const marker = new THREE.Group()

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.11, 0.52), material)
  base.position.y = 0.055
  marker.add(base)

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.92, 0.46), material)
  body.position.y = 0.11 + 0.46
  marker.add(body)

  const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 0.5), material)
  cornice.position.y = 0.11 + 0.92 + 0.04
  marker.add(cornice)

  const upperTier = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.28, 0.4), material)
  upperTier.position.y = 0.11 + 0.92 + 0.08 + 0.14
  marker.add(upperTier)

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    material
  )
  dome.position.y = 0.11 + 0.92 + 0.08 + 0.28 + 0.12
  marker.add(dome)

  const angelTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.11, 8), material)
  angelTorso.position.y = dome.position.y + 0.22
  marker.add(angelTorso)

  const wings = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.018, 0.07), material)
  wings.position.copy(angelTorso.position)
  marker.add(wings)

  const raisedArm = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.09, 0.018), material)
  raisedArm.position.set(0.035, angelTorso.position.y + 0.07, 0)
  marker.add(raisedArm)

  return marker
}

function createKlccTwinTowersMarker(material: THREE.MeshPhongMaterial): THREE.Group {
  const marker = new THREE.Group()

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.1, 0.48), material)
  base.position.y = 0.05
  marker.add(base)

  const towerOffset = 0.22
  const towerTiers = [
    { y: 0.36, height: 0.34, radiusTop: 0.11, radiusBottom: 0.15 },
    { y: 0.66, height: 0.3, radiusTop: 0.09, radiusBottom: 0.11 },
    { y: 0.92, height: 0.28, radiusTop: 0.07, radiusBottom: 0.09 },
    { y: 1.16, height: 0.24, radiusTop: 0.05, radiusBottom: 0.07 },
    { y: 1.36, height: 0.2, radiusTop: 0.035, radiusBottom: 0.05 },
  ]

  ;[-towerOffset, towerOffset].forEach((x) => {
    towerTiers.forEach(({ y, height, radiusTop, radiusBottom }) => {
      const segment = new THREE.Mesh(
        new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8),
        material
      )
      segment.position.set(x, 0.1 + y, 0)
      marker.add(segment)
    })

    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.38, 8), material)
    spire.position.set(x, 0.1 + 1.36 + 0.1 + 0.19, 0)
    marker.add(spire)

    const spireTip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 8), material)
    spireTip.position.set(x, spire.position.y + 0.24, 0)
    marker.add(spireTip)
  })

  const skybridge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), material)
  skybridge.position.y = 0.1 + 0.58
  marker.add(skybridge)

  return marker
}

function createTaipei101Marker(material: THREE.MeshPhongMaterial): THREE.Group {
  const marker = new THREE.Group()

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.14, 0.95),
    material
  )
  base.position.y = 0.07
  marker.add(base)

  const tiers = [
    { y: 0.38, height: 0.48, radiusTop: 0.4, radiusBottom: 0.46 },
    { y: 0.82, height: 0.42, radiusTop: 0.34, radiusBottom: 0.4 },
    { y: 1.2, height: 0.38, radiusTop: 0.28, radiusBottom: 0.34 },
    { y: 1.52, height: 0.34, radiusTop: 0.22, radiusBottom: 0.28 },
    { y: 1.8, height: 0.3, radiusTop: 0.16, radiusBottom: 0.22 },
  ]

  tiers.forEach(({ y, height, radiusTop, radiusBottom }) => {
    const segment = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8),
      material
    )
    segment.position.y = y
    marker.add(segment)

    const flare = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusBottom * 1.04, radiusBottom * 1.1, 0.07, 8),
      material
    )
    flare.position.y = y - height / 2 + 0.035
    marker.add(flare)
  })

  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.07, 0.62, 8),
    material
  )
  spire.position.y = 2.18
  marker.add(spire)

  const spireTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.055, 0.22, 8),
    material
  )
  spireTip.position.y = 2.58
  marker.add(spireTip)

  return marker
}

function createHollywoodSignMarker(material: THREE.MeshPhongMaterial): THREE.Group {
  const marker = new THREE.Group()

  const hillLeft = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.45), material)
  hillLeft.position.set(-0.32, 0.06, 0)
  hillLeft.rotation.z = 0.28
  marker.add(hillLeft)

  const hillRight = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.45), material)
  hillRight.position.set(0.32, 0.06, 0)
  hillRight.rotation.z = -0.28
  marker.add(hillRight)

  const hillCenter = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.4), material)
  hillCenter.position.set(0, 0.18, 0)
  marker.add(hillCenter)

  const letters = [
    { x: -0.42, h: 0.38 },
    { x: -0.32, h: 0.34 },
    { x: -0.22, h: 0.36 },
    { x: -0.12, h: 0.36 },
    { x: -0.02, h: 0.4 },
    { x: 0.08, h: 0.42 },
    { x: 0.18, h: 0.34 },
    { x: 0.28, h: 0.34 },
    { x: 0.38, h: 0.36 },
  ]

  letters.forEach(({ x, h }) => {
    const letter = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.04), material)
    letter.position.set(x, 0.12 + h / 2, 0)
    marker.add(letter)
  })

  return marker
}

function isGoldLocation(locationId: string): boolean {
  return locationId === 'bellevue' || locationId === 'upenn' || locationId === 'taipei'
}

function isCopperLocation(locationId: string): boolean {
  return locationId === 'malaysia'
}

function isBronzeLocation(locationId: string): boolean {
  return locationId === 'los-angeles'
}

async function createMarkerForLocation(location: LocationData): Promise<THREE.Object3D> {
  if (location.id === 'bellevue') {
    return createMonopolyHomeMarker(createGoldMaterial())
  }
  if (location.id === 'upenn') {
    const texture = await createGoldCrestTexture('/upenn-crest.png')
    return createUpennCrestMarker(texture)
  }
  if (location.id === 'taipei') {
    return createTaipei101Marker(createGoldMaterial())
  }
  if (location.id === 'madrid') {
    return createMetropolisMarker(createCopperMaterial())
  }
  if (location.id === 'malaysia') {
    return createKlccTwinTowersMarker(createCopperMaterial())
  }
  if (location.id === 'los-angeles') {
    return createHollywoodSignMarker(createBronzeMaterial())
  }
  return createDotMarker(createSilverMaterial())
}

function orientMarkerToGlobe(marker: THREE.Object3D, position: THREE.Vector3) {
  marker.position.copy(position)
  marker.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    position.clone().normalize()
  )
}

function getMarkerFromIntersection(object: THREE.Object3D): THREE.Object3D | null {
  let current: THREE.Object3D | null = object
  while (current) {
    if (current.userData.location) return current
    current = current.parent
  }
  return null
}

function setMarkerColor(marker: THREE.Object3D, color: number) {
  marker.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const { material } = child
      if (material instanceof THREE.MeshPhongMaterial || material instanceof THREE.MeshBasicMaterial) {
        material.color.setHex(color)
      }
    }
  })
}

function getMarkerDefaultColor(marker: THREE.Object3D): number {
  const locationId = (marker.userData.location as LocationData).id
  if (isGoldLocation(locationId)) return 0xffd700
  if (isCopperLocation(locationId)) return 0xb87333
  if (isBronzeLocation(locationId)) return 0xcd7f32
  return 0xc0c0c0
}

function getMarkerHoverColor(marker: THREE.Object3D): number {
  const locationId = (marker.userData.location as LocationData).id
  if (isGoldLocation(locationId)) return 0xfff0a0
  if (isCopperLocation(locationId)) return 0xe8a060
  if (isBronzeLocation(locationId)) return 0xe8a850
  return 0xffd700
}

const MARKER_SIZE_MULTIPLIER = 1.3
const DOT_MARKER_SIZE_MULTIPLIER = 0.56

const CUSTOM_MARKER_IDS = new Set(['bellevue', 'upenn', 'taipei', 'malaysia', 'los-angeles'])

function usesDotMarker(locationId: string): boolean {
  return !CUSTOM_MARKER_IDS.has(locationId)
}

function getMarkerBaseScale(marker: THREE.Object3D): number {
  const locationId = (marker.userData.location as LocationData).id
  let scale = 1
  if (locationId === 'taipei') scale = 1.05
  else if (locationId === 'malaysia') scale = 1.05 * 1.44
  else if (locationId === 'los-angeles') scale = 1.05
  else if (isGoldLocation(locationId)) scale = 1.15
  if (usesDotMarker(locationId)) scale *= DOT_MARKER_SIZE_MULTIPLIER
  return scale * MARKER_SIZE_MULTIPLIER
}

function getMarkerHoverScale(marker: THREE.Object3D): number {
  return getMarkerBaseScale(marker) * 1.4
}

export default function Globe({ onDotClick, onDotHover, activeLocationId, isMobile = false }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const dotsRef = useRef<THREE.Object3D[]>([])
  const ringsRef = useRef<THREE.Mesh[]>([])
  const outerRingsRef = useRef<(THREE.Mesh | null)[]>([])
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const hoveredDotRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const controlsRef = useRef<OrbitControls | null>(null)
  const isAnimatingCameraRef = useRef(false)
  const autoRotatePausedRef = useRef(false)
  const activeLocationIdRef = useRef(activeLocationId)
  const hasDraggedRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const handleDotClick = useCallback((clickedLocations: LocationData[]) => {
    onDotClick(clickedLocations)
  }, [onDotClick])

  useEffect(() => {
    activeLocationIdRef.current = activeLocationId
  }, [activeLocationId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false

    const init = async () => {
      // Scene
      const scene = new THREE.Scene()
      sceneRef.current = scene

      // Camera
      const initialWidth = container.clientWidth || window.innerWidth
      const initialHeight = container.clientHeight || window.innerHeight
      const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 1000)
      camera.position.set(0, 0, 240)
      cameraRef.current = camera

      // Renderer
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(initialWidth, initialHeight)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      renderer.domElement.style.cursor = 'crosshair'
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enablePan = false
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.rotateSpeed = 0.85
      controls.zoomSpeed = 1.1
      controls.minDistance = MIN_ZOOM_DISTANCE
      controls.maxDistance = MAX_ZOOM_DISTANCE
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.45
      controlsRef.current = controls

      controls.addEventListener('start', () => {
        controls.autoRotate = false
      })

      controls.addEventListener('end', () => {
        if (!activeLocationIdRef.current && !isAnimatingCameraRef.current) {
          controls.autoRotate = true
        }
      })

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

      const globeGeometry = new THREE.SphereGeometry(80, 64, 64)
      const globeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x080810,
        specular: 0x999999,
        shininess: 20,
      })

      const globe = new THREE.Mesh(globeGeometry, globeMaterial)
      globeGroup.add(globe)

      try {
        const earthTexture = await createEarthTexture()
        if (disposed) {
          earthTexture.dispose()
          return
        }
        globeMaterial.map = earthTexture
        globeMaterial.needsUpdate = true
      } catch (error) {
        console.error('Failed to load earth texture:', error)
      }

      if (disposed) return

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

    // Location markers
    const dots: THREE.Object3D[] = []
    const rings: THREE.Mesh[] = []
    const outerRings: (THREE.Mesh | null)[] = []

    for (let index = 0; index < getGlobeLocations().length; index++) {
      const location = getGlobeLocations()[index]
      const { lat, lng } = getMarkerCoords(location)
      const pos = latLngToVector3(lat, lng, 82)
      const marker = await createMarkerForLocation(location)

      if (disposed) return

      orientMarkerToGlobe(marker, pos)
      marker.scale.set(0, 0, 0)
      marker.userData = { location, index }
      globeGroup.add(marker)
      dots.push(marker)

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
    }

    dotsRef.current = dots
    ringsRef.current = rings
    outerRingsRef.current = outerRings

    const updatePointerFromClient = (clientX: number, clientY: number) => {
      const canvas = renderer.domElement
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    const trySelectDot = (clientX: number, clientY: number) => {
      updatePointerFromClient(clientX, clientY)

      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(dots, true)

      if (intersects.length > 0) {
        const clickedMarker = getMarkerFromIntersection(intersects[0].object)
        if (!clickedMarker) return

        const location = clickedMarker.userData.location as LocationData
        const { lat, lng } = getMarkerCoords(location)

        autoRotatePausedRef.current = true
        isAnimatingCameraRef.current = true
        controls.enabled = false
        controls.autoRotate = false

        const targetPos = latLngToVector3(lat, lng, 180)

        gsap.to(camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: () => {
            camera.lookAt(0, 0, 0)
            controls.update()
          },
          onComplete: () => {
            isAnimatingCameraRef.current = false
            controls.enabled = true
            controls.update()
          },
        })

        handleDotClick(getLocationsForMarker(location.id))
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (isAnimatingCameraRef.current) return

      hasDraggedRef.current = false
      dragStartRef.current = { x: event.clientX, y: event.clientY }
    }

    const onPointerMove = (event: PointerEvent) => {
      updatePointerFromClient(event.clientX, event.clientY)

      const totalDrag = Math.hypot(
        event.clientX - dragStartRef.current.x,
        event.clientY - dragStartRef.current.y
      )
      if (totalDrag > DRAG_THRESHOLD) {
        hasDraggedRef.current = true
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!hasDraggedRef.current && !isAnimatingCameraRef.current) {
        trySelectDot(event.clientX, event.clientY)
      }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerUp)
    setTimeout(() => {
      dots.forEach((marker, i) => {
        setTimeout(() => {
          const targetScale = getMarkerBaseScale(marker)
          gsap.to(marker.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
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

    // Resize handler
    const onResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)
    window.addEventListener('resize', onResize)

    const hoverSupported = window.matchMedia('(hover: hover)').matches

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

      if (hoverSupported) {
      // Raycasting for hover
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(dots, true)

      if (intersects.length > 0) {
        const hoveredMarker = getMarkerFromIntersection(intersects[0].object)
        if (!hoveredMarker) return

        const index = hoveredMarker.userData.index as number

        if (hoveredDotRef.current !== index) {
          // Reset previous hover
          if (hoveredDotRef.current !== null) {
            const prevIndex = hoveredDotRef.current
            const prevMarker = dots[prevIndex]
            const prevRing = rings[prevIndex]
            const prevOuterRing = outerRings[prevIndex]
            const prevScale = getMarkerBaseScale(prevMarker)

            gsap.to(prevMarker.scale, {
              x: prevScale,
              y: prevScale,
              z: prevScale,
              duration: 0.2,
            })
            setMarkerColor(prevMarker, getMarkerDefaultColor(prevMarker))
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
          const marker = dots[index]
          const ring = rings[index]
          const hoverScale = getMarkerHoverScale(marker)

          gsap.to(marker.scale, {
            x: hoverScale,
            y: hoverScale,
            z: hoverScale,
            duration: 0.2,
          })
          setMarkerColor(marker, getMarkerHoverColor(marker))
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
          outerRing.position.copy(marker.position)
          outerRing.scale.set(0, 0, 0)
          globeGroup.add(outerRing)
          outerRings[index] = outerRing

          gsap.to(outerRing.scale, { x: 1, y: 1, z: 1, duration: 0.3 })

          onDotHover(hoveredMarker.userData.location as LocationData)
        }
      } else {
        if (hoveredDotRef.current !== null) {
          const prevIndex = hoveredDotRef.current
          const prevMarker = dots[prevIndex]
          const prevRing = rings[prevIndex]
          const prevOuterRing = outerRings[prevIndex]
          const prevScale = getMarkerBaseScale(prevMarker)

          gsap.to(prevMarker.scale, {
            x: prevScale,
            y: prevScale,
            z: prevScale,
            duration: 0.2,
          })
          setMarkerColor(prevMarker, getMarkerDefaultColor(prevMarker))
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
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(rafRef.current)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      resizeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      controls.dispose()
      controlsRef.current = null
      renderer.dispose()
      globeGeometry.dispose()
      globeMaterial.dispose()
      if (globeMaterial.map) globeMaterial.map.dispose()
      atmosphereGeo.dispose()
      atmosphereMat.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
    }

    let cleanup: (() => void) | undefined
    void init().then((fn) => {
      cleanup = fn
    })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [handleDotClick, onDotHover])

  // Resume auto-rotate when card closes
  useEffect(() => {
    if (!activeLocationId && controlsRef.current) {
      autoRotatePausedRef.current = false
      controlsRef.current.autoRotate = true
    } else if (activeLocationId && controlsRef.current) {
      controlsRef.current.autoRotate = false
    }
  }, [activeLocationId])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        cursor: isMobile ? 'default' : 'crosshair',
        touchAction: 'none',
      }}
    />
  )
}
