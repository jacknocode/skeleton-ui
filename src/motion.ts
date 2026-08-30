/**
 * モーションプリセット — 同じUIのまま「緩急の数値」だけを差し替える。
 *
 * 図鑑全体で使われる看板カーブは3系統に集約されている:
 *   --mz-ease-spring … ぷるんと跳ねる（overshoot あり）。図鑑の看板
 *   --mz-ease-glide  … 長い減速。ふわっと置きにいく
 *   --mz-ease-swift  … 標準の減速。実務的な出入り
 *
 * 各標本の style.css は var(--mz-ease-*, 従来値) で参照しているため、
 * 変数が無ければ従来どおり動く（標本フォルダ単体の持ち出しも今まで通り）。
 * プリセットはこの3変数を document.documentElement に上書きするだけで、
 * DOM・レイアウト・色には一切触らない。
 *
 * 注意: 各標本の index.tsx にハードコードされた EASE（「この回の約束:
 * 減速のみ」等）は標本固有の設計意図なので、プリセットでは差し替えない。
 */

export type EaseTokens = {
  spring: string
  glide: string
  swift: string
}

export type MotionPreset = {
  id: string
  label: string
  /** ひとことで言うとどんな手触りか */
  feel: string
  tokens: EaseTokens
}

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'standard',
    label: '標準',
    feel: '図鑑の従来値。元気に跳ねる',
    tokens: {
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      glide: 'cubic-bezier(0.22, 1, 0.36, 1)',
      swift: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    },
  },
  {
    id: 'shittori',
    label: 'しっとり',
    feel: '跳ねを抑えて長く減速する、上品な置き方',
    tokens: {
      spring: 'cubic-bezier(0.30, 1.12, 0.30, 1)',
      glide: 'cubic-bezier(0.16, 1, 0.30, 1)',
      swift: 'cubic-bezier(0.32, 0.72, 0, 1)',
    },
  },
  {
    id: 'kibikibi',
    label: 'きびきび',
    feel: '立ち上がりが速く、すっと止まる',
    tokens: {
      spring: 'cubic-bezier(0.18, 1.25, 0.40, 1)',
      glide: 'cubic-bezier(0.20, 0, 0, 1)',
      swift: 'cubic-bezier(0.30, 0, 0.15, 1)',
    },
  },
  {
    id: 'purupuru',
    label: 'ぷるぷる',
    feel: '跳ね返りを強めた、おもちゃ寄りの弾み',
    tokens: {
      spring: 'cubic-bezier(0.34, 1.85, 0.64, 1)',
      glide: 'cubic-bezier(0.34, 1.35, 0.64, 1)',
      swift: 'cubic-bezier(0.34, 1.20, 0.64, 1)',
    },
  },
]

export function applyMotionPreset(preset: MotionPreset) {
  const root = document.documentElement
  root.style.setProperty('--mz-ease-spring', preset.tokens.spring)
  root.style.setProperty('--mz-ease-glide', preset.tokens.glide)
  root.style.setProperty('--mz-ease-swift', preset.tokens.swift)
  root.dataset.motion = preset.id
}
