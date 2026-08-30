/**
 * モーションプリセット — 同じUIのまま「緩急の数値」だけを差し替える。
 *
 * 図鑑全体で使われる看板カーブは3系統に集約されている:
 *   spring … ぷるんと跳ねる cubic-bezier(0.34, 1.56, 0.64, 1)。図鑑の看板
 *   glide  … 長い減速     cubic-bezier(0.22, 1, 0.36, 1)
 *   swift  … 標準の減速   cubic-bezier(0.22, 0.61, 0.36, 1)
 *
 * 大元（各標本の index.tsx / style.css）には一切手を入れない。
 * プリセットの適用は実行時に CSSOM を走査し、上記リテラルを含む宣言だけを
 * 書き換える。原文は初回にキャッシュするので「標準」でいつでも完全復元できる。
 * CSS 変数を使わずリテラル値のまま差し替えるため、@keyframes 内の
 * animation-timing-function でもブラウザ差なしに効く。
 *
 * 注意: 各標本の index.tsx にハードコードされた EASE（「この回の約束:
 * 減速のみ」等）は標本固有の設計意図なので、差し替え対象外。
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
    feel: '図鑑の元の値。元気に跳ねる',
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
      spring: 'cubic-bezier(0.3, 1.12, 0.3, 1)',
      glide: 'cubic-bezier(0.16, 1, 0.3, 1)',
      swift: 'cubic-bezier(0.32, 0.72, 0, 1)',
    },
  },
  {
    id: 'kibikibi',
    label: 'きびきび',
    feel: '立ち上がりが速く、すっと止まる',
    tokens: {
      spring: 'cubic-bezier(0.18, 1.25, 0.4, 1)',
      glide: 'cubic-bezier(0.2, 0, 0, 1)',
      swift: 'cubic-bezier(0.3, 0, 0.15, 1)',
    },
  },
  {
    id: 'purupuru',
    label: 'ぷるぷる',
    feel: '跳ね返りを強めた、おもちゃ寄りの弾み',
    tokens: {
      spring: 'cubic-bezier(0.34, 1.85, 0.64, 1)',
      glide: 'cubic-bezier(0.34, 1.35, 0.64, 1)',
      swift: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
    },
  },
]

/* 数値間の空白の有無（0.34,1.56 / 0.34, 1.56）を許容してリテラルを拾う */
const TOKEN_MATCHERS: { key: keyof EaseTokens; re: RegExp }[] = [
  { key: 'spring', re: bezierRe([0.34, 1.56, 0.64, 1]) },
  { key: 'glide', re: bezierRe([0.22, 1, 0.36, 1]) },
  { key: 'swift', re: bezierRe([0.22, 0.61, 0.36, 1]) },
]

function bezierRe(nums: number[]): RegExp {
  const parts = nums.map((n) => String(n).replace('.', '\\.')).join('\\s*,\\s*')
  return new RegExp(`cubic-bezier\\(\\s*${parts}\\s*\\)`, 'g')
}

/** 看板カーブを含む宣言と、その原文（初回スナップショット） */
type Patchable = { style: CSSStyleDeclaration; original: string }
let patchables: Patchable[] | null = null

function collect(): Patchable[] {
  const found: Patchable[] = []
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      const style =
        rule instanceof CSSStyleRule || rule instanceof CSSKeyframeRule ? rule.style : null
      if (style) {
        const text = style.cssText
        const hits = TOKEN_MATCHERS.some((m) => {
          m.re.lastIndex = 0
          return m.re.test(text)
        })
        if (hits) found.push({ style, original: text })
      }
      // @media / @supports / @keyframes などの入れ子を辿る
      const inner = (rule as CSSGroupingRule | CSSKeyframesRule).cssRules
      if (inner) visit(inner)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      /* 触れないシート（クロスオリジン等）は対象外 */
    }
  }
  return found
}

export function applyMotionPreset(preset: MotionPreset) {
  const isStandard = preset.id === 'standard'
  if (isStandard && !patchables) {
    // 初期状態（標準）ではCSSに一切触らない
    document.documentElement.dataset.motion = preset.id
    return
  }
  patchables ??= collect()
  for (const { style, original } of patchables) {
    let text = original
    if (!isStandard) {
      for (const { key, re } of TOKEN_MATCHERS) {
        re.lastIndex = 0
        text = text.replace(re, preset.tokens[key])
      }
    }
    style.cssText = text
  }
  document.documentElement.dataset.motion = preset.id
}
