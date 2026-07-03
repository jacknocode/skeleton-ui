import { useState } from 'react'
import './style.css'

/** 画面の下からぬっと現れるアクションシート */
export default function Sheet() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mz-sheet-stage">
      <button className="mz-sheet-open" onClick={() => setOpen(true)}>
        表示する
      </button>
      <div
        className={`mz-sheet-backdrop${open ? ' is-open' : ''}`}
        onClick={() => setOpen(false)}
      />
      <div className={`mz-sheet${open ? ' is-open' : ''}`} role="dialog" aria-hidden={!open}>
        <span className="mz-sheet-handle" />
        <button className="mz-sheet-item" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          共有する
        </button>
        <button className="mz-sheet-item" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          複製する
        </button>
        <button
          className="mz-sheet-item is-cancel"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
