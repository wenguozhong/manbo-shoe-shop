import { z } from 'zod'
import { defaultStyle, readStyle, styleCatalog, styleIds, styleName, type StyleId } from './styles'

export const partIds = [
  'upper',
  'toe',
  'heel',
  'tongue',
  'laces',
  'midsole',
  'outsole',
  'accent',
] as const
export const materialIds = ['matte', 'leather', 'suede', 'synthetic'] as const
export const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44'] as const
export const hex = z.string().regex(/^#[0-9a-f]{6}$/i)
export type PartId = (typeof partIds)[number]
export type MaterialId = (typeof materialIds)[number]
export type Colorway = StyleId
export const partLabels: Record<PartId, string> = {
  upper: 'Upper',
  toe: 'Toe',
  heel: 'Heel',
  tongue: 'Tongue',
  laces: 'Laces',
  midsole: 'Midsole',
  outsole: 'Outsole',
  accent: 'Side panel',
}
export const materialLabels: Record<MaterialId, string> = {
  matte: 'Matte fabric',
  leather: 'Smooth leather',
  suede: 'Suede',
  synthetic: 'Synthetic',
}
export const maxJsonBytes = 1024 * 1024
export const maxArtworkBytes = 5 * 1024 * 1024
export const partSchema = z.object({ color: hex, material: z.enum(materialIds) })
export const configSchema = z.object({
  schemaVersion: z.literal(1),
  model: z.literal('court-01'),
  silhouette: z.enum(['classic-low', 'bold-low']),
  colorway: z.preprocess((value) => readStyle(value) ?? value, z.enum(styleIds)),
  parts: z.record(z.enum(partIds), partSchema),
  laceType: z.enum(['flat', 'rope', 'contrast']),
  sideText: z.string().regex(/^[\p{L}\p{N} ]{0,14}$/u),
  textFont: z.enum(['grotesk', 'condensed', 'script']),
  textColor: hex,
  graphic: z.enum(['none', 'stripe', 'wave', 'star', 'motion']),
  graphicColor: hex,
  placement: z.enum(['outer', 'inner', 'both']),
  tongueScript: z.enum(['none', 'script-a', 'script-b']),
  advanced: z.boolean(),
  craft: z.enum(['print', 'embroidery']),
  artwork: z
    .object({
      name: z.string().min(1).max(100),
      dataUrl: z
        .string()
        .max(240000)
        .regex(/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/),
    })
    .nullable(),
  artworkTransform: z.object({
    x: z.number().min(-1).max(1),
    y: z.number().min(-1).max(1),
    scale: z.number().min(0.35).max(2),
  }),
  size: z.enum(sizes),
  updatedAt: z.iso.datetime(),
})
export type ShoeConfig = z.infer<typeof configSchema>
const defaultMaterials: MaterialId[] = [
  'leather',
  'suede',
  'leather',
  'matte',
  'matte',
  'matte',
  'synthetic',
  'synthetic',
]
export function variantParts(variant: Colorway): ShoeConfig['parts'] {
  return Object.fromEntries(
    partIds.map((id, i) => [
      id,
      { color: styleCatalog[variant].colors[i], material: defaultMaterials[i] },
    ]),
  ) as ShoeConfig['parts']
}
export function createConfig(colorway: Colorway = defaultStyle): ShoeConfig {
  return {
    schemaVersion: 1,
    model: 'court-01',
    silhouette: 'classic-low',
    colorway,
    parts: variantParts(colorway),
    laceType: 'flat',
    sideText: '',
    textFont: 'grotesk',
    textColor: '#26312D',
    graphic: 'none',
    graphicColor: styleCatalog[colorway].colors[7],
    placement: 'outer',
    tongueScript: 'none',
    advanced: false,
    craft: 'print',
    artwork: null,
    artworkTransform: { x: 0, y: 0, scale: 1 },
    size: '40',
    updatedAt: new Date().toISOString(),
  }
}
export function readColor(value: string | null): Colorway | undefined {
  return readStyle(value)
}
export function cleanSideText(value: string) {
  return Array.from(value.replace(/[^\p{L}\p{N} ]/gu, ''))
    .slice(0, 14)
    .join('')
}
export function configSummary(c: ShoeConfig) {
  return [
    'IDC COURT 01',
    c.silhouette.toUpperCase().replace('-', ' '),
    styleName(c.colorway),
    'EU ' + c.size,
    c.laceType.toUpperCase(),
    c.sideText,
    c.graphic === 'none' ? '' : c.graphic.toUpperCase(),
    c.advanced ? c.craft.toUpperCase() : 'STANDARD',
  ]
    .filter(Boolean)
    .join(' / ')
}
export function parseConfig(text: string) {
  if (new Blob([text]).size > maxJsonBytes) throw new Error('The JSON file exceeds the 1 MB limit.')
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('This file does not contain valid JSON.')
  }
  const parsed = configSchema.safeParse(value)
  if (!parsed.success)
    throw new Error('Incompatible design file. Import a complete IDC COURT 01 v1 configuration.')
  return parsed.data
}
