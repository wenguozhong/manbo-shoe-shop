import { useEffect, useLayoutEffect, useState } from 'react'
import {
  Box3,
  BufferGeometry,
  Color,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  Texture,
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { partIds, type PartId, type ShoeConfig } from '../domain/config'
import ShoeModel from './ShoeModel'
import { useSideArtwork } from './appearance'

type Definition = {
  id: 'court-01'
  source: 'glb' | 'procedural'
  url?: string
  partMap: Record<PartId, string[]>
}
interface Loaded {
  root: Group
  mapped: Map<Mesh, PartId>
  meshes: Mesh[]
  dispose: () => void
}
type Report = (message: string, missing: PartId[]) => void
function prepare(source: Group, map: Definition['partMap']): Loaded {
  const mapped = new Map<Mesh, PartId>(),
    materials = new Set<Material>(),
    textures = new Set<Texture>(),
    geometries = new Set<BufferGeometry>()
  const root = new Group(),
    meshes: Mesh[] = []
  source.traverse((obj) => {
    if (!(obj instanceof Mesh)) return
    meshes.push(obj)
    const originals: Material[] = Array.isArray(obj.material) ? obj.material : [obj.material]
    const id = partIds.find((part) => map[part]?.includes(obj.name))
    const clones = originals.map((m) => {
      materials.add(m)
      for (const v of Object.values(m)) if (v instanceof Texture) textures.add(v)
      const clone =
        m instanceof MeshStandardMaterial
          ? m.clone()
          : new MeshStandardMaterial({ color: 'color' in m ? (m.color as Color) : '#ffffff' })
      materials.add(clone)
      return clone
    })
    obj.material = Array.isArray(obj.material) ? clones : clones[0]
    geometries.add(obj.geometry)
    if (id) mapped.set(obj, id)
  })
  const box = new Box3().setFromObject(source),
    size = box.getSize(new Vector3()),
    center = box.getCenter(new Vector3())
  const dispose = () => {
    materials.forEach((m) => m.dispose())
    textures.forEach((t) => {
      t.dispose()
      if (typeof ImageBitmap !== 'undefined' && t.image instanceof ImageBitmap) t.image.close()
    })
    geometries.forEach((g) => g.dispose())
  }
  if (!Number.isFinite(size.x) || size.x < 0.00001 || mapped.size === 0) {
    dispose()
    throw new Error('模型尺寸或部件映射无效')
  }
  const factor = 3.6 / size.x
  const frame = new Group()
  frame.add(source)
  frame.scale.setScalar(factor)
  frame.position.set(-center.x * factor, -box.min.y * factor, -center.z * factor)
  root.add(frame)
  return { root, mapped, meshes, dispose }
}
const rough = { matte: 0.92, leather: 0.49, suede: 0.98, synthetic: 0.28 }
type ModelProps = { config: ShoeConfig; selected: PartId | null; onSelect?: (p: PartId) => void }

function LicensedModel({ asset, config, selected, onSelect }: { asset: Loaded } & ModelProps) {
  const invalidate = useThree((s) => s.invalidate),
    art = useSideArtwork(config)
  useLayoutEffect(() => {
    asset.root.scale.set(
      1,
      config.silhouette === 'bold-low' ? 1.12 : 1,
      config.silhouette === 'bold-low' ? 1.08 : 1,
    )
    for (const mesh of asset.meshes) {
      const part = asset.mapped.get(mesh)
      const tag = mesh.userData as {
        laceType?: string
        tongueScript?: string
        artworkPlacement?: 'outer' | 'inner'
      }
      mesh.visible =
        (!tag.laceType || tag.laceType === config.laceType) &&
        (!tag.tongueScript || tag.tongueScript === config.tongueScript)
      if (tag.artworkPlacement)
        mesh.visible =
          mesh.visible && (config.placement === 'both' || config.placement === tag.artworkPlacement)
      const materials = (
        Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      ) as MeshStandardMaterial[]
      for (const mat of materials) {
        if (part) {
          mat.color.set(config.parts[part].color)
          mat.roughness = rough[config.parts[part].material]
          mat.emissive.set(part === selected ? '#112040' : '#000000')
        }
        if (tag.artworkPlacement) {
          mat.color.set('#ffffff')
          mat.map = art
          mat.transparent = true
          mat.depthWrite = false
          mat.alphaTest = 0.04
          mat.bumpMap = config.advanced && config.craft === 'embroidery' ? art : null
          mat.bumpScale = 0.012
          mat.needsUpdate = true
        }
      }
    }
    invalidate()
  }, [asset, config, selected, invalidate, art])
  function click(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    const id = asset.mapped.get(e.object as Mesh)
    if (id && e.delta < 4) onSelect?.(id)
  }
  return <primitive object={asset.root} dispose={null} onClick={click} />
}
export default function ModelAdapter({
  config,
  selected,
  onSelect,
  onReport,
}: {
  config: ShoeConfig
  selected: PartId | null
  onSelect?: (p: PartId) => void
  onReport: Report
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  useEffect(() => {
    let active = true,
      asset: Loaded | null = null
    const controller = new AbortController()
    async function load() {
      const manifest = await fetch('/court-model.json', { signal: controller.signal })
      if (!manifest.ok) throw new Error('manifest')
      const def: Definition = await manifest.json()
      if (def.id !== 'court-01') throw new Error('model')
      if (def.source === 'procedural') return
      if (def.source !== 'glb' || !def.url || !def.partMap) throw new Error('source')
      const url = new URL(def.url, location.origin)
      if (url.origin !== location.origin) throw new Error('origin')
      const file = await fetch(url, { signal: controller.signal })
      if (!file.ok) throw new Error('file')
      const glb = await new GLTFLoader().parseAsync(await file.arrayBuffer(), new URL('.', url).href)
      asset = prepare(glb.scene, def.partMap)
      if (!active) {
        asset.dispose()
        asset = null
        return
      }
      const missing = partIds.filter((id) => ![...asset!.mapped.values()].includes(id))
      onReport(missing.length ? '部分网格未映射，对应部件不可编辑。' : '', missing)
      setLoaded(asset)
    }
    load().catch(() => {
      if (active) onReport('外部模型未能载入，已切换至原创低帮鞋。', [])
    })
    return () => {
      active = false
      controller.abort()
      asset?.dispose()
    }
  }, [onReport])
  return loaded ? (
    <LicensedModel asset={loaded} config={config} selected={selected} onSelect={onSelect} />
  ) : (
    <ShoeModel config={config} selected={selected} onSelect={onSelect} />
  )
}
