import type { ComponentType } from 'react'
import Menu from './specimens/menu'
import Search from './specimens/search'
import Select from './specimens/select'
import Sheet from './specimens/sheet'
import Voice from './specimens/voice'
import JellyButton from './specimens/button'
import Toggle from './specimens/toggle'
import Checkbox from './specimens/checkbox'
import Like from './specimens/heart'
import Tabs from './specimens/tabs'
import Loader from './specimens/loader'
import Bell from './specimens/bell'

export const CATEGORIES = ['入力', 'ナビゲーション', 'オーバーレイ', 'フィードバック'] as const
export type Category = (typeof CATEGORIES)[number]

export interface Specimen {
  /** specimens/ 配下のフォルダ名と一致させる */
  id: string
  no: number
  nameJa: string
  nameEn: string
  category: Category
  /** 観察方法（どう触ると動くか） */
  trigger: string
  /** 動きの原理（アニメーションの12原則などのタグ） */
  principles: string[]
  /** 生態（この動きが何を伝えるか） */
  ecology: string
  Component: ComponentType
}

export const specimens: Specimen[] = [
  {
    id: 'menu',
    no: 1,
    nameJa: 'メニュー',
    nameEn: 'Morphing Menu',
    category: 'オーバーレイ',
    trigger: '● をクリック',
    principles: ['モーフィング', 'オーバーシュート', '時間差の登場'],
    ecology:
      '待機中は「•••」がゆらゆらと呼吸し、押されると丸ボタン自身がメニューへと変形する。ボタンとパネルが別物ではなく同じ生き物の変態として繋がっているため、視線が迷子にならない。閉じる×はボタンが移動した先に現れる。',
    Component: Menu,
  },
  {
    id: 'search',
    no: 2,
    nameJa: '検索ボックス',
    nameEn: 'Curious Search',
    category: '入力',
    trigger: '入力欄にフォーカス',
    principles: ['スカッシュ&ストレッチ', '二次アクション', 'まばたき'],
    ecology:
      'フォーカスすると入力欄がびよーんと伸び、右端から検索ボタンがむにっと生えてくる。虫めがねはときどき小首をかしげ、レンズをまばたきさせる。「探す準備ができて、こちらに興味を持っている」ことを目玉の擬人化で伝える。',
    Component: Search,
  },
  {
    id: 'select',
    no: 3,
    nameJa: 'セレクトボックス',
    nameEn: 'Popping Select',
    category: '入力',
    trigger: 'ボタンをクリックして選ぶ',
    principles: ['オーバーシュート', '時間差の登場', 'ポップ'],
    ecology:
      '開くと選択肢がぷるんと展開し、項目がひとつずつ時間差でぽこぽこ湧き出す。選び直すと値のラベルがぽんっと跳ねて「変わったよ」と教えてくれる。一覧が一瞬で貼り付くのではなく、湧いて出ることで階層の出どころが分かる。',
    Component: Select,
  },
  {
    id: 'sheet',
    no: 4,
    nameJa: 'アクションシート',
    nameEn: 'Bouncy Sheet',
    category: 'オーバーレイ',
    trigger: '「表示する」をクリック',
    principles: ['オーバーシュート', 'イーズの緩急', '着地'],
    ecology:
      '画面の下から勢いよく上がってきて、行き過ぎてからふわっと着地する。物理的な重さを感じさせる着地は「いま画面の上に別のレイヤーが乗った」という空間の変化を体で理解させる。背景が少し暗くなるのも生態のひとつ。',
    Component: Sheet,
  },
  {
    id: 'voice',
    no: 5,
    nameJa: '音声入力',
    nameEn: 'Wiggly Mic',
    category: '入力',
    trigger: 'マイクをタップ',
    principles: ['モーフィング', '波紋', '呼吸'],
    ecology:
      '待機中はすやすやと呼吸し、タップするとマイクの頭がくねくねと身をよじって聞き耳を立てる。輪郭が有機的に歪むことで「機械が録音している」ではなく「誰かが聞いてくれている」感触になる。声の波紋がリズムを刻む。',
    Component: Voice,
  },
  {
    id: 'button',
    no: 6,
    nameJa: 'ボタン',
    nameEn: 'Jelly Button',
    category: 'フィードバック',
    trigger: '長めに押して、離す',
    principles: ['スカッシュ&ストレッチ', '予備動作', '減衰振動'],
    ecology:
      '押している間はぐにゃっと潰れて力を溜め、離した瞬間にぷるんぷるんと減衰しながら復元する。押し込み＝予備動作、復元＝本動作という古典アニメーションの文法そのもので、指先に「押せた」という確かな手応えを返す。',
    Component: JellyButton,
  },
  {
    id: 'toggle',
    no: 7,
    nameJa: 'トグルスイッチ',
    nameEn: 'Caramel Toggle',
    category: '入力',
    trigger: 'スイッチをクリック',
    principles: ['スカッシュ&ストレッチ', '慣性', 'オーバーシュート'],
    ecology:
      'ノブが移動の途中でキャラメルのようにびよーんと横に伸び、到着すると丸に戻る。伸びることで速度と勢いが見え、ON/OFFの二値がただの座標替えではなく「状態が滑っていく」連続的な体験になる。トラックも一緒にむにっと縮む。',
    Component: Toggle,
  },
  {
    id: 'checkbox',
    no: 8,
    nameJa: 'チェックボックス',
    nameEn: 'Happy Checkbox',
    category: '入力',
    trigger: 'チェックを付け外し',
    principles: ['線画アニメーション', 'ポップ', '二次アクション'],
    ecology:
      'チェックを入れると箱がぷるんと身震いして喜び、ワンテンポ遅れてチェックマークがひと筆でしゅるっと描かれる。「同意」というやや硬い行為に、小さな祝福のニュアンスを添える。外すときはそっけなく消えるのも愛嬌。',
    Component: Checkbox,
  },
  {
    id: 'heart',
    no: 9,
    nameJa: 'いいねボタン',
    nameEn: 'Bursting Like',
    category: 'フィードバック',
    trigger: 'ハートをクリック',
    principles: ['予備動作', 'ポップ', 'パーティクル'],
    ecology:
      '押すとハートが一度ぎゅっと縮んでから、ぼんっと膨らんで塗りつぶされ、8方向にしずくが飛び散る。感情の高まりを「溜めてから爆発」の緩急で表現する定番の生態。取り消すときは静かに輪郭だけに戻る。',
    Component: Like,
  },
  {
    id: 'tabs',
    no: 10,
    nameJa: 'タブ',
    nameEn: 'Gummy Tabs',
    category: 'ナビゲーション',
    trigger: 'タブを切り替える',
    principles: ['スカッシュ&ストレッチ', '慣性', 'オーバーシュート'],
    ecology:
      '選択中を示す白いピルが、タブを切り替えるたびにガムのように伸びながら滑って追いかけてくる。移動の軌跡が残像として体に残るので、「どこから来てどこへ行ったか」を説明なしで理解できる。',
    Component: Tabs,
  },
  {
    id: 'loader',
    no: 11,
    nameJa: 'ローディング',
    nameEn: 'Splat Loader',
    category: 'フィードバック',
    trigger: '眺める（常時アニメーション）',
    principles: ['スカッシュ&ストレッチ', '重力', 'リズム'],
    ecology:
      '3つの玉が順番に跳ねては、着地でぐにゃっと潰れる。潰れの一瞬があるだけで、ただの点滅が「重さを持った生き物の行進」に変わる。待ち時間に小さな見世物を用意しておくのは、図鑑でいちばん古くからある知恵。',
    Component: Loader,
  },
  {
    id: 'bell',
    no: 12,
    nameJa: '通知ベル',
    nameEn: 'Ringing Bell',
    category: 'フィードバック',
    trigger: 'ベルをクリック',
    principles: ['減衰振動', 'ポップ', '二次アクション'],
    ecology:
      'クリックするとベルが身をよじって鳴り、揺れ幅が物理法則どおりに減衰していく。バッジはぽんっと弾んで登場し、数を重ねるたびに跳ね直す。音が出せない画面で「鳴っている」ことを伝えるための、視覚の擬音語。',
    Component: Bell,
  },
]

/* 各標本のソースコードを ?raw で丸ごと取り込む（詳細ビューのコード表示用） */
const rawSources = import.meta.glob('./specimens/*/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function sourceOf(id: string): { tsx: string; css: string } {
  return {
    tsx: rawSources[`./specimens/${id}/index.tsx`] ?? '',
    css: rawSources[`./specimens/${id}/style.css`] ?? '',
  }
}
