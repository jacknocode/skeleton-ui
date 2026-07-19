import { useEffect, useRef, useState } from 'react'
import './style.css'

const KNOB_R = 22 // ノブの可動半径(px)
const SPEED = 95 // フルに倒したときの移動速度(px/秒)
const FIELD = { w: 216, h: 92, pad: 18 } // ひよこの散歩できる範囲

/** バーチャルパッドでひよこを散歩させるジョイスティック */
export default function Joystick() {
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [face, setFace] = useState(1)
  const vec = useRef({ x: 0, y: 0 })
  const origin = useRef({ x: 0, y: 0 })
  const raf = useRef(0)
  const last = useRef(0)

  const steer = (e: React.PointerEvent) => {
    const dx = e.clientX - origin.current.x
    const dy = e.clientY - origin.current.y
    const len = Math.hypot(dx, dy) || 1
    const r = Math.min(len, KNOB_R)
    const v = { x: (dx / len) * r, y: (dy / len) * r }
    vec.current = { x: v.x / KNOB_R, y: v.y / KNOB_R }
    setKnob(v)
    if (Math.abs(v.x) > 4) setFace(v.x > 0 ? 1 : -1)
  }

  const grab = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    setDragging(true)
    steer(e)
  }

  const letGo = () => {
    setDragging(false)
    vec.current = { x: 0, y: 0 }
    setKnob({ x: 0, y: 0 })
  }

  /* 倒している間だけ、倒した向きと深さでひよこが歩く */
  useEffect(() => {
    if (!dragging) return
    last.current = performance.now()
    const step = (t: number) => {
      const dt = (t - last.current) / 1000
      last.current = t
      setPos((p) => ({
        x: clamp(p.x + vec.current.x * SPEED * dt, FIELD.w / 2 - FIELD.pad),
        y: clamp(p.y + vec.current.y * SPEED * dt, FIELD.h / 2 - FIELD.pad),
      }))
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [dragging])

  const walking = dragging && Math.hypot(vec.current.x, vec.current.y) > 0.1

  return (
    <div className="mz-joystick">
      <div className="mz-joystick-field" aria-hidden="true">
        <span className="mz-joystick-chick" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
          <span className="mz-joystick-flip" style={{ transform: `scaleX(${face})` }}>
            <i className={`mz-joystick-body${walking ? ' is-walking' : ''}`} />
          </span>
        </span>
      </div>
      <div
        className="mz-joystick-base"
        onPointerDown={grab}
        onPointerMove={dragging ? steer : undefined}
        onPointerUp={letGo}
        onPointerCancel={letGo}
        role="slider"
        aria-label="ひよこを動かすスティック"
        aria-valuetext={dragging ? '操作中' : '中立'}
      >
        <span
          className={`mz-joystick-knob${dragging ? '' : ' is-home'}`}
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>
      <span className="mz-joystick-hint">スティックをドラッグ</span>
    </div>
  )
}

function clamp(v: number, limit: number) {
  return Math.max(-limit, Math.min(limit, v))
}
