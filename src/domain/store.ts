import { create } from 'zustand'
import { z } from 'zod'
import { configSchema, createConfig, type ShoeConfig } from './config'

const parts = { config: 'idc:config:v1', bag: 'idc:bag:v1', designs: 'idc:designs:v1' } as const
const itemSchema = z.object({
  id: z.string().min(1).max(100),
  config: configSchema,
  preview: z
    .string()
    .max(100000)
    .regex(/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/)
    .nullable(),
})
const bagSchema = itemSchema.extend({ qty: z.number().int().min(1).max(99) })
export type BagItem = z.infer<typeof bagSchema>
export type Design = z.infer<typeof itemSchema>
function read<T>(key: string, schema: z.ZodType<T>, fallback: T) {
  try {
    const result = schema.safeParse(JSON.parse(localStorage.getItem(key) || 'null'))
    return result.success ? result.data : fallback
  } catch {
    return fallback
  }
}
const readBag = () => read(parts.bag, z.array(bagSchema), [])
const readDesigns = () => read(parts.designs, z.array(itemSchema), [])
const uniqueId = () =>
  crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
type Toast = { id: number; text: string }
interface Shop {
  config: ShoeConfig
  bag: BagItem[]
  designs: Design[]
  toast: Toast | null
  notify: (text: string) => void
  configure: (config: ShoeConfig) => void
  putBag: (config: ShoeConfig, preview: string | null, id?: string) => boolean
  quantity: (id: string, delta: number) => void
  removeBag: (id: string) => void
  saveDesign: (config: ShoeConfig, preview: string | null) => void
  deleteDesign: (id: string) => void
  refreshLists: () => void
}
export const useShop = create<Shop>((set, get) => {
  function persist(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      get().notify('Browser storage is full or unavailable. Export your design as JSON to keep a copy.')
      return false
    }
  }
  function updateBag(items: BagItem[]) {
    if (!persist(parts.bag, items)) return false
    set({ bag: items })
    return true
  }
  return {
    config: read(parts.config, configSchema, createConfig()),
    bag: readBag(),
    designs: readDesigns(),
    toast: null,
    notify: (text) => set({ toast: { id: (get().toast?.id ?? 0) + 1, text } }),
    configure: (config) => {
      const next = { ...config, updatedAt: new Date().toISOString() }
      set({ config: next })
      persist(parts.config, next)
    },
    putBag: (config, preview, id) => {
      const items = readBag(),
        snapshot = structuredClone(config)
      if (id && !items.some((item) => item.id === id)) {
        get().notify('This design was removed from your bag. Add it again to keep it there.')
        return false
      }
      const next = id
        ? items.map((x) => (x.id === id ? { ...x, config: snapshot, preview } : x))
        : [...items, { id: uniqueId(), config: snapshot, qty: 1, preview }]
      if (!updateBag(next)) return false
      get().notify(id ? 'Design updated in your bag.' : 'Added to your demo bag.')
      return true
    },
    quantity: (id, delta) => {
      updateBag(
        readBag().map((x) =>
          x.id === id ? { ...x, qty: Math.max(1, Math.min(99, x.qty + delta)) } : x,
        ),
      )
    },
    removeBag: (id) => {
      if (updateBag(readBag().filter((x) => x.id !== id))) get().notify('Design removed from your bag.')
    },
    saveDesign: (config, preview) => {
      const next = [{ id: uniqueId(), config: structuredClone(config), preview }, ...readDesigns()]
      if (persist(parts.designs, next)) {
        set({ designs: next })
        get().notify('Saved to My Designs.')
      }
    },
    deleteDesign: (id) => {
      const designs = readDesigns().filter((x) => x.id !== id)
      if (persist(parts.designs, designs)) set({ designs })
    },
    refreshLists: () => set({ bag: readBag(), designs: readDesigns() }),
  }
})
if (typeof window !== 'undefined')
  window.addEventListener('storage', (event) => {
    if (!event.key || event.key === parts.bag || event.key === parts.designs)
      useShop.getState().refreshLists()
  })
