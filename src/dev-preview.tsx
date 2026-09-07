/* 開発中の標本を registry に配線する前に単体で見るための足場。
   PR には載せない（企画側がコミット前に消す）。 */
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'

const mods = import.meta.glob('./specimens/*/index.tsx')
const id = new URLSearchParams(location.search).get('id') ?? ''
const key = `./specimens/${id}/index.tsx`
const loader = mods[key] as (() => Promise<{ default: React.ComponentType }>) | undefined

function Stage() {
  if (!loader) return <p style={{ padding: 24 }}>not found: {id}</p>
  const Component = lazy(loader)
  return (
    <div
      style={{
        width: 560,
        height: 360,
        margin: '0 auto',
        background: '#eaeae8',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Stage />
  </StrictMode>,
)
