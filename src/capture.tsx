/* 収録専用ページ（PR に載せる GIF を撮るための足場。図鑑本体からは参照されない） */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { specimens } from './registry'
import './styles/global.css'

const id = new URLSearchParams(location.search).get('id') ?? ''
const found = specimens.find((s) => s.id === id)

function Stage() {
  if (!found) return <p style={{ padding: 24 }}>not found: {id}</p>
  const { Component } = found
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
      <Component />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Stage />
  </StrictMode>,
)
