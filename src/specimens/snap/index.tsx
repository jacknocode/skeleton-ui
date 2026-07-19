import { useRef, useState } from 'react'
import './style.css'

const NEAR = 48 // この距離までスロットに近づくと磁力が働く
const SUCTION = 0.45 // 磁力の強さ（残り距離をどれだけ吸い寄せるか）

/** スロットに近づくと磁石のように吸い付く、装備ジェムのドラッグ */
export default function Snap() {
  const [equipped, setEquipped] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [near, setNear] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 }) // 定位置からの表示オフセット
  const [snapKey, setSnapKey] = useState(0)
  const homeRef = useRef<HTMLSpanElement>(null)
  const slotRef = useRef<HTMLSpanElement>(null)
  const grab = useRef({ x: 0, y: 0 })
  const slotDelta = useRef({ x: 0, y: 0 }) // 定位置→スロット中心のベクトル

  const start = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    grab.current = { x: e.clientX, y: e.clientY }
    const home = homeRef.current!.getBoundingClientRect()
    const slot = slotRef.current!.getBoundingClientRect()
    slotDelta.current = {
      x: slot.left + slot.width / 2 - (home.left + home.width / 2),
      y: slot.top + slot.height / 2 - (home.top + home.height / 2),
    }
    setDragging(true)
  }

  const move = (e: React.PointerEvent) => {
    if (!dragging) return
    const base = equipped ? slotDelta.current : { x: 0, y: 0 }
    const raw = {
      x: base.x + (e.clientX - grab.current.x),
      y: base.y + (e.clientY - grab.current.y),
    }
    /* スロットまでの残り距離。近いと磁力で吸い寄せられる */
    const d = { x: slotDelta.current.x - raw.x, y: slotDelta.current.y - raw.y }
    const dist = Math.hypot(d.x, d.y)
    const pulled = dist < NEAR
    setNear(pulled)
    setPos({
      x: raw.x + (pulled ? d.x * SUCTION : 0),
      y: raw.y + (pulled ? d.y * SUCTION : 0),
    })
  }

  const release = () => {
    if (!dragging) return
    setDragging(false)
    if (near && !equipped) setSnapKey((k) => k + 1)
    setEquipped(near)
    setNear(false)
    setPos(near ? slotDelta.current : { x: 0, y: 0 })
  }

  return (
    <div className="mz-snap">
      <div className="mz-snap-stage">
        <span ref={homeRef} className="mz-snap-home" aria-hidden="true" />
        <span ref={slotRef} className={`mz-snap-slot${near ? ' is-near' : ''}${equipped && !dragging ? ' is-filled' : ''}`}>
          <span className="mz-snap-slot-label" aria-hidden="true">
            そうび
          </span>
          {equipped && !dragging && <i key={snapKey} className="mz-snap-burst" aria-hidden="true" />}
        </span>
        <button
          className={`mz-snap-gem${dragging ? ' is-dragging' : ' is-settle'}${near ? ' is-near' : ''}`}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={release}
          onPointerCancel={release}
          aria-label="ジェムをドラッグしてスロットへ"
        />
      </div>
      <span className="mz-snap-hint">ジェムをスロットへドラッグ</span>
    </div>
  )
}
