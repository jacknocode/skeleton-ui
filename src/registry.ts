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
import Charge from './specimens/charge'
import Joystick from './specimens/joystick'
import Sling from './specimens/sling'
import Flick from './specimens/flick'
import Snap from './specimens/snap'
import Wheel from './specimens/wheel'
import CardFanArc from './specimens/card-fan-arc'
import CardScatterDeal from './specimens/card-scatter-deal'
import CardCascadeRise from './specimens/card-cascade-rise'
import CardCoverFlow from './specimens/card-cover-flow'
import CardTimeMachine from './specimens/card-time-machine'
import BarSprout from './specimens/bar-sprout'
import LineInkDraw from './specimens/line-ink-draw'
import DonutPour from './specimens/donut-pour'
import GaugeOvershoot from './specimens/gauge-overshoot'
import KpiLanding from './specimens/kpi-landing'
import GoalRingBurst from './specimens/goal-ring-burst'
import ScatterPopcorn from './specimens/scatter-popcorn'
import HeatmapConduction from './specimens/heatmap-conduction'
import AreaTide from './specimens/area-tide'
import RadarMorph from './specimens/radar-morph'
import FunnelDrip from './specimens/funnel-drip'
import SparklineEcg from './specimens/sparkline-ecg'
import CashBridge from './specimens/cash-bridge'
import ShareDilute from './specimens/share-dilute'
import ThresholdAlarm from './specimens/threshold-alarm'
import PendingCommit from './specimens/pending-commit'
import AllocationSeesaw from './specimens/allocation-seesaw'
import DiffArrowMood from './specimens/diff-arrow-mood'
import QuestTrackerSlide from './specimens/quest-tracker-slide'
import UnlockDoor from './specimens/unlock-door'
import AnnotationStamp from './specimens/annotation-stamp'
import NewsPreview from './specimens/news-preview'
import ConfirmedPaper from './specimens/confirmed-paper'
import RunwaySand from './specimens/runway-sand'
import TooltipMagnetDot from './specimens/tooltip-magnet-dot'
import PiePullOut from './specimens/pie-pull-out'
import SankeyStream from './specimens/sankey-stream'
import CausalRelay from './specimens/causal-relay'
import LineMeasure from './specimens/line-measure'
import UndoUnravel from './specimens/undo-unravel'
import EffectLagShadow from './specimens/effect-lag-shadow'
import OptimisticRollback from './specimens/optimistic-rollback'
import PendingQueue from './specimens/pending-queue'
import RevisedPast from './specimens/revised-past'
import OthersHand from './specimens/others-hand'
import ScrollBaton from './specimens/scroll-baton'
import EstimateNarrowing from './specimens/estimate-narrowing'
import DebtDrag from './specimens/debt-drag'
import FamiliarShorthand from './specimens/familiar-shorthand'
import MotionTriage from './specimens/motion-triage'
import CompoundSnowball from './specimens/compound-snowball'
import StackReorderWeight from './specimens/stack-reorder-weight'
import PaperPress from './specimens/paper-press'
import ReverseMidflight from './specimens/reverse-midflight'
import CoalesceRepeat from './specimens/coalesce-repeat'
import CatchInertia from './specimens/catch-inertia'
import SharedElementCarry from './specimens/shared-element-carry'
import SkeletonHandoff from './specimens/skeleton-handoff'
import GapClose from './specimens/gap-close'
import OffscreenHandoff from './specimens/offscreen-handoff'
import QuietMode from './specimens/quiet-mode'
import MissedWhileAway from './specimens/missed-while-away'
import OffscreenArrivals from './specimens/offscreen-arrivals'
import TraceOverflow from './specimens/trace-overflow'
import FocusTravel from './specimens/focus-travel'
import PlaceLost from './specimens/place-lost'
import TakenThere from './specimens/taken-there'
import TwoCursors from './specimens/two-cursors'

