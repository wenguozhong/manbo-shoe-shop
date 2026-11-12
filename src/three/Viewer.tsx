import {
  Component,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { CanvasTexture, Vector3, type PerspectiveCamera, type Scene, type WebGLRenderer } from 'three'
import { RotateCcw } from 'lucide-react'
import type { PartId, ShoeConfig } from '../domain/config'
import { productImage } from '../data/content'
import { styleName } from '../domain/styles'
import ModelAdapter from './GlbModel'

export const views = ['default', 'side', 'inner', 'top', 'heel', 'sole', 'tongue', 'inside'] as const
export type View = (typeof views)[number]
const directions: Record<View, [number, number, number]> = {
  default: [2.17, 2.07, -5.85],
  side: [0, 0.18, -5],
  inner: [0, 0.18, 5],
  top: [0, 5, -0.01],
  heel: [-5, 0.58, -0.02],
  sole: [0, -5, -0.01],
  tongue: [2.1, 4.3, 0.1],
  inside: [-3.3, 4.8, -0.5],
}
type Painting = { gl: WebGLRenderer; scene: Scene; camera: PerspectiveCamera }
export interface ViewerApi {
  capture: (type: 'png' | 'thumbnail' | 'catalog') => string | null
}
interface ViewerProps {
  config: ShoeConfig
  selected?: PartId | null
  onSelect?: (p: PartId | null) => void
  onMissing?: (missing: PartId[]) => void
  view?: View
  revision?: number
  interactive?: boolean
}
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
function ContactShadow() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!,
      grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 62)
    grad.addColorStop(0, 'rgba(23,25,31,.42)')
    grad.addColorStop(0.48, 'rgba(36,39,41,.24)')
    grad.addColorStop(1, 'rgba(48,50,50,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
    return new CanvasTexture(canvas)
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={[0, -0.023, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.7, 1.9]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}
const center = new Vector3(0, 0.68, 0)
function CameraRig({
  view,
  revision,
  interactive,
  external,
  onPaint,
  onLost,
}: {
  view: View
  revision: number
  interactive: boolean
  external: boolean
  onPaint: (p: Painting) => void
  onLost: () => void
}) {
  const { camera, gl, scene, invalidate, size } = useThree(),
    target = useRef<Vector3 | null>(null),
    first = useRef(true)
  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera
    const vertical = Math.tan((cam.fov * Math.PI) / 360)
    const distance = Math.max(
      1.26 / vertical,
      2.22 / (vertical * Math.max(0.2, size.width / size.height)),
    )
    const v = new Vector3(...directions[view])
    if (external) v.z *= -1 // Imported Court 01 assets use +Z for the outer quarter.
    v.normalize().multiplyScalar(distance).add(center)
    if (first.current || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera.position.copy(v)
      camera.lookAt(center)
      target.current = null
    } else target.current = v
    first.current = false
    invalidate()
  }, [view, revision, camera, invalidate, size.width, size.height, external])
  useFrame((_, dt) => {
    if (target.current) {
      camera.position.lerp(target.current, 1 - Math.exp(-Math.min(dt, 0.12) * 13))
      camera.lookAt(center)
      if (camera.position.distanceTo(target.current) < 0.005) {
        camera.position.copy(target.current)
        target.current = null
      }
      invalidate()
    }
  })
  useEffect(() => {
    const dom = gl.domElement
    const lose = (e: Event) => {
      e.preventDefault()
      onLost()
    }
    dom.addEventListener('webglcontextlost', lose)
    const frame = requestAnimationFrame(() => {
      gl.render(scene, camera)
      onPaint({ gl, scene, camera: camera as PerspectiveCamera })
    })
    return () => {
      cancelAnimationFrame(frame)
      dom.removeEventListener('webglcontextlost', lose)
    }
  }, [gl, scene, camera, onPaint, onLost])
  return (
    <OrbitControls
      target={center}
      enablePan={false}
      enabled={interactive}
      minDistance={2.1}
      maxDistance={14}
      enableDamping={true}
      dampingFactor={0.14}
      onStart={() => {
        target.current = null
      }}
    />
  )
}
const Viewer = forwardRef<ViewerApi, ViewerProps>(function Viewer(
  { config, selected = null, onSelect, onMissing, view = 'default', revision = 0, interactive = true },
  ref,
) {
  const [lost, setLost] = useState(false),
    [generation, setGeneration] = useState(0),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(''),
    [external, setExternal] = useState(false)
  const painting = useRef<Painting | null>(null)
  const onPaint = useCallback((p: Painting) => {
    painting.current = p
    setReady(true)
  }, [])
  const onLost = useCallback(() => {
    painting.current = null
    setReady(false)
    setExternal(false)
    setMessage('')
    setLost(true)
  }, [])
  const report = useCallback(
    (message: string, missing: PartId[], isExternal = false) => {
      setMessage(message)
      setExternal(isExternal)
      onMissing?.(missing)
    },
    [onMissing],
  )
  useImperativeHandle(
    ref,
    () => ({
      capture(type) {
        const p = painting.current
        if (!p || p.gl.getContext().isContextLost()) return null
        try {
          p.gl.render(p.scene, p.camera)
          const src = p.gl.domElement
          if (src.width < 2 || src.height < 2) return null
          if (type === 'png') return src.toDataURL('image/png')
          if (type === 'catalog') return src.toDataURL('image/webp', 0.92)
          const thumb = document.createElement('canvas')
          thumb.width = 272
          thumb.height = Math.round((272 * src.height) / src.width)
          const ctx = thumb.getContext('2d')
          if (!ctx) return null
          ctx.drawImage(src, 0, 0, thumb.width, thumb.height)
          return thumb.toDataURL('image/webp', 0.77)
        } catch {
          return null
        }
      },
    }),
    [],
  )
  const fallback = (
    <div className="viewer-fallback">
      <img
        src={productImage(config.colorway)}
        alt={'2D preview of ' + styleName(config.colorway)}
      />
      <div>
        <b>2D colorway preview</b>
        <span>
          The 3D preview is unavailable on this device. You can still edit, save and export your design.
        </span>
        <button
          onClick={() => {
            setReady(false)
            setLost(false)
            setGeneration((x) => x + 1)
          }}
        >
          <RotateCcw size={13} /> Retry 3D
        </button>
      </div>
    </div>
  )
  return (
    <div
      className="viewer"
      data-ready={ready && !lost ? 'true' : 'false'}
      aria-label="3D sneaker preview"
      data-view={view}
    >
      {lost ? (
        fallback
      ) : (
        <SceneBoundary key={generation} fallback={fallback}>
          <Canvas
            frameloop="demand"
            shadows="soft"
            dpr={[1, 1.6]}
            camera={{ position: [1.4, 1.9, -5.9], fov: 34, near: 0.1, far: 60 }}
            gl={{
              antialias: true,
              alpha: false,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance',
            }}
            fallback={fallback}
            onPointerMissed={(e) => {
              if (e.type === 'click') onSelect?.(null)
            }}
          >
            <color attach="background" args={['#f0f0ed']} />
            <hemisphereLight args={['#fffdf9', '#aca698', 1.30]} />
            <directionalLight
              position={[2.5, 5.8, -4.25]}
              intensity={2.1}
              castShadow
              shadow-mapSize={[1024,1024]}
              shadow-camera-left={-2.45}
              shadow-camera-right={2.45}
              shadow-camera-top={2.1}
              shadow-camera-bottom={-1.35}
              shadow-camera-near={0.5}
              shadow-camera-far={12}
              shadow-normalBias={0.012}
              shadow-bias={-0.0002}
            />
            <directionalLight position={[-3.8, 3.4, 2.7]} intensity={1.03} color="#f1f4ff" />
            <ContactShadow />
            <ModelAdapter config={config} selected={selected} onSelect={onSelect} onReport={report} />
            <CameraRig
              view={view}
              revision={revision}
              interactive={interactive}
              external={external}
              onPaint={onPaint}
              onLost={onLost}
            />
          </Canvas>
        </SceneBoundary>
      )}
      {message && (
        <span className="model-note" role="status">
          {message}
        </span>
      )}
    </div>
  )
})
export default Viewer
