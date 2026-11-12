import { z } from 'zod'

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
export const colorways = ['origin', 'volt', 'shadow'] as const
export const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44'] as const
export const hex = z.string().regex(/^#[0-9a-f]{6}$/i)
export type PartId = (typeof partIds)[number]
export type MaterialId = (typeof materialIds)[number]
export type Colorway = (typeof colorways)[number]
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
  colorway: z.enum(colorways),
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
export const palette: Record<Colorway, string[]> = {
  origin: ['#EBE8DF', '#E2DFD3', '#252828', '#EDEAE1', '#F8F6EE', '#E9E6DC', '#938D7D', '#C7C3B6'],
  volt: ['#1533E8', '#1C37BE', '#132877', '#E6E9F3', '#182778', '#EFEFE8', '#222F58', '#A9BAF4'],
  shadow: ['#2C3034', '#222529', '#161A1D', '#36393D', '#202124', '#C8C9C6', '#555A5E', '#41519E'],
}
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
    partIds.map((id, i) => [id, { color: palette[variant][i], material: defaultMaterials[i] }]),
  ) as ShoeConfig['parts']
}
export function createConfig(colorway: Colorway = 'origin'): ShoeConfig {
  return {
    schemaVersion: 1,
    model: 'court-01',
    silhouette: 'classic-low',
    colorway,
    parts: variantParts(colorway),
    laceType: 'flat',
    sideText: '',
    textFont: 'grotesk',
    textColor: colorway === 'shadow' ? '#F4F3EE' : '#141720',
    graphic: 'none',
    graphicColor: '#1533E8',
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
  return colorways.find((c) => c === value)
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
    c.colorway.toUpperCase(),
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