export const CATEGORIES = ['入力', 'ナビゲーション', 'オーバーレイ', 'フィードバック', 'ゲーム', 'アナリティクス'] as const
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
  {
    id: 'charge',
    no: 27,
    nameJa: '長押しチャージ',
    nameEn: 'Charge Shot',
    category: 'ゲーム',
    trigger: '長押しでためて、離す',
    principles: ['タメと解放', 'スカッシュ&ストレッチ', '力の可視化'],
    ecology:
      '押している間、撃ち手はぐぐっと潰れて力をため、ゲージが満ちる。満タンになると武者震いして「今だ」と教えてくれる。離した瞬間、ためた時間のぶんだけ星が大きく遠くへ飛ぶ。指を置いている長さがそのまま強さになる、長押しというモバイル特有の入力の教科書。',
    Component: Charge,
  },
  {
    id: 'joystick',
    no: 28,
    nameJa: 'バーチャルパッド',
    nameEn: 'Virtual Joystick',
    category: 'ゲーム',
    trigger: 'スティックをドラッグ',
    principles: ['入力の可視化', 'ばね戻り', '二次アクション'],
    ecology:
      'ノブは指に吸い付いて可動域の縁まで倒れ、倒した向きと深さでひよこが歩く。浅く倒せばそろそろと、深く倒せばぴょこぴょこ急ぐ。指を離すとノブはばねで中央へ跳ね戻り、ひよこはその場で立ち止まって呼吸に戻る。物理ボタンのない画面に「レバーの手応え」を宿す生態。',
    Component: Joystick,
  },
  {
    id: 'sling',
    no: 29,
    nameJa: '引っぱり発射',
    nameEn: 'Slingshot',
    category: 'ゲーム',
    trigger: '玉を引っぱって、離す',
    principles: ['予備動作', '軌道の予告', 'ぽんっと帰還'],
    ecology:
      '玉をつまんで引くと、飛んでいく向きに予告のドットが並び、強く引くほど遠く濃く伸びる。離すと玉は引いた逆へ勢いよく飛び、的に当たればスライムがぐしゃっと潰れる。引く＝ためる＝狙うがひと動作に重なった、モンストやアングリーバード直系の指の文法。ちょい引きは不発でそっと戻る。',
    Component: Sling,
  },
  {
    id: 'flick',
    no: 30,
    nameJa: 'フリック仕分け',
    nameEn: 'Swipe Judge',
    category: 'ゲーム',
    trigger: 'カードを左右にスワイプ',
    principles: ['慣性', 'しきい値の可視化', 'ばね戻り'],
    ecology:
      'カードは指に付いて傾き、傾けた量に応じてGET/PASSのスタンプがにじみ出る——いま離したらどうなるかを常に予告する。しきい値を越えるか勢いよくフリックすれば回転しながら飛んでいき、控えのカードがぷるんと繰り上がる。迷って戻せばばねで定位置へ。「仕分ける」判断を1スワイプに圧縮した生態。',
    Component: Flick,
  },
  {
    id: 'snap',
    no: 31,
    nameJa: '装備スロットの磁力',
    nameEn: 'Magnetic Slot',
    category: 'ゲーム',
    trigger: 'ジェムをスロットへドラッグ',
    principles: ['磁力スナップ', '吸い付き', 'ポップ'],
    ecology:
      'ジェムをつまんでスロットに近づけると、磁石の圏内に入った瞬間ふっと吸い寄せられ、ジェムはそわそわと震え、スロットは口を開けて待ちかまえる。離せばかちっと収まって輪が弾け、スロットがごくんと満足げに揺れる。ドロップ先の当たり判定を「感触」として指に伝える、ドラッグ&ドロップの礼儀作法。',
    Component: Snap,
  },
  {
    id: 'wheel',
    no: 32,
    nameJa: 'フリックルーレット',
    nameEn: 'Flick Roulette',
    category: 'ゲーム',
    trigger: '盤面をフリックで回す',
    principles: ['慣性', '摩擦の減速', 'じらし'],
    ecology:
      '盤面は指の速さをそのまま受け取って回り、離すと摩擦でじわじわと減速していく。針はセクターの境界を越えるたびにかちっとはじかれ、遅くなるほど鼓動のような間隔になる。止まり際はいちばん近いマスへぷるんと吸い付いて確定し、結果が跳ねて登場する。減速の時間そのものが「どこで止まる？」のじらしになる生態。',
    Component: Wheel,
  },
  {
    id: 'card-fan-arc',
    no: 33,
    nameJa: '扇に開くカード束',
    nameEn: 'Card Fan Arc',
    category: 'ナビゲーション',
    trigger: '束にホバー / タップ',
    principles: ['扇形展開', 'アーク', 'オーバーシュート'],
    ecology:
      '重なった5枚が底辺を支点に、しゃらっと扇状に開く。回転だけでなく端が+6px沈み中央が-6px浮く放物線のyが乗ることで、「扇」が「弧」に見える。中央の1枚だけ1.05倍にそっと持ち上がり、どれが主役かを言葉なしで伝える。2〜3%だけ行き過ぎて止まるバネが、紙のしなりを演じる生態。Amicroのカードスタックから採取。',
    Component: CardFanArc,
  },
  {
    id: 'card-scatter-deal',
    no: 34,
    nameJa: '手札ディールの散らばり',
    nameEn: 'Scatter Deal',
    category: 'ナビゲーション',
    trigger: '束にホバー / タップ',
    principles: ['不均等配置', '崩し', 'オーバーシュート'],
    ecology:
      'ホバーで5枚がぱらっと場に散らばる。位置と角度は数式の等分ではなく1枚ずつの手置きで、中央のカードさえ+2°だけ傾いている。この「わずかな崩し」が機械の整列ではなく人がテーブルに並べた感触を作る。戻るときは同じバネで束にすっと吸い込まれる。均等こそが嘘くさい、を教えてくれる標本。',
    Component: CardScatterDeal,
  },
  {
    id: 'card-cascade-rise',
    no: 35,
    nameJa: '階段にせり上がるカード',
    nameEn: 'Cascade Rise',
    category: 'ナビゲーション',
    trigger: '束にホバー / タップ',
    principles: ['カスケード', '予告', '質量感'],
    ecology:
      '待機中から2pxずつズレて「これは束だ」と予告しておき、ホバーで1枚ごとに20pxずつ階段状にすっとせり上がる。傾きも6°ずつ積まれ、全体がひとつの螺旋階段のように立ち上がる。バネは標準よりわずかに重く、紙束の質量を体に伝える。展開前の仕込みが展開後の驚きを滑らかにする、段取りの生態。',
    Component: CardCascadeRise,
  },
  {
    id: 'card-cover-flow',
    no: 36,
    nameJa: 'CSSカバーフロー',
    nameEn: 'Cover Flow',
    category: 'ナビゲーション',
    trigger: '脇のカードかドットをクリック',
    principles: ['3D回転', '奥行き', 'ほぼ臨界減衰'],
    ecology:
      '選ばれた1枚が正面を向いて手前へ出て、左右はrotateY±38°で奥へ畳まれる。距離に応じて縮み・薄れながら列をなすので、5枚が一つの奥行きに収まる。3Dは跳ねさせず、ほぼ臨界減衰のease-outですっと入れ替えるのが上品さの秘訣。ドットは選択中だけ棒に伸びて現在地を示す。iPod時代の名作を、CSSの3D変形だけで飼い慣らした標本。',
    Component: CardCoverFlow,
  },
  {
    id: 'card-time-machine',
    no: 37,
    nameJa: 'タイムマシンの奥行きスクラブ',
    nameEn: 'Time Machine Scrub',
    category: 'ナビゲーション',
    trigger: '右の目盛りを撫でる',
    principles: ['奥行きの時間軸', '飛び抜け退場', 'ピント合わせ'],
    ecology:
      '目盛りを撫でると過去のカードが奥からせり出し、現在より手前になった1枚は1.25倍に膨らみながら画面の外へ飛び抜けて消える。時間を「奥＝過去、手前＝未来」の空間に翻訳した生態。目盛りはscaleXだけでにゅっと伸びて応え、日付ラベルはぼけた状態から0.15秒でピントが合う。macOSのTime Machineへのオマージュ。',
    Component: CardTimeMachine,
  },
  {
    id: 'bar-sprout',
    no: 38,
    nameJa: '棒グラフの発芽',
    nameEn: 'Sprouting Bars',
    category: 'アナリティクス',
    trigger: '「再生」をクリック / 棒にホバー',
    principles: ['時間差の登場', 'オーバーシュート', '主役のタメ'],
    ecology:
      '7本の棒が左から60msずつの時間差でにょきにょきと発芽し、行き過ぎてからぷるんと戻る。最大値の棒だけは全員が生えそろったあと一拍おいて登場し、てっぺんで数字がぽんと咲く——いちばん大事な値は最後に出てくるほうが目立つ、という発表の作法をグラフ自身が知っている。ラベルは主役だけ、脇役はホバーで答える。',
    Component: BarSprout,
  },
  {
    id: 'line-ink-draw',
    no: 39,
    nameJa: '折れ線のひと筆書き',
    nameEn: 'Ink Draw Line',
    category: 'アナリティクス',
    trigger: '「もう一度描く」をクリック',
    principles: ['線画アニメーション', 'ペン先の追従', '時間差の点灯'],
    ecology:
      '折れ線が左から1.2秒かけてするすると一筆書きされ、光るペン先が線の先頭を走っていく。通過したデータ点はあとから順にぽつぽつと灯り、描き終わるとエリアの薄塗りがじわっと満ちて、最後に最新値だけがふわっと名乗る。「データは左から右へ流れる時間である」ことを、描画の順序そのもので語る標本。',
    Component: LineInkDraw,
  },
  {
    id: 'donut-pour',
    no: 40,
    nameJa: 'ドーナツの注ぎ込み',
    nameEn: 'Pouring Donut',
    category: 'アナリティクス',
    trigger: '「注ぎ直す」をクリック',
    principles: ['時間差の継ぎ足し', 'じらし', '数字の追従'],
    ecology:
      '12時の位置から円弧がしゅるっと注がれ、セグメントが時間差で継ぎ足されていく。中央の%数字は弧の進みを追いかけてカウントアップし、閉じ切る瞬間まで99%で踏みとどまる。最後のひと欠けだけ長めのease-outでじわ〜っと閉じるのがこの標本のじらしで、100%の瞬間にドーナツ全体がぷるんと脈打ち、凡例も揃って着席する。',
    Component: DonutPour,
  },
  {
    id: 'gauge-overshoot',
    no: 41,
    nameJa: 'メーター針の勢い余り',
    nameEn: 'Overshooting Gauge',
    category: 'アナリティクス',
    trigger: '「今週」「今月」「今日」をクリック',
    principles: ['オーバーシュート', '減衰振動', '鼓動'],
    ecology:
      '値ボタンを押すと針がぶんっと加速して目標を7°通り過ぎ、ゆらゆらと減衰しながら戻って止まる。振れ幅そのものが「勢いよく届いた」ことの誇張になる、物理針メーターへのオマージュ。数値は針よりひと足先に着地して答えを先出しする。危険域（80以上）に止まったときだけ、中心ハブと数字がどくんどくんと鼓動を打ち続ける。',
    Component: GaugeOvershoot,
  },
  {
    id: 'kpi-landing',
    no: 42,
    nameJa: 'KPI数字の着地',
    nameEn: 'Landing KPI',
    category: 'アナリティクス',
    trigger: '「別の週を見る」をクリック',
    principles: ['減速の緩急', 'スカッシュ&ストレッチ', '二次アクション'],
    ecology:
      '数字がはじめは桁の読めない速さで回り、後半ぐっと減速して1ずつ刻みながら着地、ぷるんとひと揺れする。コインカウンター（No.14）のドラムロールが「量の実感」なら、こちらは「結果の発表」の緩急。着地の余韻で前週比バッジが登場するが、上昇はぴょこんと跳ね、下降はぽとりと沈む——同じ情報でも感情の向きで登場の仕方が変わる。',
    Component: KpiLanding,
  },
  {
    id: 'goal-ring-burst',
    no: 43,
    nameJa: '目標達成リングの臨界',
    nameEn: 'Goal Ring Burst',
    category: 'アナリティクス',
    trigger: '「+2,600歩」を4回押して達成',
    principles: ['じらし', 'パーティクル', '線画アニメーション'],
    ecology:
      '加算のたびにリングがぷるんと伸びて進み、最後のひと押しでは90%まで威勢よく駆けてから、残り数%をじわ〜っと閉じてタメを作る。閉じ切った瞬間、リングは一度ぎゅっと縮んでからぼんっと弾み、光の輪を2連発で外へ放ち、%数字はチェックマークのひと筆書きに席を譲る。経験値バー（No.16）の臨界を、ダッシュボードの言葉に翻訳した標本。',
    Component: GoalRingBurst,
  },
  {
    id: 'scatter-popcorn',
    no: 44,
    nameJa: '散布図のポップコーン',
    nameEn: 'Popcorn Scatter',
    category: 'アナリティクス',
    trigger: '「再生」をクリック / 点にホバー',
    principles: ['時間差の登場', '連鎖', '外れ値の誇張'],
    ecology:
      '原点にいちばん近い点から50msずつ、ぽん、ぽん、と弾けて着地し、密集したクラスターはまとめて咲く。全員が着地したあと一拍おいて、重心からいちばん離れた1点だけが1.6倍まで跳ね、1.15倍のまま居座って「こいつを見ろ」と主張する。散布図でいちばん伝えたいのは分布ではなく外れ値だ、という主張を登場順で語る標本。',
    Component: ScatterPopcorn,
  },
  {
    id: 'heatmap-conduction',
    no: 45,
    nameJa: 'ヒートマップの熱伝導',
    nameEn: 'Heat Conduction',
    category: 'アナリティクス',
    trigger: '「再生」をクリック / セルにホバー',
    principles: ['波及', '時間差の登場', '鼓動'],
    ecology:
      '全セルが無色から始まり、最大値のセルを熱源として、そこからの距離ぶんだけ遅れて色がじわじわと波及していく。染まる瞬間に一つひとつがぷくっと弾むので、色が「塗られる」のではなく「伝わる」ものに見える。温まりきったあとも熱源だけがゆっくり鼓動し続け、どこがいちばん熱いかを言葉なしで指し示す。',
    Component: HeatmapConduction,
  },
  {
    id: 'area-tide',
    no: 46,
    nameJa: 'エリアチャートの満ち引き',
    nameEn: 'Tidal Area',
    category: 'アナリティクス',
    trigger: '「今週」「先週」「先月」を切り替え / 面にホバー',
    principles: ['モーフィング', 'ばねの揺り戻し', '慣性'],
    ecology:
      '期間を切り替えると水位が左から右へ抜けるように入れ替わり、目標を4%ほど行き過ぎてから一度だけ揺り戻して落ち着く。値が跳ね上がるのではなく「水が入れ替わる」ので、増減が量として体に入る。ホバーすればいちばん近い水面に浮きが現れ、たぷんと上下して値を教える。折れ線が線なら、こちらは体積の言語。',
    Component: AreaTide,
  },
  {
    id: 'radar-morph',
    no: 47,
    nameJa: 'レーダーチャートの変身',
    nameEn: 'Radar Morph',
    category: 'アナリティクス',
    trigger: '「今月」「先月」「昨年」を切り替え',
    principles: ['モーフィング', '時間差の変形', '残像'],
    ecology:
      '期間を切り替えると多角形がぐにゃりと形を変える。全頂点が同時に動くとただの拡大縮小に見えてしまうので、頂点ごとに30msずつ開始をずらす——この小さなズレだけが「変身」の生々しさを作る。伸びた頂点は到着の瞬間にきらっと光り、縮んだときは前の形が残像として薄く残って消える。何が伸びて何が落ちたかを、比較表なしで語る標本。',
    Component: RadarMorph,
  },
  {
    id: 'funnel-drip',
    no: 48,
    nameJa: 'ファネルの滴り',
    nameEn: 'Dripping Funnel',
    category: 'アナリティクス',
    trigger: '「再生」をクリック',
    principles: ['受け渡し', '重力', '霧散'],
    ecology:
      '各段が満ちると、その底からしずくが三粒ぽたぽたと落ちて次の段に注がれ、次の段が満ちはじめる。同時に、落ちきれなかったぶんは両脇へ霧のように散って消えていく。数字の差を引き算で見せるのではなく、水が「渡った量」と「こぼれた量」として見せるので、どこで漏れているかが体で分かる。最下段まで届いた水は、誇らしげに一度ぷるんと弾む。',
    Component: FunnelDrip,
  },
  {
    id: 'sparkline-ecg',
    no: 49,
    nameJa: 'スパークラインの心電図',
    nameEn: 'ECG Sparkline',
    category: 'アナリティクス',
    trigger: '「正常値を流す」「異常値を流す」をクリック',
    principles: ['ストリーミング', '静けさとの対比', 'フラッシュ'],
    ecology:
      '値が流れ込むたび波形は1点分だけ左へずれ、正常なあいだはごく浅い呼吸をするだけで何も主張しない。だからこそ、しきい値を超えた値が来た瞬間の変化が効く——波形の先端がピクッと跳ね、白い光が線上を走り抜け、数字が太く濃くなり、カードの縁が一瞬締まる。過ぎ去った異常値は濃い点として画面外へ流れ去るまで居残る。監視画面の作法は、9割の静けさが1割の警告を際立たせること。',
    Component: SparklineEcg,
  },
  {
    id: 'cash-bridge',
    no: 50,
    nameJa: '収支の橋',
    nameEn: 'Cash Bridge',
    category: 'アナリティクス',
    trigger: '「再生」「別の週」をクリック',
    principles: ['因果のリレー', '符号を向きで語る', '結論の着地'],
    ecology:
      '期首の柱が立つと、その肩から次の柱へ細い線が架かり、渡った先で内訳が生える。増えた分は肩の上へ伸び、減った分は肩からぶら下がって斜線になる——符号を色ではなく伸びる向きで語るので、単色でも「どちらに効いたか」が読める。内訳が終わると、期末だけは積み上げの続きではなく床から立て直され、着地でとんと沈んで据わる。差がどこで生まれたのかを、積み木が肩を貸していく連鎖として辿らせる標本。',
    Component: CashBridge,
  },
  {
    id: 'share-dilute',
    no: 51,
    nameJa: '持ち分の希薄化',
    nameEn: 'Diluting Share',
    category: 'アナリティクス',
    trigger: '「次のラウンド」をクリック',
    principles: ['ゼロサムの押し合い', '抵抗と余韻', '失った幅のゴースト'],
    ecology:
      '総量の変わらない帯に、新しい層が幅ゼロの楔として割り込む。押される側は行き過ぎて縮んでから、わずかに押し返して落ち着く——譲ったのであって、消えたのではない。自分の層は、痩せる前の右端が破線のゴーストとして一拍だけ残り、失った幅そのものが目に焼き付く。パーセントの数字は帯より一瞬早く着地して先に結論を言い、面積があとから余韻を担当する。「増資した」ではなく「薄まった」を体で分からせる標本。',
    Component: ShareDilute,
  },
  {
    id: 'threshold-alarm',
    no: 52,
    nameJa: 'しきい値越えのドキッ',
    nameEn: 'Threshold Alarm',
    category: 'アナリティクス',
    trigger: '「静か」「越える」「戻る」をクリック',
    principles: ['状態ではなく変化を鳴らす', '静けさとの対比', '注釈の刺し込み'],
    ecology:
      '平常時は薄く細い線が引かれているだけで、グラフは何も主張しない。しきい値を跨いだ瞬間だけ、越えた区間が太く濃い線に持ち上がり、しきい値線自身がびりっと1px震え、跨いだ点に輪がひとつ広がって「ここで起きた」を刺す。越えているあいだは区間が静かに明滅し続け、戻ると震えではなく一度だけ息をついて細さに収まる。鳴らすのは「越えている状態」ではなく「越えた・戻った変化」だけ、という監視画面の作法をそのまま動きにした標本。',
    Component: ThresholdAlarm,
  },
  {
    id: 'pending-commit',
    no: 53,
    nameJa: '予約と一斉確定',
    nameEn: 'Pending & Commit',
    category: '入力',
    trigger: '札を選んで「確定する」',
    principles: ['予備動作', '時間差の押印', '締め'],
    ecology:
      '選んだ札は破線のまま浮いて浅く呼吸する——まだ効いていないし、まだ戻せる。確定すると、選んだ順に押印が大きく落ちてきて実寸に締まり、インクが一度だけにじみ、札は実線になって1px沈む。最後の押印が終わった直後、束全体がひとつに締まって「今週ぶんが閉じた」を1拍で言う。確定済みをもう一度押すと首を横に振って断る。「選んだ」と「効いた」のあいだにある予約という状態を、呼吸→押印→締めの3拍で見せる標本。',
    Component: PendingCommit,
  },
  {
    id: 'allocation-seesaw',
    no: 54,
    nameJa: '総量固定の配分',
    nameEn: 'Allocation Seesaw',
    category: '入力',
    trigger: 'レーンの ＋ をクリック',
    principles: ['ゼロサム', 'たわみと譲り', '断り'],
    ecology:
      'どれかを増やすと、必ずどれかが減る。受け取る側は素直に伸び、譲る側だけ戻り成分のあるイージングでたわんでから引き下がるので、奪われたことが動きの質感で分かる。上の総量バーは決して伸びず、配分が動いた合図として光がひとつ横切るだけ——「増やしたのに全体は増えていない」を毎回同じ絵で念押しする。どこからも取れないときはボタンを無効化して黙るのではなく、押せて、レーンごと首を横に振って断る。',
    Component: AllocationSeesaw,
  },
  {
    id: 'diff-arrow-mood',
    no: 55,
    nameJa: '前週比矢印の感情',
    nameEn: 'Moody Diff Arrow',
    category: 'アナリティクス',
    trigger: '「別の週」をクリック',
    principles: ['スカッシュ&ストレッチ', '跳ねない下降', '迷い'],
    ecology:
      '上向きはぴょこんと跳ね上がり、頂点で縦に伸びてから着地でわずかに沈む。下向きは跳ね返さずぽとりと落ち、着地で一度縮んでしぼむ——戻ってこないことを、跳ねないことで言う。横ばいは左右にゆらゆら迷ってから水平に落ち着き、「変化なし」を無表情ではなく決めかねた態度として見せる。単色なので「良い＝緑」に逃げられず、動きの質と着地後の濃さだけで温度を伝える。だから解約率や負債のような「上がると困る指標」も、矢印の向きは事実のまま、濃さの意味だけを入れ替えれば済む。',
    Component: DiffArrowMood,
  },
  {
    id: 'quest-tracker-slide',
    no: 56,
    nameJa: 'クエスト目標の差し替え',
    nameEn: 'Sliding Quest Tracker',
    category: 'ゲーム',
    trigger: '「進める」を繰り返す',
    principles: ['ひと筆書き', '速い退場と遅い登場', '席の受け渡し'],
    ecology:
      'ゲージが満ちるとチェックがひと筆書きで描かれ、描き終えた札は迷わず上へ抜ける。入れ替わりの主役は「消えた」ことではなく「次が来た」ことなので、退場は速く、せり上がりは少し行き過ぎてから着地する。控えの目標は1段ずつ繰り上がり、薄れながら奥に並んで「あと何が残っているか」を保ち続ける。新しい札が定位置に落ち着いてから、はじめて進捗バーがゼロから伸びる——最後に目に残るのが、次に積むものになる。',
    Component: QuestTrackerSlide,
  },
  {
    id: 'unlock-door',
    no: 57,
    nameJa: '新機能アンロック',
    nameEn: 'Unlocking Door',
    category: 'ゲーム',
    trigger: '「条件を満たす」を3回クリック',
    principles: ['進捗を錠の高さで語る', '重力', '原因と結果の分離'],
    ecology:
      '条件がひとつ灯るたびに掛け金が3分の1ずつ持ち上がる。開く前から「あと何が足りないか」が錠の高さとして読めるので、錠は障害ではなく進捗計になる。最後の条件が灯った瞬間、掛け金は一度跳ねて外れ、自重で回りながら枠の外へ落ちていく。扉はそれを見届けてから、蝶番を軸に奥へ逃げながら開く——原因（条件が揃った）と結果（解禁された）を同時に動かさないことで、因果が読める。中身は最初から在り、閉じているのは扉のほうだと分かるように、開ききってから名乗る。',
    Component: UnlockDoor,
  },
  {
    id: 'annotation-stamp',
    no: 58,
    nameJa: '注釈ピンの打刻',
    nameEn: 'Stamping Annotation',
    category: 'アナリティクス',
    trigger: '「再生」「別の系列」をクリック',
    principles: ['加速して当たる', '波紋', '打刻と開札の分離'],
    ecology:
      'ピンは浮かび上がらない。上から加速して落ち、当たった瞬間に横へ潰れてドンと刺さり、点から波紋がひとつ広がる。札は一拍おいてから、柄の先を蝶番にしてひらっと開く——先に「ここで何かが起きた」を刺し、あとから「それが何か」を読ませる順序になる。複数の出来事は時間差で打たれるので、打刻の順序がそのまま前後関係になる。折れ線の値そのものは静かなまま、文脈だけが事件として刻まれていく。',
    Component: AnnotationStamp,
  },
  {
    id: 'news-preview',
    no: 59,
    nameJa: '予告と発効',
    nameEn: 'Pending Headline',
    category: 'ゲーム',
    trigger: '「週を進める」を繰り返す',
    principles: ['揺れ＝未確定', '止まって確定を言う', '濃度＝効力'],
    ecology:
      '見出しだけの薄い紙が、効くよりも先に貼られる。まだ効いていないから紙は薄く、留めは1点だけ——だから端がいつまでもかすかに揺れている。発効が近づくと揺れの周期が速まり、待たされている時間そのものがそわそわに変わる。発効の瞬間、紙は減衰して止まるのではなく1拍で角度ゼロに固定され、それからインクが左から右へ入って本文が確定する。止まったあとでもう1枚のテープが留まり、揺れない理由が絵として残る。動いている＝まだ効いていない、止まっている＝もう効いた、という対応を最後まで崩さない標本。',
    Component: NewsPreview,
  },
  {
    id: 'confirmed-paper',
    no: 60,
    nameJa: '確定と含みの二層',
    nameEn: 'Paper Gain',
    category: 'アナリティクス',
    trigger: '「相場が動く」→「確定する」',
    principles: ['呼吸＝未実現', '振幅＝確度', '落ちて固まる'],
    ecology:
      'ひとつの数字を、実線の土台（確定）と破線の上乗せ（含み）に割って持つ。含みの側だけが浅く呼吸し、境界の破線が流れ続けるので、同じ画面の中で「もう動かない分」と「まだ動く分」が見分けられる。相場が振れると呼吸の振幅そのものが増し、確度の低さが幅として手に伝わる——数字は同じでも、危うさが違うことを言える。確定すると、まず呼吸が現在値で止まり、破線が1pxだけ落ちて実線になり、上乗せの数字が本体へ滑り込んで桁が繰り上がる。増えたことではなく、動かなくなったことを祝う標本。',
    Component: ConfirmedPaper,
  },
  {
    id: 'runway-sand',
    no: 61,
    nameJa: '残りの砂',
    nameEn: 'Irreversible Sandglass',
    category: 'ゲーム',
    trigger: '収支を切り替える / 砂時計をクリック',
    principles: ['速度が量を語る', '不可逆', '静かな終わり'],
    ecology:
      '砂の落ちる速さが、そのまま毎月の焼け方になっている。黒字なら筋は消えて砂は止まり、赤字が深いほど粒の間隔が詰まって筋が太くなる——残量ではなく速度が危機感を運ぶので、同じ残高でも「あと何ヶ月か」が一目で違って見える。粒が着地するたび砂時計はわずかに沈み、下の山が盛り上がっていく。残り3ヶ月を切ると上球の縁が鼓動しはじめ、拍が速まる。ひっくり返そうとして掴むと、少しだけ回りかけてから首を横に振って戻る——時間は買い戻せない、というルールを禁止ではなく仕草で言う。尽きたときも派手には鳴らさず、ひと呼吸おいて静かに色が落ちる。',
    Component: RunwaySand,
  },
  {
    id: 'tooltip-magnet-dot',
    no: 62,
    nameJa: 'データ点の磁力ツールチップ',
    nameEn: 'Magnet Dot Tooltip',
    category: 'アナリティクス',
    trigger: 'グラフの上をなぞる',
    principles: ['最寄りへの吸着', 'ばね追従', '減衰でフォーカス'],
    ecology:
      'カーソルの生の座標には従わない。x が最も近いデータ点ひとつを選び、そこへ吸着する——連続なカーソルを、離散な意味の単位に翻訳している。選ばれた点はぷるんと1.9倍に膨らみ、外側の輪は脈打たずに静止して「いまここ」を指す。ほかの点は薄まる。主役は光らせて作るのではなく、脇を引かせて作る。破線のガイドが先に0.18sで動き、ツールチップは0.34sのばねで後から追う——先に「どこ」、あとから「いくつ」。点から点へ乗り移るとき、箱は滑り続けたまま中身の文字だけが一瞬薄れて戻る。値が別物に入れ替わった合図を、動きを止めずに鳴らしている。離れると点はしゅっと縮み、ツールチップは膨らまずに縮んで消える。探索の動きは何十往復もするので、退場が主張してはいけない。',
    Component: TooltipMagnetDot,
  },
  {
    id: 'pie-pull-out',
    no: 63,
    nameJa: '円グラフの切り分け',
    nameEn: 'Cake Server Pie',
    category: 'アナリティクス',
    trigger: 'ピースの上にカーソルを置く',
    principles: ['出は速く戻りは粘る', '減衰でフォーカス', '割り込み前提の遷移'],
    ecology:
      'ケーキサーバーで一切れ取るように、触れたピースが自分の角度の二等分線方向へ14px抜け出す。出は0.30sで行き過ぎ、戻りは0.42sで粘る——この非対称が「取った」と「戻した」を別の動作として感じさせる。手前に来たことは影ではなく縁の濃さで言う。ほかの3枚は薄まるだけでなく半径を2px縮める。主役が出たぶん、脇が引く。中央の数字は合計から内訳へ、上へ抜けて下から入れ替わる。隣のピースへ移ると、前のピースは戻りきる前に引き返す——探索の動きは最後まで再生されないのが常態なので、keyframes ではなく transition で書く。いま居る場所から補間できることが、触り続けられる動きの条件になる。',
    Component: PiePullOut,
  },
  {
    id: 'sankey-stream',
    no: 64,
    nameJa: 'サンキーの水流',
    nameEn: 'Streaming Sankey',
    category: 'アナリティクス',
    trigger: '流路の上にカーソルを置く（触らなくても流れている）',
    principles: ['常時アニメーション', '量の二重符号化', '薄めるが止めない'],
    ecology:
      '触らなくても動き続けている標本。粒は帯の中をさらさらと流れ、その密度と速度は帯の太さから計算される——太い流路ほど粒が密で速い。幅を読まなくても量が分かる、単色の図鑑がもう一本手に入れた量の語り口になっている。ホバーすると、その流路だけ流速が1.8倍になって濃くなり、上流と下流のノードも連鎖で濃くなる。触れた帯ではなく、その帯が属する経路全体が浮かび上がる。ほかの流路は0.25まで薄まり、流れも遅くなる——が、止まらない。止めた瞬間それは「主役でない」ではなく「死んでいる」に見えるからで、常時動く画面における減衰には下限がある。動きを減らす設定では粒を消さず、散らばった位置のまま凍らせる。',
    Component: SankeyStream,
  },
  {
    id: 'causal-relay',
    no: 65,
    nameJa: '因果のリレー',
    nameEn: 'Causal Relay',
    category: 'アナリティクス',
    trigger: '「再生」「別の週」をクリック',
    principles: ['原因と結果の分離', '直列の因果・並列の帰結', '取り分で語る'],
    ecology:
      '同時に確定した出来事は、並べただけでは「全部が一度に起きた」に見える。この標本は上段に原因の配分（区画の幅＝投じた資源）、下段に結果の軸を置き、区画がひとつ押し込まれるたびに、その原因が動かした帯だけが±0の線から一斉に伸びる。原因どうしは厳密に直列、ひとつの原因が動かした結果は並列——この組み方だけで「どれがどれを動かしたか」の対応が、番号を追う前に体で分かる。帯は色ではなく伸びる向きで符号を語り、望ましくない結果だけ斜線になる。行の合計は帯が伸び切ってから遅れて浮き上がる：先に「どう動いたか」、あとから「いくつになったか」。幅の物差しは行ごとに独立で、読ませるのは絶対量ではなく「その軸で動いた量の取り分」。資源を使わなかった原因も細い区画で残る——使わなかったことも配分の一部だから。',
    Component: CausalRelay,
  },
  {
    id: 'line-measure',
    no: 66,
    nameJa: '数値行の物差し',
    nameEn: 'Line Measure',
    category: 'アナリティクス',
    trigger: '「再生」「別の週」をクリック',
    principles: ['行ごとの物差し', '継ぎ足しと遅延ゴースト', '集計しない'],
    ecology:
      '数字の行そのものに、その数字だけの物差しを敷く。満幅の意味は行ごとに違う——分母を持つ数字（進捗12/45、商談3/4、0〜100の指標）はその分母、持たない数字（現金・人数・ユーザー）は動く前と後の大きいほう。だから行をまたいで長さを比べることはできず、読めるのは「その数字がどこまで来たか」と「今週動いたぶんはそのうちどれだけか」の2つだけ。複数の行を1つの図に集計しないので、単位の違うものを同じ物差しに載せる嘘が生まれない。地は最初から引かれていて、満ちてから動いたぶんが遅れて名乗る——増えたぶんは満ちた先へ継ぎ足して灯り（No.16 経験値バー）、減ったぶんは失う前の位置に斜線で残ってから薄れる（No.13 HPバーの遅延ゴースト）。数字の括弧と物差しの区画が同じことを二度言うので、読み飛ばしても取りこぼさない。',
    Component: LineMeasure,
  },
  {
    id: 'undo-unravel',
    no: 67,
    nameJa: '取り消し猶予のほどけ',
    nameEn: 'Undo Unravel',
    category: '入力',
    trigger: '「アーカイブ」→ 猶予中に「元に戻す」',
    principles: ['猶予は linear で刻む', '浮いている＝まだ効いていない', '戻り道を圧縮して跡を残す'],
    ecology:
      'アーカイブした札は、押した瞬間には効かない。5秒のあいだ1pxだけ浮いたまま、縁を縫っている糸が端からほどけていく——残り時間をゲージの残量ではなく、形が崩れていく量で語る標本。ほどけは linear で刻む。猶予は物理ではなく契約なので、図鑑の看板であるオーバーシュートをここに入れると残り時間の読み取りが嘘になる（この標本には「ぷるん」が一箇所も無い）。残り20%で縫い目の間隔が詰まり、糸が2回まばたいて焦りを出す。5秒経つと糸は消えるのではなく張り詰めて実線の縁になり、同時に札が1px沈んで文字が薄くなる：動いている＝まだ効いていない、止まった＝もう効いた。取り消すと糸は逆再生ではなく0.45sに圧縮して縫い戻り、札は跳ねずに元の位置へ吸い戻る——猶予5秒をそのまま巻き戻すと取り消しに5秒かかることになるので、往路と復路で時間の意味を変えている。戻ったあとには縫い跡が0.8s残って薄れる。跡が無いと「取り消した」ではなく「最初から何も起きていない」に見え、操作が届いたことにすら気づけない。ほどけの進行だけは CSS ではなく JS が持っている：動きを控える設定では CSS アニメーションが潰れるので、猶予の見た目まで一緒に消えてしまうと、5秒後の確定だけが理由なく訪れることになる。残り時間は装飾ではなく情報なので、減らす対象から外してある。',
    Component: UndoUnravel,
  },
  {
    id: 'effect-lag-shadow',
    no: 68,
    nameJa: '効き始めるまでの影',
    nameEn: 'Effect Lag Shadow',
    category: 'アナリティクス',
    trigger: '「施策を打つ」→「次の週へ」を繰り返す',
    principles: ['押しても動かさない', '距離＝確度', '消えずに線へ吸われる'],
    ecology:
      '施策を打っても、線は動かない。効くのは3週先だから——けれど「押したのに何も起きない」は故障にしか見えないので、代わりに別のものを動かす。ボタンから波紋が広がり、時間軸の「効き始める位置」に薄い影の弧がにじみ出る。落ちてくるのではなくその場で浮かび上がるのは、影が未来から借りてきた形だから。影は置かれてからずっと呼吸していて、その振幅と濃さは現在位置からの距離で決まる：遠い影は薄く大きく揺れ、近づくほど濃く浅くなる。呼吸の浅さがそのまま確度の高さになるので、あと何週かを数えなくても「もうすぐ効く」が体で分かる。週を進めると現在線が右へ滑り、実線が1点ぶん伸びる。到達した週では、まず呼吸が止まり（動いている＝まだ効いていない、の約束はここでも守られる）、影は消えるのではなく線に吸われる——影が薄れていくのと入れ替わりに、線がその高さまで持ち上がる。同じ週に2つ到達したときは80msずらす。同時に上げると2件が1件に見えてしまい、重ねた意味が消えるからで、押した回数は持ち上がりの段数として残る。',
    Component: EffectLagShadow,
  },
  {
    id: 'optimistic-rollback',
    no: 69,
    nameJa: '楽観のあと出し訂正',
    nameEn: 'Optimistic Rollback',
    category: 'フィードバック',
    trigger: '「次の結果」を仕込んでスイッチを押す',
    principles: ['未確定の合図を強く出さない', '逆再生にしない', '向きで巻き戻しを言う'],
    ecology:
      '押した瞬間、もう成功したように動く。通信の返事を待たずに先に効かせてしまう楽観的更新を、動きの側から引き受ける標本。ここだけ図鑑の約束をひとつ破っている：No.59 / No.60 は「まだ確定していないものは揺れる・呼吸する」を語彙にしたが、この標本の未確定は呼吸しない。楽観的更新の目的は待ちを消して本当らしく見せることなので、未確定の合図を強く出したら本末転倒になる——揺らした時点で「失敗しそう」に見え、待たせているのと変わらなくなる。だから合図は縁のごく薄い破線と1px深い影だけ、言われれば気づく程度に留める。成功が返っても祝わない。破線が実線になって浮きが着地するだけで済ませる（もう押した瞬間に祝ってあるので、二度祝うと嘘が増える）。失敗が返ったときだけ、動きが本題になる。まずスイッチがたわみ、それから横へ6px引き剥がされて元の位置へ戻る——往路の弾みと違い、復路は跳ねない。逆再生にしないのは、同じ道をそのまま戻すと「取り消した」ではなく「最初から何も起きていない」に見え、自分の操作が届かなかったことにユーザーが気づけないから。カウンタの数字は増えるとき下から湧き、戻るときは上から落ちてくる。向きが違うだけで、同じ −1 が「減った」ではなく「巻き戻した」に読める。成功していた位置には薄い輪郭が0.9s残って、どこまで行っていたかを見せてから消える。返事待ちの最中にもう一度押したら、黙って無効にせず小さく首を横に振る。',
    Component: OptimisticRollback,
  },
  {
    id: 'pending-queue',
    no: 70,
    nameJa: '保留の行列',
    nameEn: 'Pending Queue',
    category: '入力',
    trigger: '「送る」を連打する / 回線を切って戻す',
    principles: ['詰まりを長さで語らない', '積むのは強く・抜けるのは弱く', '一斉に流さない'],
    ecology:
      '返事を待たずに次を押せる標本。押すたびに札が列の後ろへ積まれ、返事が返るたび先頭から1枚ずつ抜けていく。図鑑で初めて「自分の操作が複数同時に飛んでいる」状態を扱う——No.69（楽観のあと出し訂正）は保留中の再押下を首振りで断って逃げたが、実際のUIでは押下は溜まるので、断るのではなく列として見せる語彙が要る。肝は詰まりを長さで語らないこと。待ち件数の数字や行列の長さは、進捗バーと同じ罠（残量の表示）に落ちる。代わりに列全体が弓なりにたわむ：札 i の下げ量は SAG·sin(π(i+0.5)/n)、SAG は枚数に比例して最大16pxまで深くなり、札の傾きはその接線を取る。待たせている重さが、長さではなく歪みで伝わる。誰が起こしたかは緩急で分かれている：積むのは自分なので0.32sのぷるんで潰れて着地し、抜けるのは向こうの都合なので0.5sで跳ねずに上へ抜ける。同じ列の上で、自分の操作にだけオーバーシュートがある。先頭の1枚だけが「いま飛んでいる」印としてごく薄い破線の縁を持つが、呼吸はしない（No.69 の則の継承）。回線を切ると返事が止まり、押したぶんだけたわみが深くなる——切れていることは文字ではなく、列の上の線が実線から破線に変わることで言う。戻すと0.6sの間を置いてから220ms間隔で順に流れ出す。一斉に流すと、詰まっていた事実が一瞬で消えてしまう：ほどけていくところまでが標本の中身になっている。抜けた札は0.8sだけ跡を残す。',
    Component: PendingQueue,
  },
  {
    id: 'revised-past',
    no: 71,
    nameJa: 'さかのぼり訂正',
    nameEn: 'Revised Past',
    category: 'アナリティクス',
    trigger: '「遅れて届く」をクリック',
    principles: ['消して差し替えない', '訂正された区間だけが鳴る', '上げも下げも同じ緩急'],
    ecology:
      '確定したはずの過去が、遅れて届いたデータで書き換わる標本。No.67〜69 のずれはぜんぶ「これから効く」＝未来方向だったが、ダッシュボードで日常的に起きるのは逆向きのずれ——読み終わった過去のほうが訂正される場面。肝は黙って差し替えないこと。読み手はもう旧い値を読んで覚えているので、差し替えを演出しないと「自分の記憶違い」に見えてしまう。旧い値は消えず、その高さに1pxの縁が残り、新しい実体が0.6sでその外／内へ滑り込む。上げも下げも同じ緩急にしてある：訂正は祝い事でも事故でもないので、方向で速さを変えると事実に評価が混ざる。訂正された棒だけが訂正の0.12s前に2px沈んで一度低く鳴り、周りの6本は1pxも動かない（固定スケールなので、そもそも計算が起きない）。2本の訂正は90msずらす——同時に動かすと2件が1件の出来事に見える。合計は棒より0.25s遅れて追い、増は下から湧き、減は上から落ちる。W3が+16でW6が−18なので合計は−2：片方が増えても全体は減ることがある、が向きの違いとしてそのまま見える。跡は動きの中にだけ残す——0.9sで輪郭が薄れきったあと、訂正された棒と最初からその値だった棒に見た目の差は一切ない。実物を見て直したのは輪郭の前後関係だった。下方向の訂正しか見ていないと気づけないが、上方向では旧い縁が新しい実体の「中」に来るので、背面に置くと塗りに飲まれて跡が消える。前面へ出し、塗りの上に来るときだけ線の色を地の側へ反転させている——跡が読めることを優先して色は変え、太さ・尺・消え方は変えていない。',
    Component: RevisedPast,
  },
  {
    id: 'others-hand',
    no: 72,
    nameJa: 'よその手が入る',
    nameEn: "Someone Else's Hand",
    category: 'フィードバック',
    trigger: '眺める（他者が勝手に動く）/ 行にホバー',
    principles: ['遅さで「向こう側の人」を言う', '割り込みは断らず譲る', '自分は強く・他者は弱く'],
    ecology:
      '図鑑の71種はぜんぶ「変化を起こすのは自分」を前提にしていた。この標本だけ、画面を触っているのが自分ひとりではない。他者を出すのに使えるのは名前でも色でもなく（モノクロで、実在の名前は書かない約束）、動きの遅さと弱さだけ。他者のカーソルは320msごとの離散更新で目標座標が飛び、その間を0.34sのトランジションが埋める——だから自分のカーソルのようにピタリと追従せず、常にわずかに遅れて滑る。この遅れが「向こう側の人」の唯一の説明になっている。他者が書き換えた値は0.55sで跳ねずに差し替わり、旧い数字は0.8sゴーストで残る。行の左端には触られた印の帯が伸び、留まって、引く：変更を光らせるのではなく、場所で言う。肝は割り込みの扱いで、自分がホバーしている行に他者の変更が来たとき、即座には適用しない。行の右端に新しい値が薄い破線の札で待ち、カーソルが離れた0.25s後に滑り込む。No.54（総量固定の配分）は入らないものを「断る」で答えたが、ここは断らずに順番を譲る——待たされるのは他人の変更のほうで、自分の読みは中断されない。待っている札は破線と数字だけで、呼吸はしない（No.69 の則）。去りぎわはフェードで消さず、いた場所に輪が広がって薄れる。同じ画面に自分のホバー（0.3sのぷるんで2px持ち上がる）と他者の書き換え（0.55sで跳ねない）が並ぶので、強弱の差がその場で読める。ひとつ実物を見て直したのは、そのホバーの表し方だった。初稿は持ち上がりと同時に地を一段暗くしていたが、その色が図鑑カードの地とちょうど同じで、触った行だけが背景に溶けて消えていた。持ち上がりは影で言い、地の色は変えない。',
    Component: OthersHand,
  },
  {
    id: 'scroll-baton',
    no: 73,
    nameJa: 'スクロールのバトン渡し',
    nameEn: 'Scroll Baton',
    category: 'ナビゲーション',
    trigger: 'スクロールする（ホイール / ドラッグ / 補助ボタン）',
    principles: ['予備動作を持てない（逆走で意味が壊れる）', '対称に壊れない誇張だけを使う', '受け渡しは重ねる'],
    ecology:
      '図鑑72種で唯一トリガーに使っていなかったのがスクロール。ここだけ再生ヘッドをユーザーが握っている。その一点で、図鑑の看板である「行き過ぎて戻る」が原理的に使えなくなる——巻き戻せる動きに予備動作を仕込むと、逆走したとき「これから起きること」の予告が「さっき起きたこと」の位置に現れて意味が壊れるから。オーバーシュートを取り上げられた場所で何が代わりに気持ちよさを作るか、が確かめたかったこと。答えとして3つ使っている。ひとつめは受け渡しの重なり。バトン（正方形→円→横棒と姿を変える小さな図形）は3パネルを通してDOM上ただ1つの要素で、生成も破棄もしない。送り手の見出しは 1-0.75·clamp(p/0.6) で退き、受け手は 0.25+0.75·clamp((p-0.4)/0.6) で出るので、p=0.4〜0.6 の窓では両方が半分見えている。交代の瞬間を作らないことが、途切れなさの正体になっている。ふたつめは速度由来の誇張だけを使うこと。スクロール速度の指数移動平均を ±22 にクランプした vc から skewY(vc·0.28deg) と縦伸び 1+|vc|·0.006 を作る。これが逆走で壊れないのは、傾きが速度の符号で自然に反転するから——「これから行く方向へ予め傾く」予備動作ではなく「いま動いている方向へ引き伸ばされている」随伴だから、巻き戻しても意味が正しいまま残る。位置と誇張はレイヤーを分けてある：位置を持つ外側の要素には transition を1つも書かず（だから止めれば止まり、戻せば巻き戻る）、120msで0へ戻る唯一の時間依存は内側の入れ子だけが持つ。みっつめは跡と受け皿。出発点には輪郭が opacity 0.35·e で濃くなりながら残り、到着点には受け皿の破線が p≥0.45 から現れる。この2つが同時に読めることには、実物を動かして初めて分かった幾何の条件があった。跡は自分の出発点に固定されているので、スクロールがその点を追い越すと画面外へ出る。受け皿は逆に p≥0.45 まで現れない。つまり出発点がパネルの上寄りにあると、受け皿が出てくる頃には跡がもう消えていて、両方が読める瞬間が1フレームも存在しない。両立させるには出発点のローカル位置がパネル高の45%より下——ここではビューポート高260pxに対して117pxより下——になければならず、ウェイポイントのyはその条件から逆算して置き直してある。「跡と受け皿が同時に読める」は文章の上ではただの願いだが、実際にはレイアウトの不等式だった。scroll-snap は使っていない——スナップを入れると再生ヘッドを機械が奪い返すことになり、この標本の主題が消える。',
    Component: ScrollBaton,
  },
  {
    id: 'estimate-narrowing',
    no: 74,
    nameJa: '推定の狭まり',
    nameEn: 'Narrowing Estimate',
    category: 'アナリティクス',
    trigger: '「調べる」を繰り返し押す / 「別の市場」で引き直す',
    principles: ['中心を描かない', '確度は幅だけで語る', '行き過ぎは確度の嘘になる'],
    ecology:
      '隠れている本当の値を、測るたびにノイズ込みの帯で言い当てにいく標本。1回目の帯は広く、測るほど狭まる（半幅は 26/√n で、8回目に9.2まで縮む）。No.60（数値行の物差し）は「振幅＝確度」を持っていたが、あれは1つの値が揺れる話で、測定を重ねて幅が縮む話は図鑑に無かった。この標本がいちばん強く守っているのは、中心を一度も描かないこと。中心線でも点でも数値でもいい、描いた瞬間それが答えに見え、推定であることが消える。画面に出る数字は3つだけ——測定回数 n、帯の両端の値、軸の目盛。端の値を出すのは、それが幅の言い換えであって中心の言い換えではないから。帯は生えるのではなく閉じてくる。置かれた瞬間は軸の全幅に opacity 0.10 で広がっていて、そこから両端が内側へ動く。左端480ms・右端560msと尺を変えてあるのは、測定が対称な出来事ではないから——同時に着くと機械の目盛りに見える。緩急は cubic-bezier(0.22,1,0.36,1) で固定し、図鑑の基本イージング（ぷるん）はここでは1箇所も使っていない。確度の帯が行き過ぎるということは「一瞬だけ実際より確信していた」と言うことで、確度についての嘘になる——この標本ではオーバーシュートが意味の側から禁止されている。閉じ終えた帯は呼吸もしない（No.69 の則の継承）。確定していないことは幅そのものが既に言っているので、加えて揺らす必要がない。次の測定が入ると、いまの帯は沈殿層へ0.5sで沈み、端の数値と縦棒を落として幅の情報だけを残す。過去は評価の対象ではないので、沈殿にも緩急を持たせない。この標本のいちばん言いたいことは3本目にある：3本目だけ、半幅は小さいのに真値を含まない帯が出る。真値は描かれていないので、その場では誰も外れに気づけない。後続の帯が別の場所に狭まっていくことで、あとから「あれは外れていた」と読める——狭さは正しさではない。',
    Component: EstimateNarrowing,
  },
  {
    id: 'debt-drag',
    no: 75,
    nameJa: '利子のかかる速さ',
    nameEn: 'Interest-Bearing Speed',
    category: 'フィードバック',
    trigger: '「急ぐ」を押してから、チップやトグルを触る',
    principles: ['報酬は即時・強く、代償は遅延・弱く・広く', '残高は数字ではなく緩急で持つ', '返済も鈍い速さで走る'],
    ecology:
      '図鑑の74種は全部「その場の1回」で閉じていて、前の操作が次の操作の緩急を変える標本が1つも無かった。この標本だけ、動きが操作をまたいで状態を持ち越す。「急ぐ」を押すと進捗が14%一気に伸びる——ここだけは図鑑の基本イージング（ぷるん）で行き過ぎてよい。近道は気持ちいいから選ばれるので、報酬を弱く作ると標本の前提が崩れる。代償はその180ms後に来る。床の下へ薄い層が1枚、跳ねずに左から滑り込み、パネルが1px沈む。この180msが肝で、押した瞬間に視線が置かれている進捗バーからカーソルが離れたあとに、静かに置かれる。以降パネル内の全ての尺が calc(var(--base-xxx) * var(--drag)) で作られているので、1回につき7%ずつ、チップの跳ね（220ms）もトグルの滑り（300ms）もバーの伸び（260ms）も一様に鈍る。鈍りは1つの部品では読めない——だからチップという意味のない、触れるだけの部品が3つ置いてある。手ざわりの本体は速さではなく跳ね返りのほうにある：drag が 1.15 / 1.45 を越えるたび、チップとトグルの緩急が cubic-bezier(0.34,1.56,0.64,1) → (0.34,1.22,0.64,1) → (0.32,1.06,0.64,1) と、オーバーシュート量を落としながら差し替わる。重くなるとは遅くなることではなく、跳ね返らなくなること。「返す」は現在の鈍い速さのまま走り、層が抜けきってから初めて drag が割り戻される——返済のあいだも負債を体で感じるところまでが中身なので、ここを速くしてはいけない。返済はタダでもない：進捗が6%後退し、その後退は跳ねない（祝いもしないし、悔しがらせもしない）。8枚で頭打ちになり、そのことは床の線が1pxから2pxに太くなることだけで言う。負債の量を示す数字は画面に1つも無い。完了の演出も drag 倍で鈍る：急いで着いたほど、着いた瞬間が重い。',
    Component: DebtDrag,
  },
  {
    id: 'familiar-shorthand',
    no: 76,
    nameJa: '見飽きたぶんだけ短くなる',
    nameEn: 'Familiar Shorthand',
    category: 'フィードバック',
    trigger: '「受け取る」を繰り返す / 「間を置く」で冷ます',
    principles: ['削るのは前置きだけ', '結果の拍は不変', '慣れは全部は戻らない'],
    ecology:
      'No.75（利子のかかる速さ）で図鑑に初めて「操作をまたいで持ち越す状態」が入った。持ち越すのは負債だけではない——慣れもそう。この標本は同じ報酬演出を受け取るたびに短くしていくが、尺を一律に縮めると「速いだけの同じ動き」になって慣れの表現にならない。だから削る対象を拍で分ける。演出は溜め（台座が身構える）・じらし（輪郭が上空で迷う）・着地（メダルが落ちる）・余韻（輪がひと巡り広がる）の4拍でできていて、削られるのは前置きと余韻だけ。着地の340msには4段階の最後まで手をつけない——初回の長い前置きは結果の重みを教えるためにあり、教え終わった相手に同じ授業を繰り返すことが二度目以降は「待たせる」に変わる。しかし結果を削った瞬間、それは慣れではなく手抜きになる。削り方にも順序があって、最初に半分になるのはじらし、次に消えるのもじらし。溜めはギリギリまで細く残る——予備動作を完全に失うと着地が「どこからか飛んできた」に見えるからで、4回目以降でようやくゼロになる。何が削られたかは舞台の下の拍の物差しが正直に見せる：いまの尺が実体、初回の尺が破線の輪郭で、段が上がるたび実体が0.3sかけて縮む。着の拍だけ濃く塗られ、縮まないことがひと目で分かる。「間を置く」と慣れは2段だけ冷める。全部は戻さない——一度教わったことは忘れきらないし、久しぶりに触ったのに初回の授業を丸ごとやり直されるのは、それはそれで待たされるから。',
    Component: FamiliarShorthand,
  },
  {
    id: 'motion-triage',
    no: 77,
    nameJa: '同時に鳴ったときの順番',
    nameEn: 'Motion Triage',
    category: 'フィードバック',
    trigger: '主役を選んで「届く」を押す',
    principles: ['先に動いたものが主役', '従者は遅く・弱く・短く', '同時のデータと順番の描画を分ける'],
    ecology:
      '図鑑の76種はぜんぶ「画面に標本が1つだけ」で成立してきた。実際のUIでは通知・数値更新・リスト挿入が同じ瞬間に届き、全部が素の緩急で跳ねると何も読めなくなる——図鑑がこれまで避けてきた「動き同士の衝突」を正面から扱う最初の標本。1回の「届く」で3つの状態は本当に同時に更新する。ずらすのは描画の遅れだけで、データが同時であることと動きに順番があることは分けてある。主役は遅れゼロ・340ms・素のぷるんで動き、2番手は260ms遅れて振幅半分・跳ねないease-outで続き、3番手は440ms遅れて振幅1/4、ほぼ差し替えに見える弱さで終わる。遅らせる量が肝で、120msでは同時に見え、400msを越えると無関係な2つの出来事に割れる。2番手の260msは「別の出来事だと分かるが、同じ原因から来たとまだ読める」幅として置き、3番手はそこから180ms——2番手が動き終わる肩口に置いて、玉突きのリズムを作っている。振幅と尺も遅れと同じ向きに削る：あとから来るものが長々と大きく動くと、結局主役を食ってしまう。ベルの振り子は主役なら±14°、3番手なら±3.5°しか揺れない。そしてどれが主役かは大きさでも色でも位置でもなく「先に動いたかどうか」だけで言う。主役セレクタを切り替えても見た目は1pxも変わらない——効くのは次に届いたときの順番だけで、同じ3つの変化が、最初に動くものを替えるだけで別の意味の出来事に読める。',
    Component: MotionTriage,
  },
  {
    id: 'compound-snowball',
    no: 78,
    nameJa: '複利の雪だるま',
    nameEn: 'Compound Snowball',
    category: 'アナリティクス',
    trigger: '「積む」を繰り返す / 「転がす」で自動、「止める」で決算',
    principles: ['同じ操作・育つ増分', '重さは着地に出る', '止まった瞬間に自重で沈む'],
    ecology:
      'No.75（利子のかかる速さ）が持ち越す負債なら、これは持ち越しの明るい側。「積む」を押すたび、いまの山の高さの13%ぶんの板が上へ載る。操作はずっと同じ1回なのに増分だけが回を追うごとに育ち、最初の数枚は誤差にしか見えず、10枚目あたりから急に厚みを持ち始める——複利のグラフを縦軸で見せる代わりに、増分そのものを積み木にして手で確かめる標本。数字は1つも出さない。あちらが残高を動きの鈍さで語ったのに対し、こちらの残高は板の厚みそのものが語るからで、枚数が数えたければ互い違いの濃淡が目盛の代わりをする。板の重さは着地に出る：薄い板はことんと即座に座り、厚い板は落ちる尺が220msから350msへ伸びて、座る肩口で山全体がどすんと沈み込む。潰れの深さも板の質量に比例（1.5〜7%）していて、後半は1枚載るたびに山が身震いする。「転がす」と勝手に積み続け、間隔が620msから8%ずつ縮んで加速していく——複利の加速は増分の厚みと積む速さの両方で言う。終わりは2通りあってどちらも同じ儀式で締める：上限に届くか、指で止めるか。転がりが止まると山は一拍おいて2px沈み、戻らない。跳ねもしない——成長の演出はここまで散々跳ねてきたので、決算は重さだけで終わる。止めた瞬間のこの沈みが、積み上げてきたものに初めて質量の実感を与える。',
    Component: CompoundSnowball,
  },
  {
    id: 'stack-reorder-weight',
    no: 79,
    nameJa: '積み上げ棒の並び替え',
    nameEn: 'Reorder with Mass',
    category: 'アナリティクス',
    trigger: '「値順に並べる」⇄「名前順に戻す」',
    principles: ['距離が弧と尺を決める', '質量が潰れを決める', '発火は左から55msずつ'],
    ecology:
      'ソートで6本の棒が一斉に席を替わる。全部を同じ緩急で同時に飛ばすと1つの塊が滑ったようにしか見えない——並び替えのアニメーションが「動いたことは分かるがどれがどこへ行ったか分からない」に落ちるのは、たいていこの一斉が原因。この標本は群れの振り付けを3つの物理で割る。ひとつめは距離：遠くへ移る棒ほど長く飛び（340msに1席あたり60msを足す）、高い弧を描く（8pxに1席あたり7px）。隣へ1席ずれるだけの棒はほとんど滑るだけで、5席飛ぶ棒は大きく放物線を描く——移動量の違いが軌跡の違いとして残るので、着地後も「どれが大移動だったか」が目に残っている。ふたつめは質量：背の高い棒ほど重いので、着地の潰れが深い（背丈に比例して5.6〜9.5%）。軽い棒はことんと座り、重い棒はぐしゃっと潰れてから立ち直る。みっつめは順番：発火を新しい席の左から55msずつ遅らせて、同時到着の群れに読む順を与える——この手筋は No.77（同時に鳴ったときの順番）から引いた。弧はtransitionでは作れないので、棒を3層に分けてある：横滑りだけを持つ層、同じ尺で縦に持ち上がる層、着地の潰れを持つ層。横と縦を別々の緩急で走らせると、合成された軌跡が放物線になる。そして席が変わらない棒は1pxも動かない。全部が動く画面では何も読めないので、動かない棒があることが、動いた棒の意味を作っている。',
    Component: StackReorderWeight,
  },
  {
    id: 'paper-press',
    no: 80,
    nameJa: '紙の押し込み',
    nameEn: 'Paper Press',
    category: '入力',
    trigger: '右の紙ボタンを押す・長押しする（左は対照のぷるん）',
    principles: ['潰すのは一瞬・戻るのは遅い', '跳ねない', '影は本体より遅れて戻る'],
    ecology:
      '図鑑でいちばん小さい標本。回転も拡大もオーバーシュートも使わず、押すと90msで1px沈んで0.985倍に締まり、押している間は沈んだまま、離すと320msかけてゆっくり浮く。往路が速く復路が遅いのは紙の物理そのもので、潰すのは一瞬、繊維が戻るのは遅い。影は本体より60ms遅れて開く——芯が戻ってから、ふちが戻る。押している間だけインクがわずかに濃いのは、繊維が詰まるぶんだけ文字が締まって見える紙の癖。ぷるんが1箇所も無いのは手抜きではなく語彙の選択で、書類・承認・お金のような「軽く扱われては困る操作」では、跳ねた瞬間に手続きの重みが抜ける。No.73〜75が「基本イージングが意味の側から使えない場所」を巡った回だとすれば、これはその最小の帰結——使えないのではなく、使わないほうが強い場所がある。ただし静けさは単体では読めない。動きが無いことは、跳ねる隣人がいて初めて「抑えている」に見える。だから隣に図鑑の看板（ぷるん）を対照として置いた：左が図鑑の平常運転、右がこの標本で、同じ指の動きに対する返事の違いだけを見る。標本本体はJSを1行も使っていない——:activeと、押すとき／離すときで長さの違うtransitionが2組あるだけ。80種の最後に置くには小さすぎる標本かもしれないが、図鑑の76〜79が持ち越し・同居と概念を重ねてきたあとで、いちばん短い答えがいちばん静かな動きだったことは、締めとして悪くない。',
    Component: PaperPress,
  },
  {
    id: 'reverse-midflight',
    no: 81,
    nameJa: '行きかけて、やめる',
    nameEn: 'Mid-flight Reversal',
    category: '入力',
    trigger: '開き切る前に、もう一度押す（上段は対照）',
    principles: ['いま居る場所から引き返す', '尺は残りの距離で決まる', '帰り道は跳ねない'],
    ecology:
      '同じ指令が同時に届く2つの引き出しを上下に並べてある。上が対照（@keyframes を打ち直すだけの素朴な実装）、下がこの標本（transition + 現在位置の読み取り）。見た目は1pxも違わない——違うのは中断されたときの振る舞いだけ。開き切る前にもう一度押すと、対照は反対の端まで**ワープしてから**走り直す。keyframes は 0% から刻まれた台本なので、打ち直せば必ず台本の頭から再生されるからで、実測で152px飛ぶ。標本は1pxも動かずにその場から引き返す。やっていることは3手だけ：getComputedStyle の transform を DOMMatrixReadOnly で読み、transition: none でその位置に固定し、強制リフローで確定させてから、逆向きの行き先と新しい尺を張り直す。尺は残りの距離に比例させる（max(160ms, 戻る距離/240 × 960ms)）。10%しか進んでいないものを引き返すのに全尺を使うと、指の動きに対して返事が遅すぎる——舞台の下の物差しが、そのとき張られた尺を実体で、全尺を破線で見せている。帰り道の緩急も往路とは別物に差し替える：減速のみの cubic-bezier(0.22, 0.61, 0.36, 1)。反転の瞬間、物体はもう動いているので ease-in を入れると一度止まって見えるし、行き過ぎ（ぷるん）は「着いた」の合図であって、気が変わって戻ってきたことは到着ではないので祝わない。ぷるんが出るのは中断されずに端まで走り切ったときだけ。この標本は企画を一度作り直している。初稿は図鑑の標準どおり520msの往路にぷるん（cubic-bezier(0.34, 1.56, 0.64, 1)）を敷いていたが、実測すると150msで既に89%——あの緩急は序盤で一気に進むので、人が「開きかけ」を押し返せるようになる250〜350msには、もう着いてしまっていた。中断が主題の標本なのに、中断が機械の速度でしか成立しない。そこで引き出しを重いものとして作り直し、往路を960msの cubic-bezier(0.45, 0.05, 0.25, 1.35)（ゆっくり出て、着地で行き過ぎる）に替えた。いまは300msの時点で x=88px、道半ばで押し返せる。**中断できる動きにするには、実装だけでなく尺と緩急も中断できる形でなければならない**——机上では出てこなかった、この回いちばんの収穫。',
    Component: ReverseMidflight,
  },
  {
    id: 'coalesce-repeat',
    no: 82,
    nameJa: '同じ返事は束ねる',
    nameEn: 'Coalesced Reply',
    category: 'フィードバック',
    trigger: '「更新」を連打する（左は対照）',
    principles: ['先頭は即返す', '続きは拍を増やさず振幅を育てる', '件数は数字にしない'],
    ecology:
      '「更新」を押すと、同じ返事が返る。1回のクリックが左右に同時に届き、左（対照）は1クリック=1返事を律儀に守る——8連打すれば8回ぴくつき、何が起きたのか読めなくなる。右（標本）は拍を1つに保ったまま、届いたぶんだけ振幅を育てる：6 → 9 → 11.5 → 13.5 → 15px と増分を逓減させながら頭打ちにし、実測で山（上向きの折り返し）は8連打でも1つだけ。左右は影も単発の振幅（6px）も同一に揃えてあるので、違いが出るのは連打したときだけ。ここで大事なのは、束ねることと待たせることを混同しないこと。窓が閉じるまで返事を溜めると、束ねられてはいるが「押しても何も起きない」UIになる——だから先頭は遅延ゼロで返す（実測37msで動き出す）。以後220msの窓に入ったクリックは新しい拍を立てず、いま進行中の跳ねの高さだけを押し上げ、窓は最後のクリックから220ms延びる。連打が続く限り1つの拍が育ち続け、止まって初めて跳ね返さずに着地する。実装の肝は @property で --amp を <length> として型登録したこと。型が付くとカスタムプロパティ自体に transition が効くので、transform: translateY(calc(-1 * var(--amp))) は animation を一度も打ち直さずに、いまの高さから次の高さへ滑らかに伸びる。animation を打ち直せば必ず拍が増え、束ねた意味がその瞬間に消える。緩急は全区間で減速のみに統一してある：育っている最中に次のクリックが割り込む標本なので、オーバーシュートを持たせると割り込みの瞬間に跳ね返りの向きが逆転し、数えられる山が増えてしまう。そして回数の数字はどこにも出さない。境界線は図鑑の中にある——No.17（コンボ）は連打の1回1回が中身なので束ねてはいけないし、No.70（保留の行列）は返事待ちの件数が中身なので列として見せる必要がある。ここが扱うのは「同じひとつの状態を N 回報告してしまう」場合だけで、そのとき件数は情報ではない。束ねてよいかどうかは動きの問題ではなく、その繰り返しが意味を運んでいるかどうかで決まる。',
    Component: CoalesceRepeat,
  },
  {
    id: 'catch-inertia',
    no: 83,
    nameJa: '滑っているものを掴む',
    nameEn: 'Catch the Glide',
    category: '入力',
    trigger: '帯を投げて、滑っている途中で掴む（「掴めない」で対照）',
    principles: ['触れた瞬間に権利は指へ戻る', '停止に演出をつけない', '端はゴムで受けて跳ねない'],
    ecology:
      '投げた帯が惰性で滑っている、その途中に指が触れる。正しい答えは「その場で、即、止まる」——尺ゼロ。この標本でいちばん誘惑が強いのは、止まりに 120〜150ms の減速をひと匙足すことで、単体で見るとそのほうが上品に見える。しかし指を置いた側から見ると、押さえた物がまだ 3〜4px 動いてから止まるので、掴み損ねた感触になる。止まりに尺を与えるとは「あなたの手より、いま走っている演出のほうが偉い」と言うことで、そこだけは譲ってはいけない。だから合図も動きでは出さない：影のオフセットが 1px 縮むだけ（90ms）で、止まったという事実そのものを返事にしている。実装は No.81 と同じ3手——`getComputedStyle` の transform を `DOMMatrixReadOnly` で読み、`transition: none` で固定し、強制リフローで確定させる。惰性そのものは rAF ループではなく transition 1本で書いてある：放した瞬間の速度 v(px/ms) から距離を v×260 で出し、尺を |距離|×1.6ms（上限1100ms）、緩急は減速のみの cubic-bezier(0.16, 0.84, 0.44, 1)。摩擦を毎フレーム計算しなくても、速度から「どこまで・どれだけかけて」を1回決めれば惰性は成立する——そして transition で書いてあるからこそ、途中で掴める。掴んだあと離すときは、掴む前の速度を引き継がない。手が触れた時点で前の投擲は終わった出来事になっていて、そこから先は新しい指の話だから。端は跳ねない：越えた分は 0.35 倍に圧縮して指について来させ、離すと 420ms で吸い戻る。ここでぷるんを使うと端が二度鳴り、「行き止まり」ではなく「弾かれた」に読める。右上の「掴める／掴めない」は、対照を横に並べる代わりに同じ帯で切り替えるかたち。「掴めない」に倒すと、滑走中の指を丸ごと無視する——図鑑が80種を通して前提にしてきた「動きは最後まで再生される」が、実は特別扱いだったことを、この一手で指から確かめられる。',
    Component: CatchInertia,
  },
  {
    id: 'shared-element-carry',
    no: 84,
    nameJa: '同じものが場所を変える',
    nameEn: 'Shared Element',
    category: 'ナビゲーション',
    trigger: 'カードを開く／戻る（右上で対照のフェードに切り替え）',
    principles: ['一度も消さない', '周りは弱く短く退く', '移動を祝わない'],
    ecology:
      '図鑑の83種はぜんぶ「ひとつの部品の中」で閉じていた。画面が入れ替わる標本は1つも無く、つまり図鑑は「AがBになる」を語る言葉を持っていなかった。この標本が埋めるのは、一覧の1枚を開くと詳細になる——いちばん日常的な遷移。主題はひとつで、同一性は形でも位置でも色でもなく、**一度も消えなかったという事実だけ**が担保する。だから主役のサムネは遷移の全区間で opacity:1 のまま、同じ DOM ノードを使い回す（key も変えない、mount/unmount もしない）。動くのは位置とサイズだけで、420ms の cubic-bezier(0.22, 0.61, 0.36, 1)——減速のみで行き過ぎない。ここに図鑑の看板であるぷるんを入れると「登場した」に読め、その瞬間に同一性が切れる。移動は到着の祝い事ではない。復路は340msと往路より短い：「選んだ」より「戻るだけ」は軽い。周りの2枚は主役より弱く短く退く（200ms・translateY 10px・遅延0）。退場を主役と同じ強さで演出すると、引き継がれた1枚がどれだったか分からなくなる——No.79 で「動かない棒が動いた棒の意味を作る」と書いたことの、裏返しの適用になる。詳細の本文は主役が着地してから+80msで出はじめ、3本を40msずつずらす。主役が飛んでいる最中に本文が湧くと、目が2箇所に割れて「何が引き継がれたか」が消える。右上の「そのまま／フェードで繋ぐ」が対照で、倒すと主役の特別扱いを一切やめ、一覧層と詳細層を180msでクロスフェードするだけになる。位置もサイズも最終値へ瞬間移動するので**座標は完全に一致している**のに、途中のフレームで一覧と詳細が重なって透ける瞬間があるだけで「差し替わった」に見える。連続性はピクセルの一致ではなく、消えなかったことでしか作れない。実装で効いた設計はDOMの持ち方で、一覧層と詳細層を position:absolute; inset:0 で常時マウントしたまま opacity と pointer-events だけで切り替えている。教科書的な FLIP は「消えたあとの矩形」を測る必要があり、そこで useLayoutEffect のタイミング事故（測る前に描かれてちらつく）が起きるが、両方を常設すれば飛ぶ前も飛んだ先も常に測れる。副産物として border-radius の transition が要らなくなった——到着側の半径（18px）を直接置いておけば、scale がそれを比例縮小して出発側の 8px にちょうど重なる。角丸は運ばなくても、運ばれているように見える。',
    Component: SharedElementCarry,
  },
  {
    id: 'skeleton-handoff',
    no: 85,
    nameJa: '骨から身へ',
    nameEn: 'Skeleton Handoff',
    category: 'フィードバック',
    trigger: '「読み込む」／「速い応答」（右上で寸法・閾値の対照に切り替え）',
    principles: ['骨は実体の型', '行を1pxも動かさない', '速すぎる到着には骨を出さない'],
    ecology:
      '図鑑の「読み込み中」は No.11 のローダーしか無く、あれは待たせている時間の演出で、待ち終わった瞬間の受け渡しは扱っていない。実際に体験を壊すのはそこ。この標本の言い分は、骨（スケルトン）の仕事は待たせることではなく**実体の型を先に置いておくこと**だという一点にある。だから骨と身は同じセルに重ねて置き、寸法は同じ変数から引く。置き換わっても行は1pxも動かない——右端まで伸びる薄い罫が物差しで、ズレが出れば目で分かる（実測でも4行すべて0px）。到着は行ごとにバラす（220 / 480 / 760 / 1150ms）。一斉に置き換えると「読み込みが終わった」というひとつの出来事になってしまい、受け渡しそのものが見えない。置き換えは同寸クロスフェードで、身が160msでにじみ出て（translateYは2pxだけ。これ以上動かすと「新しく登場した」に読める）、骨は120msで薄れる。骨のシマーは1.6sのlinearで、**到着が近づいても加速しない**——進捗を騙る動きは、返ってこなかったときに嘘になる。対照は2つ同居している。ひとつめ「寸法を揃えない」は、骨を実体より12px低く・副題の骨を1本省いた作りにする。置き換わるたび下の行が押し下げられ、実測で12px / 24px / 36pxと累積して飛ぶ（自分より上に何も無い1行目だけは動かない——ズレは自分の骨ではなく、上の行の骨が嘘をついたぶんだけ来る）。読んでいた場所を失うのはこれで、骨が型でないなら骨は出さないほうがましになる。ふたつめは速すぎる到着で、60msで返る「速い応答」を既定では骨を出さずに受ける（閾値200ms）。「閾値なし」に倒すと同じ60msでも骨が一瞬出て消え、速いことがちらつきとして——つまり不安定として見える。いったん骨を出したら最低400msは出したままにするのも同じ理由で、出して即消すのがいちばん汚い。この2つの閾値は動きの設計ではなく**動きを出さない判断**で、図鑑がここまで扱ってこなかった種類の設計になっている。実装では最低表示時間の副作用がひとつ見つかった：220msと480msで届いた2行が、どちらも 200+400=600ms の床に当たって同時に身へ変わる。ちらつきを消す規則が、ばらけて届いた事実のほうを均してしまう——待たせない設計と、順に届いたことを見せる設計は、ここで正面から衝突する。',
    Component: SkeletonHandoff,
  },
  {
    id: 'gap-close',
    no: 86,
    nameJa: '抜けたあとの席',
    nameEn: 'Closing the Gap',
    category: '入力',
    trigger: '行の × で消す／「戻す」（右上で「同時に」の対照に切り替え）',
    principles: ['先に抜く、それから詰める', '下の行は動きたくて動くのではない', '削除は束ねない'],
    ecology:
      'No.84 が「引き継ぐ」、No.85 が「差し替わる」なら、これは**引き継ぐものが何も無い側**——消えた1つと、そのあとに残る席の話。図鑑の83種に、要素が減る標本は1つも無かった（No.79 の並び替えは席を替えるだけで、席そのものは減らない）。主題は、抜けることと席が詰まることは別々の出来事だという一点にある。行は3拍で消える：まず中身だけが240msで右へ22px滑って薄れ（減速のみ・跳ねない）、このあいだ席の高さは空いたまま——下の行は1pxも動かない（実測でも150ms時点で0px）。60msの間を置いてから、席が280msで閉じる。下の行はこれに引かれて52px上がるが、下の行自身にはアニメーションを持たせていない：**席が閉じた結果として動くのであって、動きたくて動くのではない**。閉じ切ったところで、繋がった新しい境界に1本の線が220msだけ濃くなって薄れる。削除は祝い事ではないので、ここが繋がった、とだけ言う。対照「同時に」は、抜けと詰まりを同時に開始するだけ（尺も緩急も同じ）。すると下の行が消えかけの行に乗り上げ、「抜けた」ではなく「潰された」に見える——実測で150ms時点にはもう21px上がっている。違いは開始のタイミングだけで、順序は装飾ではなく、どれが消えたのかという情報そのものになっている。だから動きを控える設定でも順序は残す（transition-duration は潰れても transition-delay は残るので、構造がそのまま生き延びる）。連続して消しても束ねない：1件目の詰まりの最中に2件目を消すと、2件目は自分の3拍を最初から持つ。No.82（同じ返事は束ねる）と正反対だが、そこが対比の芯で、束ねてよいのは繰り返しが意味を運んでいないときだけ——削除は1件1件が別の出来事なので、束ねると何件消えたか分からなくなる。全部消しても枠は畳まない。空の器（破線の「なし」）が同じ高さで受ける：空であることも1つの状態で、器ごと消すとリストの底が抜けて周りのレイアウトが飛ぶ。実装で分かったのは、多拍の骨格はJSのsetTimeoutで刻むよりtransition-delayに持たせたほうが壊れにくいということ。delayが順序を、durationが尺を持つという役割分担が、そのままCSSのプロパティの分かれ方と一致する。もうひとつ、繋がりの合図は消える行ではなく**生き残る隣の行**に属させる必要がある（消える側に置くと、席のoverflow:hiddenに切り取られて、いちばん見せたい最後の1拍だけが見えない）。',
    Component: GapClose,
  },
  {
    id: 'offscreen-handoff',
    no: 87,
    nameJa: '行き先が画面の外',
    nameEn: 'Offscreen Handoff',
    category: 'ナビゲーション',
    trigger: '行の ↗ で外へ送る（右上で「端で消すだけ」の対照に切り替え）',
    principles: ['端に着く前に消え終わる', '証拠は残った側に置く', '方向は矢印ではなく歪みで指す'],
    ecology:
      'No.84 は「同一性は消えないことでしか担保できない」で終わった。この標本はその条件が使えない場所にある——受け皿が画面の外（ゴミ箱・カート・別タブ・通知バッジ）にあるので、渡したものは必ず一度消える。だから引き継ぎの証拠を、飛んでいったもの側ではなく**残った枠の側**に置く。チップは420msの減速のみで飛び、後半180msで薄れて、縁の内側28px手前で消え終わる。ここが要点で、端まで行って overflow:hidden に切り取られるのと、着く前に自分で消え終わるのとでは意味が逆になる——切り取られた側は「画面がそこで終わっていた」だけの事実で、渡ったかどうかを何も語らない。消え終わった直後（420ms）、縁がその一点だけ内側へ7pxたわむ（260ms 加速して減速）。戻りは340msの減速のみで、ここで跳ねさせるとたわみが「弾かれた」に読めて、渡した先が受け取ったのではなく拒んだことになる。たわみの中心yは送った行の中心yに一致させてあり、行ごとに位置が変わる——**方向を矢印なしで指す**とはこのことで、縁のどこが凹んだかだけが行き先の情報になっている。対照「端で消すだけ」は違いが厳密に2箇所（チップが減衰しない／縁がたわまない）で、飛翔の尺・緩急・席の閉じ方は完全に同一の値を使っている。それでも「渡した」ではなく「捨てた」に見える。連続で送っても束ねない（No.86 と同じ理屈で、1件ずつが別の出来事）。重なれば縁の2箇所が同時にたわむだけで、振幅は加算しない——たわみは量ではなく場所の情報だから。席の閉じは飛翔開始から200ms遅らせてある（No.86 の「先に抜く、それから詰める」の踏襲）。実装で効いたのは、たわみの位置をDOM計測ではなく行のindexから解析的に出したこと。送信済みの行は席が閉じきる440msまで配列に残っているので、他の行のindexは送信直後から安定していて、計測に頼らずとも一度で正しい値が求まる。',
    Component: OffscreenHandoff,
  },
  {
    id: 'quiet-mode',
    no: 88,
    nameJa: '動かさずに同じことを言う',
    nameEn: 'Quiet Mode',
    category: 'フィードバック',
    trigger: '「再生」（右上で 動きあり / 潰すだけ / 翻訳する を切り替え）',
    principles: ['潰していいのは尺と反復だけ', '順序は勝手に生き残る', '量は個数へ翻訳する'],
    ecology:
      '図鑑の86種は `prefers-reduced-motion` をグローバルCSSに丸投げして `transition-duration` を潰すだけで済ませてきた。この標本はその処方箋そのものを主題にする。3値トグルの真ん中「潰すだけ」は、グローバルCSSがやっていることを標本の内側に再現したもので、右の「翻訳する」がこの標本の主張。中身は3つの縮小模型で、**潰していい境界線がどこにあるか**を1つずつ実演する。題材1「跳ね」は情報が「更新された」という事実だけなので、潰すと何も起きたように見えない（実測でも transform は終始 none）。翻訳版は尺ゼロで地の濃さが1段変わり900ms保持して尺ゼロで戻る——動きではなく**段階**に言い換える。ここで濃さの変化にトランジションを付けたら負けで、それは「控えめな動き」であって動きでない語彙ではない。題材2「順序」は**対照が負けない例**としてわざと置いてある。`transition-delay`（順序＝情報）は `transition-duration`（尺＝装飾）を潰しても残るので、潰すだけでも0/120/240msの順に現れる（実測 24 / 157 / 274ms）。CSSのプロパティの分かれ方が、情報と装飾の切れ目とたまたま一致している——No.86 で見つけた性質の、正面からの実演。題材3「速度が量」だけが翻訳を要求する。粒の速さと密度そのものが量なので、潰すと2本の帯（量2と量5）は最終的にどちらも粒が消えた空の帯に収束して、見分けがつかなくなる。量という情報が丸ごと消える。翻訳版は速度という担体を捨て、点を量ぶんだけ静止して並べる——読み取れるのは個数だけだが、量は完全に保たれる。3つ並べて分かるのは、reduced-motion の設計とは「全部を潰す」でも「全部を作り直す」でもなく、**担体ごとに潰す・そのまま・翻訳するを見分ける作業**だということ。そして翻訳した語彙は duration に依存しないので、本物の `prefers-reduced-motion: reduce` 環境でもそのまま正しく機能する。それが翻訳という設計の性質そのものになっている。',
    Component: QuietMode,
  },
  {
    id: 'missed-while-away',
    no: 89,
    nameJa: '見ていないあいだに終わったこと',
    nameEn: 'Missed While Away',
    category: 'フィードバック',
    trigger: '「席を外す」→ 裏で値が変わる →「戻る」（右上で「戻った瞬間に再生する」の対照に切り替え）',
    principles: ['戻った瞬間に最終値が読める', '跡は時間で消さない', '基準は最後に見た値'],
    ecology:
      '図鑑の86種はぜんぶ「動いている瞬間、その人が見ている」前提で成立していた。タブは裏に回り、スクロールで画面外へ出て、席は外される——**動きは、見ていた人にしか届かない**。見ていなかった人に要るのは動きの再生ではなく差分の提示、というのがこの標本の言い分。「席を外す」を押すと覆いがかかり、その下で値は**本当に**変わる（600msでA 12→15・B 30→24、1400msでA 15→18）。見えていないだけで向こう側では起きている、を裏切らないために、変化は戻ったときにまとめて作らず実際に走らせてある。「戻る」を押すと覆いが消え、そこで既定モードは**何も再生しない**。値はもう最終値（実測で+0msに 18 / 24 / 7）で、変わった行にだけ跡が残る——地が一段濃いまま、離席時点の値が打ち消し線で隣にいる。跡には2つの決めごとがある。ひとつは基準の取り方で、旧値に出るのは離席時点の12であって中間の15ではない。見ていなかった人にとっての基準は「最後に見た値」だけで、経路は情報ではない。もうひとつは消え方で、跡は時間では消えない。いつ戻ってくるか分からない相手に「何秒で消える」という尺で語ることはできないので、**既読は時間ではなく行為で決まる**——行をクリックして初めて200msで地が戻る。ボタンの名前を「跡を消す」ではなく「読む」にしてあるのはそのため。変わらなかった行（C）には何も起きない。動かない行が、動いた行の意味を作る（No.79 と同じ形）。対照「戻った瞬間に再生する」は、離席時点の値から600msでカウントし、行が320msぷるんと跳ねる。一見親切だが3つを手放している：+0msでは旧値のままなので**見終わるまで最終値が読めない**、再生は1回きりなので**見逃したら二度と分からない**（見ていなかった人向けの設計なのに、もう一度「見ていること」を要求している）、そして変化の有無の区別が**再生中にしか付かない**（実測で1秒後には跡が0行）。No.85 の閾値に続いて、図鑑で2例目の「動きを出さない判断」になる。実装でひとつ副産物が出た：「戻る」は最後の変化が済むまで押せないようにしてある（ラベルは変えず disabled にするだけ）。戻ったあとに値が動くと「戻った瞬間に最終値が見える」という主題そのものが壊れるからで、タイマー側はキャンセルしない——待たせているのは向こう側の時間ではなく、こちら側の観測のほう。',
    Component: MissedWhileAway,
  },
  {
    id: 'offscreen-arrivals',
    no: 90,
    nameJa: 'まだ見えていないところで増える',
    nameEn: 'Arrivals Off-screen',
    category: 'フィードバック',
    trigger: '「届く」で新着が上端の外に積まれる（右上で「そのまま挿し込む」の対照に切り替え）',
    principles: ['読んでいる場所を1pxも動かさない', '見えないものは縁で言う', '気配は消さずに行へ渡す'],
    ecology:
      '図鑑の89種は、変化がいつも見えている場所で起きる。実際のUIでいちばん頻繁に起きるのは見えていない場所での変化で、そこで何も考えずに要素を挿すと、読んでいた行が押し流される——世界中のタイムラインが毎日やっている事故。この標本の答えは2つある。ひとつは、外から来た変化に現在地を触らせないこと。挿入と同じコミットで scrollTop に行1つぶん（52px）を足すだけで、画面上の行は1pxも動かない（実測でも到着の前後で 0.0px、4件連続でも 0.0px）。対照「そのまま挿し込む」は補正の1行を外しただけで、以後は1件届くごとに 52.0px ずつ流れていく。実装で1箇所だけ注意が要る：ブラウザには scroll anchoring（`overflow-anchor`）という同じ仕事をする機能があり、放っておくと対照モードまで勝手に補正されて、標本が主張したい差が消える。だから `overflow-anchor: none` を明示して、補正は自分の手で持つ——ここは「ブラウザが親切にやってくれること」を意図的に取り上げる数少ない場所になっている。もうひとつは、見えない変化を縁で言うこと。上端の外に積まれた件数は小さな気配（▲ N件）が引き受け、出方は弱い：6px下りて160ms、減速のみ、跳ねない。ぷるん（オーバーシュート）は「いま・ここで起きた」の合図なので、見えていない場所の出来事に使うと時間について嘘になる。連打しても気配は上下に跳ね直さず、数字だけが 1→4 と差し替わる（実測でも気配のY座標は 76px から動かない）——拍を増やさない作法は No.82（同じ返事は束ねる）から借りているが、あちらが件数を数字にしなかったのに対し、こちらは数字で出す。繰り返しが意味を運ばないなら件数は情報ではないが、外で増えたものは件数そのものが情報だからで、動きが運べるのは方向と強さまで、という切り分けがそのまま出ている。上端が見えているとき（scrollTop < 8px）は気配を出さずそのまま挿す。見えているものに気配は要らない——No.85 の閾値、No.89 の「再生しない」に続く、動きを出さない判断。そして気配は消えない：上端へ着くと気配は140msで縮んで退き、その80ms後から未読の縦線が上から60msずつ、900msかけて薄れる。順序は transition-delay に持たせてあるので、動きを控える設定でも「気配が役目を終えてから、行が読まれる」という筋は生き残る。消えるのではなく行へ渡る、という点で No.84（同じものが場所を変える）の同一性の議論を、物ではなく情報の側でやっていることになる。この標本は企画を一度直している。初稿には「読みかけ」の行も物差しも無く、実測では 0.0px と 52.0px がきれいに出るのに、画面を見ると対照モードは「リストが1行ぶんスクロールしただけ」にしか見えなかった。行が全部同じ見た目だったからで、失った現在地を目で読むには、読み手が見ていた1行と、動かない基準の2つが要る。いまは5行目に「読みかけ」の印があり、その初期位置を横切る破線がリストの外側の座標系に固定してある。既定では読みかけの行が線に貼り付いたまま動かず、対照では行が線から離れて下へ落ちていく——線と行の距離が、失われた現在地の量そのものになる。**実測できることと、見て分かることは別**というのがこの回いちばんの収穫で、机上の受け入れ条件（0px か 52px か）は満たしていても、標本としては半分死んでいた。',
    Component: OffscreenArrivals,
  },
  {
    id: 'trace-overflow',
    no: 91,
    nameJa: '跡が溜まりすぎたとき',
    nameEn: 'Traces Overflow',
    category: 'フィードバック',
    trigger: '「変化が起きる」で跡が1件ずつ増える／行をクリックで1件読む（右上で「全部そのまま」の対照に切り替え）',
    principles: ['束ねずに畳む', '落とすのは詳しさだけ', '薄れるには下限がある'],
    ecology:
      'No.89（見ていないあいだに終わったこと）は「跡は時間では消えない。既読は時間ではなく行為で決まる」と決めた。正しい判断だが、決めた瞬間に穴が開く——**跡は溜まる**。3件なら読めるものが10件になると、台帳のどの行が最新かも、何が変わったかも読めなくなり、跡は情報からノイズへ落ちる。安易な答えは2つあってどちらも間違い。古い跡を消すのは「読んだ」という嘘になり、「他7件」に束ねると件数は残っても**どの行が変わったか**という位置の情報が消える。この標本の答えは畳むこと：跡を3段階の詳しさに分け、古いものから段を落とす。段1（新しい順に3件）は地が一段濃く、左に濃い縦線、数値の隣に離席時点の旧値が打ち消し線で並ぶ。段2（4〜5件目）は地と縦線だけになり、旧値を落とす。段3（6件目以降）は縦線だけ、しかもそこが**下限**で、それ以上は薄くしない。実測でも10件のとき、旧値を持つ行は3行、地が濃い行は5行、そして**縦線は10行すべてに残る**（濃さは 3d3d3d / 8c8c8c / b3b3b3 の3階調）。落としたのは詳しさであって件数ではない、というのがこの標本の全部で、No.61 の「減衰には下限がある」を時間軸の側で言い直したことになる。段は経過時間ではなく**跡が付いた順位**で決まる。時間で落とすと、たまたま長く留守にしただけで全部が最下段へ沈み、戻ってきた人がいちばん困る場面で情報が消える。実装では順位の配列（新しい順）から段をその都度作り直していて、行の側に段を持たせていない——行が段を持つと、繰り上げのたびに全行を書き換えることになるからで、これは見た目の都合ではなく次の決めごとを守るための構造になっている：**1行だけ読んでも、他の行の段は繰り上がらない**。繰り上げると、読んだ覚えのない行が急に濃くなって「新しい変化が来た」に見える。段が動くのは新しい変化が来たときだけ、という意図的な非対称で、実装上は「読む」が順位配列から1件抜くだけ、段の再計算は変化イベントでしか呼ばない、という形に落ちている。「まとめて読む」は上から60msずつ、順に消える（実測で150ms時点の縦線は 0.02 / 0.16 / 0.61 / 1.00 と階段になっている）。一斉に消すと何件あったかが見えないまま画面が白くなる——No.86（削除は束ねない）の応用で、束ねてよいのは繰り返しが意味を運んでいないときだけ。未読の数字と跡の行数は別勘定にしてある。跡が付いている行は10で頭打ちだが、同じ行がもう一度変わっても事実としての変化は積み上がるので、**行が10しかないのに未読が12件になり得る**。位置は行が持ち、件数は数字が持つ、という担体の分け方がそのまま2本の state になった。対照「全部そのまま」は段を作らず10件すべてを段1で描く。データは同じで見せ方だけが違うのに、10行すべてが濃い地と旧値を持った台帳は、跡のほうが本文より濃くなって在庫の数字が読めない。跡は多いほど強く言うのではなく、**多いほど弱く言わないと情報が死ぬ**。',
    Component: TraceOverflow,
  },
  {
    id: 'focus-travel',
    no: 92,
    nameJa: 'フォーカスはどこから来たか',
    nameEn: 'Focus Travel',
    category: 'ナビゲーション',
    trigger: 'Tab / Shift+Tab（下の「Tab」ボタンでも同じ。右上で「いつも飛ぶ」の対照に切り替え）',
    principles: ['飛べるのは隣まで', '連打中は一度も飛ばない', '現在地は動きの完了を待たない'],
    ecology:
      '図鑑の91種はぜんぶポインタか指で触られる前提で、**キーボードで動かされる標本が1つも無かった**。入口を「部品 × 動きの性格」ではなく入力デバイスに変えると出てくる穴で、埋めてみると3つの決めごとが出た。ひとつめ、**飛べる距離には上限がある**。輪郭が隣のセルへ移る（中心間116px）ときは飛んで経路を見せる——尺は距離に比例（120ms + 距離×0.5ms）、減速のみで行き過ぎない。だが行の折り返し（239px）・格子から出る（148px）・一周して戻る（242px）では飛ばさず、瞬間移動して到着側で 1.06→1 の締まりを120msだけ鳴らす。長い距離を飛ばすと、目が輪郭を追っているあいだに読み手のほうが行き先を見失う。No.85 の閾値、No.89 の「再生しない」に続く、図鑑で3例目の**動きを出さない判断**になる。ふたつめ、**連打は掴めない**。No.83（滑っているものを掴む）は「触れた瞬間その場で止める」が答えだったが、キーボードには掴む手が無い。代わりに入力の間隔で判定する——前回の移動から180ms以内に次が来たら、距離によらず尺ゼロ。実測でも連打中の輪郭は毎回いきなり次の席にいて（50ms時点で移動量が満額の116px）、手が止まったあとの1回だけが軌跡を持つ。判定に使うのは「前回からの間隔」だけで、次を待たない。未来を待って「これが最後かどうか」を決めようとすると、その待ち時間ぶん返事が遅れる——**最後の1回だけが飛ぶ**という見え方は、待った結果ではなく、待たなかった結果として出てくる。みっつめが芯で、**フォーカスは装飾ではなく一次情報**だということ。だからどちらのモードでも、Tabを押した瞬間（+0ms、transition なし）に到着先のセルの地が変わる。輪郭がまだ空中にあっても、いまどこに居るかはもう読める。輪郭が足しているのは「どこから来たか」だけで、「どこに居るか」を輪郭に預けない——No.88（動かさずに同じことを言う）が言う「情報は別の担体へ移す」を、動きを消さないまま先回りで適用したかたち。対照「いつも飛ぶ」は距離も間隔も見ずに常に220msで飛ぶ。連打すると輪郭は一度も席に着かないまま次の目的地へ向かい続け（実測で60ms時点の位置が毎回バラバラの中間座標）、輪郭でフォーカスを読もうとすると原理的に読めなくなる。それでも現在地が分かるのは、地の変化を対照でも殺していないからで、ここを対照でも同じにしてあるのは「動きの善し悪し」ではなく「情報を動きに預けるな」がこの標本の主張だからになる。企画は一度直している。初稿の閾値は240pxで、根拠を「格子の中心から遠いボタンまでの距離」に置いていたが、板が400×260に固定されている以上その距離は最大156pxにしかならず、そもそもコードが見ているのは**直前にフォーカスしていた要素から次の要素まで**の距離だった。比較する量が間違っていたので、閾値を実測の分布（116 / 148 / 239 / 242px）に合わせて130pxへ直した。**距離の閾値は絶対値では企画できず、部品の配置からしか決まらない**——机上で数値を決めてから並べるのではなく、並べてから測るしかない種類の設計がある。',
    Component: FocusTravel,
  },
  {
    id: 'place-lost',
    no: 93,
    nameJa: '読んでいたものが消える',
    nameEn: 'Place Lost',
    category: 'フィードバック',
    trigger: '「向こうで消える」で読みかけの上と下が1件ずつ消える／空席をクリックで1件詰める（右上で「すぐ詰める」の対照に切り替え）',
    principles: ['消えても席は詰めない', '詰まるのは触れたときだけ', '閉じるぶんだけ同じ刻みで現在地を戻す'],
    ecology:
      'No.86（抜けたあとの席）は「先に抜く、それから詰める」で答えが出ている。だがあれは**自分で消したから成立する**——自分の操作の結果なら、消えるものは必ず視線の先にある。他人や再取得の都合で消えたものを同じ速さで詰めると、読んでいた場所そのものが動く。No.90 で禁じたこと（外から来た変化に現在地を触らせない）を、増える側ではなく**減る側から踏む**ことになる。この標本の起点はそこで、埋めてみると企画の側にひとつ非対称が見つかった。**席を残さなければならないのは、読んでいる行より上で消えたときだけ**。実測でも、対照「すぐ詰める」では上で1件消えると読みかけの行が **-52.0px** ずれ、下で1件消えても **0.0px** のまま動かない。同じ「すぐ詰める」でも、消えた場所が上か下かで読み手が払う代償が違う——No.86 が正しかったのは、自分で消す限り消える場所を選べたからで、他人の都合で消える場合それが選べない。既定「席を残す」では、中身だけが180msで薄れ、席（52px）はその場に残る。だから上でも下でも読みかけの行は **0.0px**（+0ms でも +1200ms でも）。ここで効いているのは、**席を残すことが scrollTop 補正の要らない解法**だということ。補正は DOM の外側の状態を触るが、席を残すのはレイアウトの内側で完結する。下で消えたものにも席を残しているのは現在地のためではなく、**何が消えたかを読ませるため**——座標は席が守り、事実も席が守るが、守っている理由が上下で違う。詰まるのは時間ではなく行為で決まる（No.89 の「既読は時間ではなく行為で決まる」を、既読ではなくレイアウトに適用した形）。実測でも5秒放置して空席は1件も減らない。いつ戻ってくるか分からない相手に「何秒で詰まる」を約束できないのは No.89 と同じ理屈で、こちらは約束の対象が既読ではなく**行の座標**になっている。空席には上限がある（3件）。4件目が生まれた瞬間、いちばん古い空席が同じ経路で閉じる——実測でも空席は3で頭打ちになり、そのあいだ読みかけの行は 0.0px を保つ。失われるのは「何が消えたか」だけで、現在地は失われない。No.91 の「落とすのは詳しさだけ」を、跡ではなく**席**の側で言い直したことになる。実装でいちばん効いたのは、企画が答えを持っていなかった一点だった。席の縮み（240ms）と scrollTop の引き算を**同じ曲線・同じ rAF ティックから同時に導出する**か、**閉じ終わってから一括で引く**か。受け入れ条件は静止後しか見ないので、数値としてはどちらも 0.0px を返す。だが一括方式は240msのあいだ読みかけの行がいったん52px近く浮き上がり、閉じきった瞬間にガクッと戻る——**この標本がまさに否定したい体験（現在地が失われて、あとから帳尻だけ合わせられる）を微視的に再現してしまう**。同期方式なら閉じている最中も一度もズレない。**静止画の実測では区別が付かない2つの実装が、動かして見ると同じではない**というのがこの回の収穫で、No.90 の「実測できることと見て分かることは別」の裏返しにあたる（あちらは実測が通っても見えなかった、こちらは実測が通っても見え方が違った）。もうひとつ、その同期を実装するには企画に書いていない手当てが2つ要った。席のCSSに元からある `transition: height 240ms` を `transition:none` で明示的に殺すことと、React がクラスを当てるより先にインライン `height` を同期的に書いておくこと。どちらも欠けると1〜2フレームだけ本当に52px跳ねる。これは20ms間隔のポーリングでは見えず、ページ内で毎フレーム記録するレコーダーに切り替えて初めて出た——**実測の粒度そのものが、何が見つかるかを決める**。',
    Component: PlaceLost,
  },
  {
    id: 'taken-there',
    no: 94,
    nameJa: '連れて行かれる',
    nameEn: 'Taken There',
    category: 'ナビゲーション',
    trigger: '「送信」で未入力の項目へ現在地が移る／「元の位置へ戻る」で戻す（右上で「ただ飛ぶ」の対照に切り替え）',
    principles: ['動かしてよいのは頼まれたときだけ', '遠い移動は飛ばさず出発地に印を置く', '戻り道は時間で閉じない'],
    ecology:
      'No.92 は「フォーカスを動かすのは読み手自身」という前提の上に立っていた。実際の UI にはシステムが現在地を動かす場面がある——送信でエラーの位置へ飛ぶ、検索結果へ飛ぶ、次の未読へ飛ぶ。動かされた側は「どこへ来たか」は分かっても**どこから来たかを失う**。しかも距離は定義上遠い（画面外）ので、No.92 の答え（近ければ経路を見せる）が**原理的に使えない**——遠いから飛ばせない、飛ばさないから経路がない。この穴が標本の起点になる。ひとつめの決めごとは、**動かしてよいのは頼まれたときだけ**。「送信」を押した＝「間違いがあれば見せてくれ」と読み手が頼んだ。依頼と移動が同じ操作の中で地続きになっていることだけが、現在地を動かしてよい唯一の根拠になる。No.90 が「外から来た変化に現在地を触らせない」と決めたことの、**唯一の例外がどこにあるか**を1つだけ示す標本で、だからこの板には現在地を動かす経路が送信ボタンしか無い。ふたつめが芯で、**経路は動きでは運べない**。移動は瞬間移動（`scrollTop` への直接代入、transition なし）で、実測でも +0ms の時点でもう目的地に居る（336px → 56px）。代わりに出発地に**しおり**が残る——送信の瞬間ビューポート中央にあった項目の位置に細い横線と「ここを読んでいた」の札が置かれ、これは時間では消えない（5秒後も残っていることを実測）。対照「ただ飛ぶ」は `scrollTo({behavior:"smooth"})` で滑らかにスクロールし、しおりも戻り帯も出さない。実測では +0ms の `scrollTop` はまだ出発地の 336px のままで、330〜360ms かけて目的地へ収束する。この間に流れる内容は読める速度ではないので、**滑らかさが運んでいるつもりの「どこから来たか」は、実際には何も運んでいない**。運べるのは出発地に置いた印だけ、というのがこの標本の主張になる。みっつめ、**戻り道は行為でしか閉じない**（No.89 の系譜）。「元の位置へ戻る ↑7項目上」を押すと出発時の `scrollTop` へ誤差0で復帰し、しおりが200msで薄れて消える。押さない限り帯もしおりも残り続け、自動消滅のタイマーはどこにも書いていない。対照では帯そのものが DOM に生成されないので、出発値は**復元不能**になる。そして到着は動きの完了を待たない——エラー欄の地は +0ms で変わり、その値は既定と対照で完全に一致する（ともに `rgb(234,234,232)`）。ここを対照でも同じにしてあるのは、この標本の主張が「動きの善し悪し」ではなく「経路は動きに預けられない」だからで、地の変化まで変えると論点がぼやける（No.92 で同じ手を使っている）。残りのエラーは動かさずに言う：連れて行かれるのは最初の1件だけで、他は戻り帯の隣に「他2件」と数字で出る。動きが運べるのは方向と強さまで、件数は数字が運ぶ——No.90 の切り分けの再利用。企画は3箇所直している。ひとつは**しおりの対象項目**で、初稿は「送信の瞬間ビューポート中央にあった項目（項目7）」としていたが、可視高250pxのこの板では項目7は上端に接しているだけで、中央（461px）にあるのは項目9だった。**上端にいることと中央にいることを混同していた**。ふたつめはそれに連動する戻り帯の文言で、初稿の「↑5項目上」は誤った項目7を前提にした数字だった。実装は数字を固定せず `bookmarkIndex - targetIndex` から出す形にしてあり、正しい値（↑7項目上）が仕組みの側から出てくる——**数字を仕様に合わせて直すのではなく、仕組みが正しい数字を出すように直す**ほうが、企画の誤りに強い。みっつめは「エラーの印だけは彩度を持たせてよい（既存標本の警告色に揃える）」で、既存92種の CSS を全数走査したところ**彩度を持つ警告色は1つも存在しなかった**（失敗表示すら `#8c8c8c` のグレーで書かれている）。揃える先が無いので彩度を導入せず、枠と「（未入力）」の文言だけでエラーを表す形に直した。**「既存に揃えろ」という指示は、既存を数えてからでないと書けない。** さらに受け入れ条件そのものにも誤りがあった。対照の尺を「400ms以上のはず」と先読みで書いていたが、実測は330〜360ms。これは Chromium の smooth スクロールが移動距離から決めた値で、**実装が握っていない数値を受け入れ条件に固定していた**。主張の本体は尺の絶対値ではなく「既定は +0ms で着いている／対照は着くまで数百ms読めない」という構造の差にある。',
    Component: TakenThere,
  },
  {
    id: 'two-cursors',
    no: 95,
    nameJa: '現在地が2つあるとき',
    nameEn: 'Two Cursors',
    category: 'ナビゲーション',
    trigger: 'Tab / ↑↓ でフォーカス、Enter か行のクリックで選択、マウスを乗せてポインタ（右上で「濃さだけで分ける」の対照に切り替え）',
    principles: ['担体を分ける（囲む・塗る・指す）', '主役は最後に動いた入力が取る', '状態の現在地は入力で強弱を変えない'],
    ecology:
      '図鑑は「選ばれている」の語彙を持っているが、**フォーカスと同居させた標本が1つも無かった**。実際のリストには現在地が同時に3つ居る——キーボードのフォーカス、確定した選択、ポインタが指している行。素朴に全部を地の濃さで表すと、3階調の灰色が隣り合ってどれも読めなくなる。対照「濃さだけで分ける」がそれを再現していて、実測した WCAG コントラスト比は 選択↔フォーカス **1.118** / 選択↔ポインタ **1.149** / フォーカス↔ポインタ **1.027**——**どの2つも見分けがつかない**。しかも1行に複数が乗ると地の色は1つしか取れないので、そこで**情報が2つ消える**（実測でも対照では選択が勝ち、輪郭と ▸ はどちらも opacity 0）。答えの1段目は担体を分けること。フォーカスは**囲む**（輪郭）、選択は**塗る**（地＋左の太い縦線）、ポインタは**指す**（右端の ▸）。3つが同じ行に乗っても互いを消さず、同時に読める。だが担体を分けるだけでは足りない、というのがこの標本の芯になる。**入力デバイスに属する現在地と、状態に属する現在地では、強弱の付け方が違う。** フォーカスとポインタは「いま操作している手」の情報なので、手が変われば主役が入れ替わってよい——実測でもキーボード操作直後は輪郭 **2px** / ▸ **0.35**、マウス移動直後は輪郭 **1px** / ▸ **1** に入れ替わる。しかし選択は**アプリの状態**なので、どの手で触っていようが濃さが変わってはいけない。実測でも選択行の地は両方の状態で `rgb(226,226,222)` で完全に一致する。ここが変わると「選ばれているかどうか」が触り方に依存することになり、**状態の情報が手の情報に汚染される**。だから実装は、選択の描画が主役の判定（actor）を一切参照しない形になっている。No.91 の「落とすのは詳しさだけ」は同じ種類の情報の段付けだったが、こちらは種類の違う3つなので、順位ではなく**役割**で分かれる。弱くするには下限がある（No.91 の系譜）。主役を降りた輪郭は 1px で残り、▸ は 0.35 で残る。そしてこの標本は**「弱い」と「無い」を撃ち分ける**——リストの中にマウスが居るまま主役を降りたときの ▸ は 0.35 だが、本当にリストから出たときだけ 0 になる（実測で確認）。同じく Esc で本当にフォーカスが外れたときだけ輪郭は opacity 0 で消える。薄いのと無いのを同じ見た目にすると、「マウスが外れた」「フォーカスが無くなった」という嘘になる。主役は時間では切り替わらない——マウスを止めて3秒放置しても輪郭は 1px のままで、行為でしか変わらない（No.89 からこの回まで一貫している判断）。実装では実測でしか出ない誤りが2つ出た。ひとつは CSS の詳細度で、`:hover:not(.is-selected)` は `:hover` と `:not()` がそれぞれクラス1つぶんに数えられるため対照モードのクラス指定に**勝ってしまい**、たまたまマウスが乗っている行の地を静かに奪っていた——受け入れ条件が測ろうとしていたまさにその行で。地の色を読んで初めて分かった種類のバグで、目視では「そういう色なのだろう」で通ってしまう。もうひとつは**クリックがフォーカスを盗む**こと。行は `tabIndex` を持たない非フォーカス要素なので祖先へフォーカスが移ることはない、と読んで `preventDefault` を省いていたが誤りで、ブラウザはクリックされた要素から最も近いフォーカス可能な祖先（＝板そのもの）へ既定でフォーカスを移す。結果、マウスでクリックしただけなのに `onFocus` が発火して主役がキーボード側へ倒れていた——**仕様が禁じている経路（クリックは主役を変えない）を、仕様どおりに書いたつもりのコードが踏んでいた**。輪郭の太さが 1px → 2px に変わるのを測って発見している。最後に、輪郭の 2px⇔1px は `outline` で作った。`border` も `box-shadow: inset` も、太さを変えると**行に近い側の縁が一緒に動く**（border は箱の内側の縁が、inset はスプレッド値そのものが線の位置を決めている）。`outline` だけは `outline-offset` が決めるアンカー位置が太さから独立していて、太さが変わっても行に近い側の縁は動かない——伸びるのは反対側だけ。**太らせる線は、どちらの縁を固定したいかで道具が決まる。**',
    Component: TwoCursors,
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
