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
import HpBar from './specimens/hpbar'
import CoinCounter from './specimens/counter'
import PopNumbers from './specimens/popnum'
import LevelUp from './specimens/levelup'
import Combo from './specimens/combo'
import Chest from './specimens/chest'
import Cooldown from './specimens/cooldown'
import Gacha from './specimens/gacha'
import Energy from './specimens/energy'
import Shield from './specimens/shield'
import Toast from './specimens/toast'
import Banner from './specimens/banner'
import Countdown from './specimens/countdown'
import Wallet from './specimens/wallet'

export const CATEGORIES = ['入力', 'ナビゲーション', 'オーバーレイ', 'フィードバック', 'ゲーム'] as const
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
  {
    id: 'hpbar',
    no: 13,
    nameJa: 'HPバー',
    nameEn: 'Ghost HP Bar',
    category: 'ゲーム',
    trigger: '「ダメージ」「回復」をクリック',
    principles: ['遅延フォロー', 'シェイク', 'フラッシュ'],
    ecology:
      '被弾すると本体のバーは即座にスパッと減り、薄いゴーストがワンテンポ遅れてじわーっと溶けて追いつく。この時間差が「いまどれだけ削られたか」の幅を目に残す、格闘ゲーム由来の古典的な生態。残り3割を切ると心拍のように明滅して危険を知らせる。',
    Component: HpBar,
  },
  {
    id: 'counter',
    no: 14,
    nameJa: 'コインカウンター',
    nameEn: 'Rolling Counter',
    category: 'ゲーム',
    trigger: '「+80」「+777」をクリック',
    principles: ['ドラムロール', '慣性', 'ポップ'],
    ecology:
      '数値が一瞬で書き換わるのではなく、各桁がスロットのドラムのように回って目的の数字で止まる。桁上がりで生まれた新しい桁はぽこっと湧いて登場し、加算額は「+777」と浮かんで消える。増えた実感を量として体に伝える、報酬表示の基本形。',
    Component: CoinCounter,
  },
  {
    id: 'popnum',
    no: 15,
    nameJa: 'ダメージ数字',
    nameEn: 'Pop Damage',
    category: 'ゲーム',
    trigger: 'スライムを連打する',
    principles: ['ポップ', '散らばり', 'ヒットの誇張'],
    ecology:
      '叩くたびにスライムがぐにゃっと潰れ、ダメージ数字が跳ね上がってふわっと消える。出現位置を少しずつ散らすことで連打しても読める。4回に1度の会心の一撃は、ひと呼吸ためてから3倍のサイズで弾ける——強さの差は数字ではなく緩急で語る。',
    Component: PopNumbers,
  },
  {
    id: 'levelup',
    no: 16,
    nameJa: '経験値バー',
    nameEn: 'Level Up',
    category: 'ゲーム',
    trigger: '「+35 XP」を押して満タンに',
    principles: ['オーバーシュート', '波の走査', 'パンチスケール'],
    ecology:
      '経験値はぷるんと伸びて溜まり、満タンの瞬間に光の波がバーを走り抜け、レベルバッジがぼんっと弾んで数字が上がる。あふれた分は満タン状態からすーっと縮んで持ち越される。「積み上げ→臨界→祝福」という成長のリズムを1本のバーで演じる。',
    Component: LevelUp,
  },
  {
    id: 'combo',
    no: 17,
    nameJa: 'コンボカウンター',
    nameEn: 'Combo Counter',
    category: 'ゲーム',
    trigger: '「たたく！」を1秒以内に連打',
    principles: ['パンチスケール', '成長', '崩れ落ち'],
    ecology:
      '連打するたびに数字がパンチのように打ち込まれ、コンボが伸びるほど文字そのものが育っていく。1秒手を止めると、数字は力尽きてぱたっと崩れ落ちる。「続けたい」という緊張感を、大きさと落下だけで作る生態。',
    Component: Combo,
  },
  {
    id: 'chest',
    no: 18,
    nameJa: '宝箱',
    nameEn: 'Teasing Chest',
    category: 'ゲーム',
    trigger: '宝箱をタップ',
    principles: ['予備動作', 'じらし', 'パーティクル'],
    ecology:
      'タップするとすぐには開かず、まずガタガタと震えてタメをつくる。それからフタがぱかっと跳ね開き、光が立ちのぼって戦利品が飛び出す。報酬の嬉しさは中身より「開くまでの0.5秒」が作る——ガチャ演出にも通じる、じらしの生態。',
    Component: Chest,
  },
  {
    id: 'cooldown',
    no: 19,
    nameJa: 'スキルクールダウン',
    nameEn: 'Cooldown Skill',
    category: 'ゲーム',
    trigger: '稲妻ボタンをタップ',
    principles: ['ラジアルワイプ', 'フラッシュ', 'ポップ'],
    ecology:
      '発動の瞬間にボタンがバチンと弾け、影が時計の針のように盤面を覆う。影は時計回りに晴れていき、残り時間がひと目で分かる。晴れきった瞬間はぷるんと跳ねて輪っかを放ち、「もう使えるよ」を音なしで告げる。待ち時間を情報に変える生態。',
    Component: Cooldown,
  },
  {
    id: 'gacha',
    no: 20,
    nameJa: 'カードめくり',
    nameEn: 'Card Reveal',
    category: 'ゲーム',
    trigger: 'カードをタップ',
    principles: ['3D回転', 'オーバーシュート', '光の走査'],
    ecology:
      '待機中はそわそわと浮遊し、タップすると勢い余って行き過ぎながらひるがえる。表になった瞬間、背後で光の輪が弾け、星がぼんっと現れ、光が斜めに走り抜ける。めくる前の浮遊が「中身への期待」を、返りの勢いが「引きの快感」を演じる。',
    Component: Gacha,
  },
  {
    id: 'energy',
    no: 21,
    nameJa: 'スタミナ',
    nameEn: 'Energy Drops',
    category: 'ゲーム',
    trigger: '「行動する」「休む」をクリック',
    principles: ['蒸発', 'ぽたっと着地', 'リソースの可視化'],
    ecology:
      '行動するとしずくがひとつ、ぷちんと潰れてから膨らんで蒸発し、小さな煙の輪が残る。休むと上からぽたっと落ちてきて、ぷるんと着地して満ちる。「使った」「戻った」を同じ場所で逆向きの重力として演じる、リソース表示の生態。',
    Component: Energy,
  },
  {
    id: 'shield',
    no: 22,
    nameJa: 'シールド割れ',
    nameEn: 'Cracking Shield',
    category: 'ゲーム',
    trigger: '盾を3回たたく',
    principles: ['線画アニメーション', 'フラッシュ', 'パーティクル'],
    ecology:
      '被弾のたびにガキンと揺れて白く光り、ヒビが一筆でピシッと走って増えていく。3発目で耐えきれず、白閃光とともに破片が回転しながら飛び散る。「あと何発で割れるか」をヒビの量で語る、耐久値の視覚言語。',
    Component: Shield,
  },
  {
    id: 'toast',
    no: 23,
    nameJa: '実績トースト',
    nameEn: 'Achievement Toast',
    category: 'ゲーム',
    trigger: '「実績を解除する」をクリック',
    principles: ['オーバーシュート', '時間差の登場', '3D回転'],
    ecology:
      '画面下の縁から勢いよくせり上がり、メダルが一拍おいてくるんと一回転、テキストがさらに遅れて滑り込む。しばらく誇らしげに留まってから、来た道を静かに帰っていく。主役の邪魔をせず、でも確かに祝う——通知の礼儀作法。',
    Component: Toast,
  },
  {
    id: 'banner',
    no: 24,
    nameJa: 'ボス登場の帯',
    nameEn: 'Boss Banner',
    category: 'ゲーム',
    trigger: '「ボス出現」をクリック',
    principles: ['交差ワイプ', 'ドンと据わる', '震え'],
    ecology:
      '2本の黒い帯が左右からシャキーンと走り込んで交差し、名前が一拍遅れて奥からドンと据わって小さく震える。帯のスピードと名前のタメの対比が「ただごとではない」空気を作る。ひと仕事終えると、ふっと消えて平原に戻る。',
    Component: Banner,
  },
  {
    id: 'countdown',
    no: 25,
    nameJa: 'カウントダウン',
    nameEn: 'Heartbeat Countdown',
    category: 'ゲーム',
    trigger: '「スタート」をクリック',
    principles: ['鼓動', '加速', '解放'],
    ecology:
      '3、2、1——数字がドンと据わり、心臓のように鼓動する。残りが減るほど拍が速まっていき、体の緊張とシンクロする。そしてGO!の瞬間、ためこんだ緊張を捨てて一気に弾け、画面の外へ走り去る。緊張と解放の教科書。',
    Component: Countdown,
  },
  {
    id: 'wallet',
    no: 26,
    nameJa: 'おかね不足',
    nameEn: 'Broke Wallet',
    category: 'ゲーム',
    trigger: '買えないものを買おうとする',
    principles: ['首振り', '減衰振動', 'へたり込み'],
    ecology:
      '高すぎる買い物をしようとすると、ボタンが「ううん」と減衰しながら首を横に振り、財布のコインがへたり込む。吹き出しがそっと理由を告げて消える。エラーを赤い警告ではなく、キャラクターの仕草として伝える生態。',
    Component: Wallet,
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
