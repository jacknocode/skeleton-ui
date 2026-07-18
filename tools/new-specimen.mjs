#!/usr/bin/env node
/* 標本の雛形生成: pnpm new <id>
   src/specimens/<id>/ に index.tsx と style.css を作り、
   registry.ts / ideas.ts へ追記すべき内容を案内する */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const id = process.argv[2]
if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error('使い方: pnpm new <id>   (idは英小文字・数字・ハイフン。例: boss-banner)')
  process.exit(1)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'src', 'specimens', id)
if (existsSync(dir)) {
  console.error(`すでに存在します: src/specimens/${id}/`)
  process.exit(1)
}

/* クラスプレフィックスとコンポーネント名を id から作る */
const pascal = id.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase())

const tsx = `import { useState } from 'react'
import './style.css'

/** TODO: どう動く標本かを一行で */
export default function ${pascal}() {
  const [active, setActive] = useState(false)
  return (
    <button className={\`mz-${id}\${active ? ' is-active' : ''}\`} onClick={() => setActive((a) => !a)}>
      ${id}
    </button>
  )
}
`

const css = `.mz-${id} {
  padding: 12px 24px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-size: 13px;
  font-weight: 800;
  color: #5c5c5c;
  cursor: pointer;
}

/* 基本のぷるん: cubic-bezier(0.34, 1.56, 0.64, 1) */
.mz-${id}.is-active {
  animation: mz-${id}-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes mz-${id}-pop {
  30% {
    transform: scale(1.2, 0.8);
  }
  60% {
    transform: scale(0.9, 1.1);
  }
  100% {
    transform: none;
  }
}
`

mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, 'index.tsx'), tsx)
writeFileSync(join(dir, 'style.css'), css)

console.log(`✔ src/specimens/${id}/ を作成しました

次にやること:
  1. src/specimens/${id}/ で動きを実装（クラスは mz-${id}-* プレフィックス）
  2. src/registry.ts の specimens 配列にメタデータを追記:
       { id: '${id}', no: <次の番号>, nameJa: '…', nameEn: '…', category: '…',
         trigger: '…', principles: […], ecology: '…', Component: ${pascal} }
  3. src/ideas.ts の該当エントリを status: 'captured', specimenId: '${id}' に更新
     （台帳に無い思いつきなら、まず ideas.ts に追記してから）
`)
