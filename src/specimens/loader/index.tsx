import './style.css'

/** ぼとっと落ちて、ぐにゃっと潰れて跳ねるローディング */
export default function Loader() {
  return (
    <div className="mz-loader" role="status" aria-label="読み込み中">
      <span className="mz-loader-dots">
        <i />
        <i />
        <i />
      </span>
      <span className="mz-loader-text">よみこみちゅう</span>
    </div>
  )
}
