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
import FilteredOut from './specimens/filtered-out'
import ReturnChanged from './specimens/return-changed'
import OthersPlace from './specimens/others-place'
import SentPlace from './specimens/sent-place'
import ContainerChanged from './specimens/container-changed'
import ResumeStale from './specimens/resume-stale'
import NoPlaceYet from './specimens/no-place-yet'
import PlaceAsRange from './specimens/place-as-range'
import PlaceWithoutRows from './specimens/place-without-rows'
import PlacePlaysItself from './specimens/place-plays-itself'
import PlaceOffscreen from './specimens/place-offscreen'
import PlaceTwoFrames from './specimens/place-two-frames'
import PlaceInCollapsed from './specimens/place-in-collapsed'
import PlaceAtLiveEdge from './specimens/place-at-live-edge'
import PlaceNotLoaded from './specimens/place-not-loaded'
import ResolutionBurst from './specimens/resolution-burst'
import PlaceInHistory from './specimens/place-in-history'
import ReplayNotNow from './specimens/replay-not-now'
import PreviewNotYet from './specimens/preview-not-yet'
import CompareTwoFutures from './specimens/compare-two-futures'
import IrreversibleStep from './specimens/irreversible-step'
import PreviewOutOfDate from './specimens/preview-out-of-date'
import PreviewMissed from './specimens/preview-missed'
import ExpiredByDoingNothing from './specimens/expired-by-doing-nothing'
import PreviewGivesUp from './specimens/preview-gives-up'
import TakenBySomeoneElse from './specimens/taken-by-someone-else'
import UnknownOutcome from './specimens/unknown-outcome'
import AnswerArrivesLate from './specimens/answer-arrives-late'
import CauseUnknown from './specimens/cause-unknown'
import ReaderFillsIn from './specimens/reader-fills-in'
import CauseOffScreen from './specimens/cause-off-screen'
import MostlyDeclared from './specimens/mostly-declared'
import DefinitionChanged from './specimens/definition-changed'
import PastRestated from './specimens/past-restated'
import DeclaredOnDeclared from './specimens/declared-on-declared'
import AsOfMismatch from './specimens/as-of-mismatch'
import CompareAcrossAsOf from './specimens/compare-across-as-of'
import BranchAbandoned from './specimens/branch-abandoned'
import ThinnedToFit from './specimens/thinned-to-fit'

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
  {
    id: 'filtered-out',
    no: 96,
    nameJa: '絞り込みの外に出る',
    nameEn: 'Filtered Out',
    category: 'ナビゲーション',
    trigger: 'チップで絞り込む（読みかけの行はクリックで移せる／右上で「ただ詰める」の対照に切り替え）',
    principles: ['可逆な不在に席は残さない', '可逆性は条件の側に載せる', '守れない座標を黙って0にしない'],
    ecology:
      'No.93（読んでいたものが消える）は**不可逆な不在**を扱い、《席を残す・行為でしか詰めない・上限を設ける》で答えを出した。不在にはもう1種類ある——絞り込み・検索・並べ替えで結果の外に出た行は、消えたのではなく隠れているだけで、条件を戻せば返ってくる。この2つを同じ見た目で描くと、読み手は「自分の見ていたものが消されたのか、隠れているだけなのか」を区別できない。動きの善し悪しではなく**事実の取り違え**が起きる。そして No.93 の答えは**そのままでは使えない**。可逆な不在に席を残すと、絞り込むたびに席だらけになって絞り込んだ意味そのものが消える。だからこの標本は席を残さない——実測でも「在庫あり」適用後のリスト内容高は **408px**（残存12件×34px）ちょうどで、空席は1つも残らない。代わりに外れる行は**上へ14px寄りながら**160msで薄れて抜ける。上は押されたチップの方向で、「条件のほうへ吸われた」を担体で言っている。No.93 の「中身だけがその場で薄れ、席が残る」と、**動いて出ていく／その場に穴を残す**で撃ち分けられる。芯は**可逆性が行の側ではなく条件の側に載る**こと。読みかけの行が結果に残るなら枠内 y を守り（実測 **0.0px**、遷移中の最大偏差も **0.47px** で1フレームも動かない）、外に出たなら守れる座標が存在しない——**そこで黙って0にせず、外に出たと言う**。リスト上端に「読みかけは絞り込みの外（要発注）」の帯が出て、押されたチップの中には読みかけと同じ幅2pxの縦線と「9件を外した」が入る。読み手は自分の現在地の行方を**条件の空間**に見つける。No.94 が「戻り道は出発地に置く」を座標の空間でやったことを、条件の空間でやり直した形になっている。帯もチップ印も時間では閉じない（5秒放置しても両方1個のまま）。「条件を戻す」を押すと外に出ていた行が上から戻り、読みかけの枠内 y は **誤差0.0px** で復帰する。対照「ただ詰める」は差分が厳密に3箇所（scrollTop 補正なし・帯なし・チップ印なし）で、行の消え方と詰まり方の尺・緩急・色はすべて同一の値を使っている。それでも読みかけの行は **-68.0px** 落ちて枠の先頭に着き、外に出たときは行方を語るものが画面に1つも無い（帯・印とも DOM 上 **0個**）。実装で効いたのは補正の一般化で、No.93 の「1件ずつの累計加算」ではなく、**読みかけより上の全 id の高さを毎フレーム同じ式から合算して scrollTop を導出する**形にした（`baseline + Σ exitHeight(t) + Σ enterHeight(t)`）。おかげで2件が同時に外れる場合も、条件を戻して3件が同時に戻る場合も、式が1本で足りる。区切り線を `border` ではなく `inset box-shadow` にしたのも数値のためで、`border` は高さ0の箱でも1px描画されるので「残存件数×34px ちょうど」が崩れる。**そしてこの標本は企画の誤りを1つ暴いた。** 初稿の台帳（12行）では、対照の静止後の差が **0.0px** になる——絞り込みで `scrollHeight` が縮み、`maxScrollTop` が 68px まで下がるので、対照が据え置いた 136px が**ブラウザの自動クランプで 68px へ丸められ、既定の同期補正が出す値と偶然一致する**。対照は「座標を守らない」を実演しているのに、静止後の数値だけを見ると守れているように見えた（遷移中は最大 29.75px ずれていた）。**静止後の実測が偶然一致することがある。** No.93 の収穫（静止後は同じでも、動かすと同じではない）の第2形で、あちらは実装の選択で潰せたが、こちらは**台帳の設計でしか潰せない**——台帳を16行にしてクランプの起きない件数へ組み直したところ、対照の静止後の差は -68.0px として現れた。受け入れ条件の側にも直しが要った。「静止後の枠内 y」だけを見る書き方では、この偶然の一致を検出できない。以後この種の条件は**静止後と遷移中の最大偏差の両方**で書く。もう1つ、ヘッダのチップにバッジが付くと3チップ+トグルが折り返して外形が **347px** になり、330px の予算を超えていた。実測しなければ「340×330に収まる」と申告して見逃していた寸法バグで、詰めて **316px** に収めてある。',
    Component: FilteredOut,
  },
  {
    id: 'return-changed',
    no: 97,
    nameJa: '戻り先が変わっている',
    nameEn: 'Return Changed',
    category: 'ナビゲーション',
    trigger: '「送信」で連れて行かれ、「上で3件消える」で台帳が変わる（右上で「座標で戻る」の対照に切り替え）',
    principles: ['戻り道が保存するのは座標ではなく行', '約束は破れる前に劣化を名乗る', '戻れないときは戻れないと言う'],
    ecology:
      'No.94（連れて行かれる）は、システムが現在地を遠くへ移すとき**経路は動きでは運べない**と結論し、出発地にしおりを置き、戻り帯を行為でしか閉じないものにした。復帰は保存した `scrollTop` へ**誤差0**で戻る。その戻り道には、書いていない前提が1つある——**戻り先が待っていてくれること**。台帳は待たない。連れて行かれているあいだに上で行が消えれば、No.94 の実装は**誤差0で、間違った行に着く**。実測がそのまま主張になっている。対照（＝No.94 の実装のまま）は復帰後の `scrollTop` が保存値と **0.0px** 一致し、着地行は **id=12**——出発した **id=9** ではない。既定は保存するものを座標から**行**に替えたので、復帰後の `scrollTop` は 136px で保存値 238px と **-102px** ずれ、着地行は **id=9** で一致する。**誤差が出ることのほうが正しさの証拠になる。** 数値としては完璧に成功し、体験としては完全に失敗する——**正確であることと、正しいことは別**というのがこの標本の芯で、図鑑がここまで実測を積み上げてきたことへの反証でもある。実装から出た副産物がさらに強い。対照で「元の位置へ戻る」を押すと、`scrollTop` は 238→238 で**画面が1pxも動かない**（3件消えた時点でブラウザの自動クランプが既に保存値と同じ値へ丸めていたため）。押しても何も起きないのに、居るのは別の行。**「戻ったのに画面が動かない」ことが、誤った場所に居続けていることの最も強い証拠になる。** ふたつめは、約束の壊れ方の告げ方。台帳が変わった瞬間（+0ms）に帯の文言が「元の位置へ戻る ↑5項目上」から「（上で3件消えました）」を伴う形に変わる。**押される前に劣化を名乗る。** ここで企画が1つ間違っていた。初稿は「↑7項目上 → ↑4項目上」のように**行数差そのものが動く**と書いていたが、消えた3件はどれも出発行より上なので、出発行と現在地の並び順が**両方3ずつ若返り、差は5のまま動かない**。動いたのは行数差ではなく、その行数差を作るための座標のほうだった。実装は数字を固定せず生存行から毎回導出しているので、正しい値が仕組みの側から出る——No.94 の教訓（数字を仕様に合わせて直すのではなく、仕組みが正しい数字を出すようにする）がそのまま効いた。みっつめ、**戻り先そのものが消えたら、戻れないと言う**。帯は「戻り先が無くなりました — 直前の行へ戻る」に変わり、押すと直上の生き残り（id=8）に着いて、その行に「ここに在った」の印が出る。No.93 の空席の語彙を、時間ではなく**戻り先**の側で再利用した形で、これも5秒後まで消えない。実装でいちばん詰まったのは企画に書いていない一点だった。行を削除すると `scrollHeight` が縮み、削除前の `scrollTop` が新しい上限を超えていると、**ブラウザが `useLayoutEffect` より先に `scrollTop` を自動でクランプする**。だから「現在値から引く」形の相対補正（`el.scrollTop -= 補正`）はブラウザのクランプと二重に効いて、340→136 のような値になる（正しくは 238）。削除前の値を基準に絶対値で目標を計算して直接代入する形に直して解決した。**縮む入れ物の中では、相対補正は自分がいつ効くかを知らない。** 企画側のレビューで2箇所直している。ひとつは台帳を変えるボタンを到着後にしか押せなくしたこと——出発地に居るまま押せてしまうと、読んでいる行がその場で消えて可視集合が1行ずれ、No.93 が禁じたことを図鑑の中で再現してしまう（変化は定義上ぜんぶ画面の外で起きる、というこの標本の前提そのものが導線に現れていなかった）。もうひとつは読みかけの行に**最初から縦線の印を出す**こと。実測は初稿から通っていたのに、着いた行が違うことは行名を読まないと分からなかった——No.90 が一度企画を作り直した理由と同じで、**実測できることと、見て分かることは別**。縦線は既定・対照で完全に同値（2px / `rgb(92,92,92)`）の物差しとして両方に置いてあり、既定で戻ると縦線の行が枠内 y=68px に来て、対照で戻ると縦線の行は枠内 **-34px**——**画面のどこにも無い**。',
    Component: ReturnChanged,
  },
  {
    id: 'others-place',
    no: 98,
    nameJa: '自分のじゃない現在地',
    nameEn: "Others' Place",
    category: 'フィードバック',
    trigger: '「Kが動く」「Rが動く」で他人の現在地が届く（自分は Tab / クリック / ホバー。右上で「同じ担体で描く」の対照に切り替え）',
    principles: ['持ち主が違えば担体を分ける', '他人の現在地は遅れて届く', '他人は主役にならない'],
    ecology:
      'No.95（現在地が2つあるとき）はフォーカス（囲む）・選択（塗る）・ポインタ（指す）を担体で分けたが、**3つとも自分のものだった**。No.72（よその手が入る）は「変化を起こすのが自分ではない」を扱ったものの、他人が**どこに居るか**は扱っていない。共同編集の画面では、他人の現在地が自分の現在地と同居する。自分の担体を他人に流用してはいけない理由は2つある。ひとつ、**動かせないものを動かせるものと同じ見た目にしてはいけない**——自分の輪郭は Tab で動くが、他人の輪郭は何を押しても動かないので、同じ見た目なら読み手は「自分の入力が効いていない」と読む。ふたつ、**他人の現在地は遅れて届く**（No.72 の系譜）。自分と同じ即応性で描くと、ネットワークの遅延がそのまま「自分の操作が重い」に化ける。だから他人は**行の外**に置いた。行の左に固定幅14pxの帯を確保し、そこに短い縦線と1文字のイニシャル（K / R）を出す。実測でも帯の矩形の右端は **484px**、行の左端は **485px** で、1pxも重なっていない。他人が居る行の自分の担体は一切変化しない——`outline-width` は **0px**、地の色は誰も居ない行と完全に同値、`▸` は存在しない。対照（他人も自分と同じ輪郭で、同じ即応性で描く）では、同じ行の `outline-width` が **1px** になり、**輪郭を持つ行が2つ同時に立つ**。人を濃さで分けなかったのは No.95 の実測（3階調のコントラスト比 1.02〜1.15）があるからで、ここで分けているのは**文字と、帯の中の高さ**だけ。遅れは欠陥ではなく事実の表示なので、尺そのものが情報になっている。「Kが動く」を押した **+0ms** の時点で K の縦線はまだ旧位置（`translateY(8px)`）に居り、260msの間を置いてから220msかけて新位置（`translateY(104px)`）へ運ばれる。自分の移動は **+0ms** でもう新しい行に居る（No.95 の踏襲）。**他人の現在地は、いま向こうで起きていることの数百ms前の姿でしかない**——それを自分と同じ速さで描いた瞬間、嘘になる。芯は3つめで、**他人は主役にならない**。No.95 の「主役は最後に動いた入力が取る」は自分の手2つ（キーボードとポインタ）の間の規則であって、他人の入力は自分の手ではない。実測でも既定では K が3回続けて動いても自分の `outline-width` は **2px のまま不変**で、対照では **1px に落ち**、K の行が **2px** を取る——読み手から見れば、自分のフォーカスが勝手に動いたのと区別が付かない。実装はこの非対称を素直に写していて、輪郭の主役判定だけがモードで分岐し（既定は自分の入力だけを見る／対照は最後に動いた者を見る）、ポインタの主役判定は常に自分の入力しか見ない。既定のレンダリングパスが対照用の状態を一度も読まないので、対照の経路が既定へ漏れない（No.95 では、仕様が禁じている経路をコードが踏んでいたのが実測で出ている。ここでは踏んでいないことを測って確認した）。人数が増えたら畳む。同じ行に3人以上いるときは縦線を1本にして「+2」と数える——No.91「落とすのは詳しさだけ」を、時間ではなく**同時性**の側で言い直した形で、落とすのは「誰が」であって「何人が」ではない。離席は縦線が200msで薄れて消えるだけで、行は動かない（実測でも全8行の y の変化は **0.0px**）。帯を常に確保してあるのはこのためで、**他人の不在で自分のレイアウトが動いてはいけない**（No.90 の系譜）。企画が答えを持っていなかった「居るが場所が不明」の状態は**扱わないと決めた**——専用の記号を足すと3担体+1帯の語彙から外れ、この標本の主題（現在地には持ち主がいる）がぼやける。実測の側でも罠が1つ出た。Playwright の `click()` はクリック座標にカーソルを残すので、オーバーレイの開閉のあとに別の行がその座標に重なると、`mousemove` を一度も発火させずに CSS の `:hover` だけが乗る。実装は正しく（React 側の主役は動かず `▸` も出ない）、**測り方のほうが嘘をついていた**。この標本を測る者はカーソルを退避させてから読むこと。',
    Component: OthersPlace,
  },
  {
    id: 'sent-place',
    no: 99,
    nameJa: '自分の現在地を人に送る',
    nameEn: 'Sent Place',
    category: 'ナビゲーション',
    trigger: '自分の板で行をクリックして読みかけを移し、「送る」を押す（右上で「座標を送って飛ばす」の対照に切り替え）',
    principles: ['送るのは座標ではなく行の同一性', '指し直せなかったことは受け手にだけ言う', '受け手の現在地は行為でしか動かさない'],
    ecology:
      'No.98（自分のじゃない現在地）は、他人の現在地が**届く側**だけを扱った。送る側は未収録だった。「ここ見て」を渡すとき、何を渡すのか——候補は3つあり、**3つとも不正解になりうる**。座標を送れば No.97 が示したとおり相手の台帳では別の行を指す（実測でも、自分の `scrollTop` 130px を送ると K の枠内 y=26px に来るのは「発注書の承認」で、送ったのは「見積りの確認」——**別の行**）。行の id を送っても、相手の台帳にその行があるとは限らない（絞り込みの外か、権限で見えない）。条件ごと送れば相手の現在地を奪う——No.94 の「動かしてよいのは頼まれたときだけ」を**他人に対して**踏むことになる。頼んだのは送り手で、動かされるのは受け手だから、依頼と移動が地続きではない。この標本の答えは、送るのは行の同一性で、**指し直すのは受け手の側**。指し直せなかったことは**受け手にだけ**言う。K の帯は3通りに撃ち分かれる——見える行なら「呼ばれています ▸ ここへ行く」、絞り込みの外なら「条件を外して行く」（No.96 で決めた「可逆性は条件の側に載せる」を、他人からの依頼で使い直した形。条件を戻す操作と行へ行く操作は1手に畳んでよい）、権限で無い行なら `▸` そのものが出ない（実測で `▸` の個数は 1 / 1 / **0**）——**押せない導線は出さない**（No.97 の「戻れないときは戻れないと言う」の系譜）。芯は3つめにある。**送り手が知ってよいのは「渡した」までで、「見えた」は受け手の情報。** 「あなたが指した行は相手には見えません」を送り手に返すと、それは**「その行はあの人には見せられない」という台帳の権限構造そのもの**を、台帳を読む権限のない相手に配ることになる。動きの善し悪しではなく事実の漏洩で、実測がそれをそのまま示す——既定の送り手の帯は3ケースとも `"渡しました"` で**文字列が完全に一致**（`===` で確認）。対照では3つとも異なり、権限のケースは `"Kは権限がないため見えません"` と、K の権限状態を名指しする。対価は正直で、**送り手は空振りに気づけない**。その対価は受け手の行為で払う——K の「見えないと返す」を押して初めて送り手の帯が `"Kは開けませんでした"` に変わる（押されるまでは5秒放置しても `"渡しました"` のまま）。**開示は権限の持ち主の行為で閉じる**。No.94 の「行為で閉じる」を、座標ではなく**情報**の側でやった形になっている。他人の遅延は No.98 をそのまま踏襲した。送った **+0ms** で自分の帯は出るが、K の帯は 260ms 置いてから 220ms かけて現れ（実測で `transform` が動き出すのが 260〜268ms、収束が 482ms）、その間も**押されるまで K は 1px も動かない**（帯が出てから3秒放置して `scrollTop` は 52→52）。押すと尺ゼロで着地する（37フレームのサンプリングで現れた値は `[52, 26]` の2つだけ、中間状態なし）。対照は差分が厳密に3箇所（送る中身・届いたときの即時移動・送り手への返り）で、K は **+0ms** で飛ばされ、K が読んでいた行は枠外（`yTop=-26`）へ出る。実装で1つ、企画が答えを持っていなかった点が出た。**自分の読みかけ（id）と自分の表示位置（scrollTop）を結びつけると、対照が実演できなくなる。** 「クリックした行が自分の板でも枠内 y に来るよう揃える」親切設計にすると、自分の `scrollTop` はその行の `offsetTop` 止まりになり、対照が「その座標を K に代入して K を枠外へ飛ばす」ために必要な大きさに届かない——**揃えるほど送れなくなる**。読みかけの選択と表示位置を最初から無関係な状態として分離して解決した。**この標本の主張（座標は行の同一性の代わりにならない）が、実装の形にそのまま現れている。** ふたつめは寸法で、スクロールする `ul` 自身に `border` を持たせると border-box の内側の実効高さが 104→102px に減り、行の y も `maxScrollTop` も両方ずれる（No.96 のクランプの偶然一致と同系統の罠）。枠と地と角丸をスクロールしない親へ移して解決した。みっつめは**目で見るまで出なかった誤り**で、板のタグ（自分 / K）と絞り込みチップをスクロール領域に重ねて置いていたため、**どの行が1行目に来ても行名が読めなかった**。受け入れ条件は13項目すべて通っていた——測っているのが `scrollTop` と y 座標だけだったからで、**この標本の主題（どの行を指しているか）そのものが画面で読めないことは、1つも検出できていなかった**。',
    Component: SentPlace,
  },
  {
    id: 'container-changed',
    no: 100,
    nameJa: '入れ物のほうが変わる',
    nameEn: 'Container Changed',
    category: 'ナビゲーション',
    trigger: '幅のつまみを掴んで動かす（「回転」は離散の変化。右上で「座標を保つ」の対照に切り替え）',
    principles: ['連続な変化には連続な補正、離散な変化には尺ゼロ', '保つのは行の上端（読む向きの側）', '保てているうちは黙る'],
    ecology:
      'No.97（戻り先が変わっている）は現在地を壊す主語として**台帳**を撃ち、No.98 は**他人**を撃った。第3の主語が残っている——**入れ物**。画面幅が変われば行が折り返し、行高が変わって、保存した `scrollTop` は全部嘘になる。台帳は1行も変わっておらず、他人も居ないのに、現在地だけが動く。そして **No.97 の答え（尺ゼロで行 id へ飛ぶ）がそのままでは使えない**。リサイズは連続な入力で、しかも読み手が握っている（No.73 スクロール駆動と同じ性質）。尺ゼロの飛びを毎フレーム適用すると、掴んで動かしている最中に中身が跳ね続ける。この標本の芯は**現在地の持ち方は1つでよく、適用の仕方だけが入力の連続性で決まる**こと。持ち方は No.97 のまま（行の同一性）で、毎フレーム「読みかけ行の上端が枠内 y=56px」を満たす `scrollTop` を実測から導出して代入する。飛ばないのではなく、**飛ぶ必要がない**——補正が入力と同じ連続性を持つので、実測でも幅 320→168px を33ステップで動かす間、読みかけ行(id=6)の上端の枠内 y の最大偏差は **0.0px**、フレーム間のジャンプの最大値も **0.0px** で、画面上は1pxも動かない。この 0.0px は測定の丸めではなく設計の帰結で、`useLayoutEffect` が DOM 更新後・ペイント前に同期実行されるため、補正前の見え方が**一度も画面に出ない**（React のコミットモデルが持つ保証）。対照「座標を保つ」は差分が厳密に2箇所（補正しない・帯を出さない）で、同じ区間の `scrollTop` の変化は **0.0px**——座標は完璧に保存されているのに、読みかけ行の上端は枠内 **260px**（可視高 224px の外）にある。No.97 の「正確であることと正しいことは別」を、台帳ではなく**器**の側で再演した形。折り返しは本物で、幅を振ると16行すべての `offsetHeight` が実際に変わる（id 0〜5 は 34→68px、読みかけの id=6 は 119→272px）。読みかけ行が可視高を超えたときは**行の上端を保つ**——読み手は上から下へ読むので、上端を保てば読んだところが消えて続きが下に出る。中央を保つと、読み終わった部分が画面に残り、これから読む部分が枠外へ出ていく。**保つべきは読み終わった側ではなく、読む向きの側。** 実測でも行高 272px / 可視高 224px のとき上端は 56px、下端は 328px で枠外にある。第3の難所は、誰も操作していないとき（回転・キーボード出現）**劣化を名乗る相手が居ない**こと。答えは**名乗るのは劣化したときだけ**——器が変わっても現在地が保てているなら黙る。実測でも幅を全域で振った40ステップ全部で帯は **0個**で、黙っていることそのものが正しさの表示になっている（読みかけの行が動いていないことが見えるので、言う必要がない）。**そしてこの標本は企画の誤りを1つ暴いた。** 企画は「読みかけを末尾へ移して幅を**縮める**と `maxScrollTop` に当たって帯が出る」と書いていたが、向きが逆だった。末尾行（後ろに行が無い）が上端 y=56px に置けるかは `可視高(224) − 56 − その行の高さ` の符号だけで決まり、**前方の行の高さが式から完全に消える**（`offsetTop` と `scrollHeight` の両方に同じだけ効いて相殺する）。CSS の折り返しは幅を狭めるほど行を高くするので、正しくは**広げるほど壊れ、狭めるほど直る**。実測どおり幅320pxで帯1個、168pxで帯0個。**末尾行を留められるかどうかは、前方がどう折り返すかとは無関係で、その行自身の高さだけで決まる。** 先頭行にも対称の限界がある（id=0 では目標が −56px になって0にクランプされる）。同じ clamp 式が両端で対称に効いているだけで、バグではない。離散の変化（回転）では No.97 のまま尺ゼロで、押した **+0ms** で枠内 y=56px、遷移中の中間状態を持たない。実装は連続と離散で分岐を持たず、補正関数は1つだけ——**連続か離散かを決めているのは、呼び出し側が幅を何回に分けて更新するかだけ**で、補正のコードはそれを知らない。実測で1つ、見た目でしか出ない誤りも出た。スライダーの溝の色 `#eaeae8` がページの地の色と同値で、初回のスクリーンショットではスライダーが**存在しないように写った**（実際は正しく動いていた）。',
    Component: ContainerChanged,
  },
  {
    id: 'resume-stale',
    no: 101,
    nameJa: '昨日の続きから',
    nameEn: 'Resume Stale',
    category: 'ナビゲーション',
    trigger: '「閉じる」→「翌日ひらく」（右上で「黙って復元する」の対照に切り替え）',
    principles: ['確度の落ちた現在地は、持っていても適用しない', '閾値を持たず、事実を出して判断を返す', '現在地は状態なので溜まらない'],
    ecology:
      'No.97（戻り先が変わっている）が扱ったのは「連れて行かれているあいだ」＝**数秒**の話だった。セッションを跨ぐと桁が変わる——閉じて、翌日ひらく。ここで **No.96〜98 の答えが、正しく効いたまま失敗する**。行の同一性は時間で壊れないので、No.97 の実装は正しく元の行へ戻し、枠内 y も守る。実測でも対照（＝No.97 の既定のまま）は `scrollTop=578px` で読みかけ行の上端が **y=68px**、誤差ゼロで着地する。**行としては完璧に正しい。** それでも失敗する——閉じている間に上へ12件積まれていて、対照で枠内に見える新着は **0件**。読み手は新着を1件も見ないまま、その下の「昨日の続き」に着地し、**自分が何を見逃したかを知る手段が画面に1つも無い**。既定の同じ瞬間は `scrollTop=0.0px` で、新着12件のうち **6件**が枠内に見える。この2つの数値の並び（**誤差0px・新着0件** と **座標0px・新着6件**）が、そのままこの標本の主張になっている。壊れたのは行ではない。**現在地としての妥当性のほう**が壊れた。No.97 は「座標は台帳の変化で壊れるから行で持て」と言ったが、行で持っても、時間が経つほど「読み手がまだそこに居たい」という**確度**が落ちる。**落ちたものは、持っていても適用しない。** だから既定は復元せず、台帳の頭に置いて、戻り道は帯に載せる（No.94 の形）。押されて初めて尺ゼロで戻る（20フレームのサンプリングで現れた値は `[0, 578]` の2つだけ、中間状態なし）。**持っていないのではなく、適用していない**——押せば誤差ゼロで着くことがその証拠になる。第2の芯は**閾値を持たないこと**。経過時間で挙動を切り替えると、読み手には切り替わりの理由が見えず、同じ操作が日によって違う結果になる（No.89 以来この図鑑が一貫して禁じてきた「時間で変わる」の一種）。実測でも「1分後にひらく」と「翌日ひらく」は `scrollTop=0`・帯1個・押すまで動かないの3点がすべて一致し、違うのは帯の文言の**先頭の語だけ**（`"1分前の続き（問い合わせ対応）— 以降に12件▸ 続きへ"` と `"昨日の続き（…）"` で、残りは1文字も違わない）。**挙動は変えず、事実だけを変える。** 閾値の恣意性の代わりに判断の材料を渡して、判断そのものを読み手に返している。対価は正直に認める——1分後に開き直しても1手余分に要る。そのコストは帯1本ぶんで、「同じ操作が日によって違う結果になる」より安いと判断した。第3は**溜まらないこと**。開き直しを3回繰り返しても帯は常に1個で、2回目に読みかけを別の行へ移せば3回目の帯はそちらを指す。No.91（跡が溜まりすぎたとき）は**跡**＝起きたことを畳んだが、現在地は**状態**＝いま居るところなので、畳む対象がそもそも無く、上書きされるだけ。**溜まるものと溜まらないものを取り違えない。** 実装で1つ、企画が明示していなかった必然が出た。読みかけ行(id=7)は台帳の末尾で、新着は必ずその上に積まれるので、**id=7 は何が起きても常に一番下の行であり続ける**。ふつうのスクロール領域では一番下の行の上端を可視域の中ほど（y=68px）まで引き上げられず、実測でも下端 y=170px で頭打ちになって企画の要求に届かなかった。末尾に 102px（＝可視高 − 行高 − 保存 y、定数から導出）の透明な余白を常設して解決している。No.100 が末尾行について見つけたこと（**末尾行を留められるかはその行自身の高さだけで決まる**）の裏返しで、こちらは行を伸ばせないので入れ物の側に余地を作った。もう1つ、**目で見るまで出なかった誤り**がある。初稿は新着行の名前が「新着100」で、新着であることを**行名が名乗っていた**。この標本で「新着が見えているか」を担うのは左端のマーカーのはずで、行名が名乗ると、マーカーが無くても分かってしまい担体の意味が消える——**印で言うべきことを名前で言ってしまっていた**。実在しそうな業務の文言に入れ替えて、新着かどうかを言う担体をマーカー1つに戻した。',
    Component: ResumeStale,
  },
  {
    id: 'no-place-yet',
    no: 102,
    nameJa: 'まだどこにも居ない',
    nameEn: 'No Place Yet',
    category: 'ナビゲーション',
    trigger: 'シーンを選んで「Tabで入る」（右上で「先頭に居ることにする」の対照に切り替え）',
    principles: ['「無い」は担体の不在では描けない', '出発地の無い最初の1つは移動ではなく出現', '現在地は状態なので覚えていない'],
    ecology:
      'No.90〜101 の12種は、ずっと1つの前提の上に立っていた——**現在地は「行」に載っている**。この標本はその前提を**個数**の側から外す。現在地が **0個**の状態、つまり「まだどこにも居ない」。多くの実装は開いた直後の現在地を台帳の頭に置く（No.101 も踏んでいる）。だが「先頭に**居る**」は読み手が選んだ結果で、「まだ**居ない**」は誰も選んでいない状態。同じ絵にすると、読み手は**自分が選んでいないものを選んだと思う**。実測で対照（＝先頭に居ることにする）は操作0回の時点で印が **1個**、既定は **0個**。第一の難所は、No.95 が決めた3つの担体（囲む・塗る・指す）が**どれも「在る」を描く道具**だということ。「無い」は担体の不在でしか描けず、不在は**読み込み中**とも**空の台帳**とも同じ絵になる——3つの別々の事実が1つの絵に潰れる。実測でも対照では「読み込み中」と「空の台帳」のリスト領域の `textContent` が `""` と `""` で**完全一致**した。答えは**名乗らせること**。既定は3シーンとも異なる文言を出し（`"台帳が届いていない — 指せる行がまだ無い"` / `"行が0件 — 指せるものが無い"` / `"まだどこも指していない — ▸ Tabで先頭から入る"`）、そのうえで行の左端に**担体のレール**を常設する。**レールが在って印が無い**ことで、「置ける場所はあるが、まだ置かれていない」が絵になる。第二の芯は動きのほう。**出発地の無い最初の1つは、移動ではない。** No.92 の答え（飛べるのは隣まで／経路を見せる）は出発地があることを前提にしていた。現在地が無い状態から最初の1つに入るとき、経路は存在しない。だから印は**その場に湧く**——実測で出現中 240ms の縦位置の最大偏差は **0.0px**、動くのは `scale`（0.40→0.68→0.99→1.05 と中間値を通る）と `opacity` だけ。2つ目以降の移動は従来どおり**滑る**（フレーム間ジャンプ最大 **11.7px**、行高 34px を超えない＝飛ばずに隣まで）。**出現と移動を撃ち分ける。** 対照は同じ「入る」を移動として描き、240ms のあいだに縦位置が 12 通り変化した（81.5→115.5px）。第三は解除の側。Esc の消滅中も縦位置の偏差は **0.0px**——**先頭へ帰る動きをしない**（帰る先が無い）。そして4行目で解除してもう一度入ると、印は **1行目**に湧く。**覚えていない**のは決めで、現在地は履歴ではなく状態だから（No.101「溜まらない」の再演）。対照ではこの決めが観測できない——「Tabで入る」の押下前後で印の個数・位置・帯がすべて一致し、**読み手には自分が入ったのか最初からそうだったのかが画面から判別できない**。実装で1つ、企画に書かれていなかった必然が出た。印を**位置のレイヤーと見た目のレイヤーの2層に分ける**必要がある。`transform` は1プロパティなので、「出現時は縦位置を1pxも動かさず scale だけ動く」と「移動時は縦位置が滑る」を同じ要素の同じ transition では両立できない。外側（`translateY` のみ）と内側（`scale`/`opacity` のみ）に割ると、C3 の「動かない」と C4 の「滑る」が矛盾なく同居した。**主張が2つあるなら、担体も2つ要る**——これは No.103 が別の角度から言うことと同じ結論だった。',
    Component: NoPlaceYet,
  },
  {
    id: 'place-as-range',
    no: 103,
    nameJa: '現在地に幅があるとき',
    nameEn: 'Place As Range',
    category: 'ナビゲーション',
    trigger: 'Shift+↓ で伸ばし、「絞り込む」で分断する（右上で「端点で持つ」の対照に切り替え）',
    principles: ['塗るは結果、指すは作用点', '反転は消えて湧くのではなく向きを返す', '範囲は端点ではなく集合で持つ'],
    ecology:
      'No.90〜102 の現在地は、ずっと**1つの行を指す点**だった。選択範囲はその前提の外にある——現在地に**幅**がある。幅があると、担体は**2つの事実を同時に言わなければならない**。「どこからどこまでか」（範囲）と、「いま動いているのはどちらの端か」（作用点＝次に `Shift+↓` を押したとき伸びる側）。**塗りは前者しか言えない。** 実測で、`Shift+↓` を押しているあいだアンカー行の縦位置の偏差は **0.0px**——既定でも対照でも**同じように動いていない**のに、それを名乗る担体は既定で **1個**、対照で **0個**。動きは同じで、読めるかどうかだけが違う。だから No.95 が決めた3担体（囲む・塗る・指す）を、**1つの現在地の中で同時に3つ**使う。塗る＝範囲（結果）、指す＝作用点（次に動く端）、点＝アンカー（動かない側）。芯は反転にある。フォーカスがアンカーを越えるとき、作用点は**消えて別の端に湧くのではなく、向きを返す**——実測で反転をまたぐ全フレームで作用点の個数は **1**（0 になるフレームは1枚も無い）、回転角は 0 と 180 のあいだの中間値を **10個以上**通った。対照では作用点そのものが存在しないので（全フレーム **0個**）、**反転が画面に一度も出ない**。そして反転は必ず**1件を通る**：選択件数の実測は `3 → 2 → 1 → 2 → 3 → 4` で、アンカーだけになる瞬間がちょうど **1回**。範囲が消えて別の範囲が生まれるのではなく、**同じアンカーの上で向きが変わる**ことが、件数の並びに出ている。第二の芯は持ち方。**範囲は端点だけでは持てない。** No.97 は「行の同一性で持て」と言ったが、範囲を「上端の行 id 〜 下端の行 id」で持つと、あいだの行が絞り込みで消えた瞬間に**選んでいない行が黙って範囲に入る**。実測で絞り込みを掛けると、既定の選択は **3件 → 3件**（集合で持っているので変わらない）、対照は **3件 → 5件**。帯も分かれる——既定は `"選択3件（うち1件は絞り込みの外）"` と**外に出た件数まで**名乗り（絞り込みが無いあいだは「外」の語を一度も出さない）、対照は `"選択5件"` と言うだけで**増えたことに触れない**。塗りの見た目も裏返る：既定は連続した塗りの塊が **2個**（分断される）、対照は **1個**。**分断された塗りは「範囲＝ひと続き」の見た目を壊すが、事実に合っている。** 決定的なのは解除したとき。既定の選択 id は `[4,5,6] → [4,5,6]` と**完全に一致**して戻り、対照は `[4,5,6] → [4,5,6,7,8,9]` のまま——**失ったのではなく、増えたまま戻らない**。実装が企画の書いていなかったことを1つ暴いた。**「範囲を端点で持つ」は、識別子を捨てている実装ではない。** 対照も `topId` / `bottomId` という**識別子**を状態に持っていて、コードだけ読むと No.97 の答えを守っているように見える。壊れるのは、絞り込みの瞬間に下端を「絞り込み後の並びで同じ位置にいる行」へ**解決し直して確定させる**、その1回だけ。**露骨に位置で持つ間違いより、こちらのほうがずっと正しく見える。** しかもこの上書きは絞り込み時にしか起きないので、解除しても誰も直さない。もう1つ、実装しないと分からなかった制約がある。作用点を**行の JSX の中に置くと、フォーカスが移るたびに React が古い要素を捨てて新しい要素を作る**——見た目はほぼ同じで、クリックして確かめても気づけないが、回転角は 0 と 180 の2値しか出ず、**「消えて湧かない」という主張だけが静かに壊れる**。行の外に1つだけ常設して追いかける形に直して通った。C2 という受け入れ条件は、まさにこの壊れ方を捕まえるために置かれていた。',
    Component: PlaceAsRange,
  },
  {
    id: 'place-without-rows',
    no: 104,
    nameJa: '行のない現在地',
    nameEn: 'Place Without Rows',
    category: 'ナビゲーション',
    trigger: 'キャンバスをクリックして現在地を置き、倍率つまみを掴んで動かす（右上で「座標で持つ」の対照に切り替え）',
    principles: ['連続空間では近傍の名前＋相対で持つ', '基準は倍率で持ち替わる。持ち替えを黙らない', '倍率の不動点は読み手が指した点'],
    ecology:
      'No.97 が「現在地は座標ではなく**行の同一性**で持て」と言えたのは、台帳に**行という不変量**があったから。地図・キャンバス・波形のような連続空間には、それに当たるものが1つも無い。**No.97 の答えは、行の無い空間では言い換える先を持たない。** 素朴な答え「見ている中心の座標＋倍率」は No.97 が撃った座標そのもので、図形が動けば同じ座標が別の場所を指す。実測で対照（座標で持つ）は「保存 → 配置が変わった → 復元」のあとワールド座標の偏差 **0.0px**——**完璧に保存されている**のに、指していた `A棟` までの距離は **113.47px** で、現在地は何も無いところに着地した（No.100「座標だけが嘘になる」の、行の無い空間での再演）。既定は現在地を `{基準の id, dx, dy, 倍率}` で持つ。同じ操作で基準との相対ベクトルの偏差は **0.0px**、`A棟` は画面内に見えたまま。ここで実装が1つ、企画に書かれていなかったことを教えた——**「一緒に運ばれる」に専用のコードが要らない**。`screen = (world − viewOrigin) × zoom` はワールド座標に関して線形なので、印のワールド座標が `基準の中心 + {dx,dy}` の導出値である限り、矩形と印に同じ尺の transition を独立に張るだけで、補間の**中割りまで含めて**オフセットが保たれる。**追従を書いたのではなく、追従せざるを得ない持ち方を選んだら結果としてついてきた。** 連続空間には、行の世界に無かった問題が2つある。ひとつは**不動点**。倍率を変えるとき画面のどの点を動かさないかを決めなければならない（No.100 は保つべきものが1つ＝読みかけ行の上端だった）。既定は**読み手が指した点**を不動点にする——実測で倍率 1.0→3.0 の 20 ステップ全部で印の画面座標の最大偏差は **0.0px**、対照（画面中心を不動点にする）では **62.94px** 流れて、指した場所を見失う。もうひとつは**「近い」が倍率で変わる**こと。倍率が上がると、いま基準にしているものは粒度が粗すぎて役に立たなくなる。だから基準は**持ち替わる**。黙って持ち替えると同じ現在地が別の名前で呼ばれるので、引き出し線が旧基準から新基準へ**滑って繋ぎ変わり**（持ち替えをまたぐ21サンプル全部で線の個数は **1**——消えて湧かない）、帯が `"基準をA棟 3F 東に持ち替えました（A棟から）"` と**新旧両方の名前**で名乗る。持ち替えが起きない範囲では帯は**0回**しか語らない（保てているうちは黙る）。持ち替えの閾値は**幅を持つ**（上り 2.5／下り 2.2）。5往復で切り替わりはちょうど **10回**、境界のすぐ上で ±0.05 を往復させると **0回**——単純な閾値ならバタつくところが、状態として持つと止まる。企画が指定しなかった決めを実装が1つ足した。**基準にできるのは、その倍率で画面に出ているものだけ**——細かい粒度の図形の表示条件に、基準選定と**同じ状態**（ヒステリシス付きの1個の真偽値）をそのまま使っている。表示だけを素の閾値で判定すると、下り 2.2〜2.5 のあいだに「見えていないのに基準」という状態が開く。**規則が画面から読めることと、規則が破れないことが、同じ1つの変数で担保されている。** 最後に、この標本には図鑑で初めての担体がある——**世界に固定された薄いグリッド**。連続空間そのものを描く担体で、これが無いと倍率を上げた画面はただの白地になり、**不動点の主張が動きとして見えない**。既定では印が1点に貼り付いたままグリッドだけが流れ、対照ではグリッドごと全部が流れて印が画面外へ出ていく。**空間を描かないと、空間についての主張は動きにならない。**',
    Component: PlaceWithoutRows,
  },
  {
    id: 'place-plays-itself',
    no: 105,
    nameJa: '自分で動く現在地',
    nameEn: 'Place Plays Itself',
    category: 'ナビゲーション',
    trigger: '再生して放っておく。途中で行を触る・スクロールする・止める（右上で「担体を兼ねる」の対照に切り替え）',
    principles: ['主語が2人なら担体も2つ', '時間を写す担体に緩急を付けない', '止めたら権利が返る'],
    ecology:
      'No.90〜104 の15種は、口に出していない前提を共有していた——**現在地を動かすのは読み手**。この標本はそこを外す。書き起こしを再生すると、読み手が何もしていないのに現在地（いま鳴っている発話）が進み続け、そこへ読み手が別の行を触ると、**同じ画面に現在地の主語が2人並ぶ**。答えは No.95 の「担体は1つの事実しか言えない」を**同じ1人が2つの現在地を持つ**場面で再演すること——機械の現在地は**塗り**（行が左から右へ満ちる）、読み手の現在地は**囲み**。実測で既定は `is-playing` 1個・`is-cursor` 1個が**別の行**（塗り=0行目 / 囲み=8行目）に立つ。対照は担体を1つに兼ね、読み手が選んだ行が **768ms** で機械に上書きされる——読み手は「奪われた」ではなく「選び損ねた」と思う。第2の芯はイージングで、**この標本はこの図鑑の基本イージング（ぷるん）を使ってはいけない唯一の場所**になった。塗りは時間そのものを写した担体なので、緩急を付けると同じ長さの発話が違う速さで鳴って見える。実測で1行の再生中の進行は時間に対する残差 **0.93%**（線形）、対照（0.30s のぷるん）は **64.7%**。ずれが露見するのはシークで、既定は2行戻した直後に現れる塗り行が **2値のみ**（4→2）なのに対し、対照は中割りが出る（**3値** 4→3→2）＝**時刻と表示がずれる**。第3は追従で、自動スクロールは現在地の話ではなく**枠に貸した権利**。読み手がスクロールすると追従は外れる（3秒放置で `scrollTop` は 120→120）が**塗りは進み続ける**。対照は **1秒以内**に引き戻す（120→32）＝読み手が枠を取り返せない。戻すのは行為（`▸ 再生位置へ戻る`）で、帯は追従中 **0個** → 外れて **1個** → 戻すと **0個**。第4は停止したときの現在地で、No.102 が撃ち分けた「居る／まだ居ない」の3つ目の状態にあたる。**止めたら、機械の現在地は読み手の現在地になる**——一時停止で囲みが塗りと同じ行に湧き（0個→1個・`data-row` 一致）、再開で消える（1個→0個）。ただし読み手が明示的に選んでいた囲みは**奪わない**（クリックで置いた 7行目は停止後も 7行目のまま）。停止中の `↓` は囲みだけを動かし（1→2）、塗りは動かず（"1" 不変）、再開すると塗りは**塗りの位置から**続く。実装が状態遷移のバグを2つ暴いた。ひとつ、モード切替時の `scrollTop` 直書きが読み手のスクロールと区別されず、**誰も触っていないのに追従が外れて**いた。ふたつ、それをフラグで直したら今度は `scrollTop` が既に 0 のとき代入してもブラウザが `scroll` を発火せず、**立てたフラグが消費されないまま次の本物のスクロールを飲み込む**（＝追従が二度と外れない）。値が実際に変わるときだけフラグを立てる形で解決した。**「自分の操作か読み手の操作か」を旗で持つ実装は、旗の立てっぱなしという第2の状態を必ず生む。**',
    Component: PlacePlaysItself,
  },
  {
    id: 'place-offscreen',
    no: 106,
    nameJa: '見えていない現在地',
    nameEn: 'Place Offscreen',
    category: 'ナビゲーション',
    trigger: '▲▼ で枠を動かし、現在地を枠の外へ追い出す（右上で「縁に貼り付ける」の対照に切り替え）',
    principles: ['端に寄せた印は現在地ではなく方角', '動いていないものを動きで語らない', '閾値を持つなら読み手に見える閾値だけ'],
    ecology:
      'No.90〜105 が共有していたもう1つの前提——**現在地は見えている**。No.104 は基準が画面外へ出たとき引き出し線をクリップした（＝扱わないと決めた）。この標本はその決めを正面から扱う。多くの実装は現在地の担体を枠の縁にスティッキーで貼り付けるが、**端に寄せた印は現在地ではなく「現在地の方角」で、別の事実**。同じ担体で描くと読み手は端に現在地があると読む（No.95 の「担体は1つの事実しか言えない」の、視界の側での再演）。既定は撃ち分ける——行が1pxでも見えていれば囲みだけ、完全に消えたら縁の方角の担体だけ。スクロール中の 48 サンプルで**両方が 1 のフレームは0枚**。対照は `is-cursor` が**常に1個**で、その枠内 y は上縁 3px / 下縁 173px の **2値のみ**に張り付き、距離を名乗る要素は画面に **0個**。芯は2つめにある。現在地が枠外に出たとき、**現在地は動いていない——動いたのは枠のほう**。実測でスクロール中の全 40 サンプルで読みかけの `offsetTop` は **408px の1値のみ**（＝台帳の中では 1px も動いていない）。だから方角の担体は**縦位置を1pxも動かさない**（スクロール量を 5 段階変えても枠内 y の偏差 **0.0px**）。変わるのは距離の数だけで、`2行上 → 4行上 → 6行上 → 8行上` と文字だけが増える。**モーション図鑑がここで出す答えは「動かすな」**——動いていないものについて動きで語ると、現在地が動いたと読める。動かしてよいのは枠を越えた瞬間の受け渡しだけで、囲みが縁でしぼみ方角が湧く 140ms のあいだも縦位置の偏差は **0.0px**（26 サンプル）、動くのは scale（0.65→1.03→1）と opacity だけ。第3は閾値で、この図鑑は閾値を持たない方針なので「枠の外」という連続量と正面からぶつかる。答えは**閾値を1つだけ持ち、それが読み手に見えるものであること**——「行が完全に見えなくなったら」。1px 刻みの実測で `scrollTop=440,441` では方角 0個、**442 で 1個**に切り替わり、これは行の下端 442px と完全に一致する。読み手は「見えなくなった」を自分の目で確認できるので、規則が画面から読める。戻り道は帯を増やさず**方角の担体自身に載せる**（文章の帯は **0個**）。押すと尺ゼロで着地し（現れる `scrollTop` は上方向 476→408 の2値、下方向 204→238 の2値）、着地後の現在地は**出て行った縁と同じ側**に置く（上へ出ていたなら枠内 y=0px、下へ出ていたなら 170px）——真ん中に置くと、どちらから戻ってきたのかが消える。押すまでは3秒放置で `scrollTop` は 544→544 のまま（時間では戻らない）。企画の穴を実装が1つ埋めた。**「現在地を選び直す」ボタンの挙動をどの受け入れ条件も定義していなかった**——現在地が id=12 に固定されている限り、判定式が台帳のどの位置でも壊れないことを実演できない。押すたび id=12→33→5 と巡回する形にして、終端寄り・先頭寄りでも方角・距離・ボタンの無効境界が式どおりに動くことを確かめた。目視では、方角の担体を 22px 高で作ったせいで現在地が抜けた1行（34px）のうち 12px が隙間として残っていたのを、`ROW_H` 由来の高さに直して**1行ぶんきっかり覆う**形にした（そのスロットが方角の情報に置き換わった、と読める）。その過程で、対照のスティッキー担体と方角の担体が**同じクラス**を共有していたため CSS アニメーションが inline の `translateY` を恒久的に上書きしていたことも判明し、No.102 と同じ**位置の層と見た目の層の分離**で解いた。',
    Component: PlaceOffscreen,
  },
  {
    id: 'place-two-frames',
    no: 107,
    nameJa: '窓が2つあるとき',
    nameEn: 'Place Two Frames',
    category: 'ナビゲーション',
    trigger: '↓ で現在地を送り、窓をクリックして活性を移す。窓Bを閉じて開き直す（右上で「窓を揃える」の対照に切り替え）',
    principles: ['現在地は台帳のもの、見え方は窓のもの', '追いかけるのは頼まれた窓だけ', '2つの窓が違うことを言ってよい'],
    ecology:
      'No.106 が「枠と現在地は別のもの」と言った直後に、その**枠が複数形**になる。同じ台帳を上下2つの窓で開き、現在地は1つ。No.95・98・99 が扱ったのは**他人**の現在地だったが、ここは同じ1人の、同じ1つの現在地に、窓が2つある場面。まず、囲みは**両方の窓に出る**（現在地が両窓の視界に入った瞬間の実測で `is-cursor` は **2個**・`data-row` は `["10","10"]` で同一）。No.103 の答え（同じ行が2か所にあるとき、同一性の印は全出現に出す）をそのまま借りている——**同じ1つの事実の、2つの像**。読み手が困るのは囲みが2個あることではなく、**どちらの窓がキー操作を受けるかが見えないとき**なので、そこは別の担体（窓の縁）で言う。片方の囲みだけ濃くする実装は、**濃さで表しているのが窓の活性なのに、読み手には「弱い現在地」と読める**。第2は追従で、`↓` を押したとき追いかけるのは**アクティブな窓だけ**。実測で `↓` 3回でアクティブな窓Aは `scrollTop` 0→56、窓Bは **280→280**（3秒放置しても不変）。対照は同じ操作で両方が `0→0→28→56→84` と**同時に**動く——頼んでいない窓が動く。第3がこの標本の芯で、**現在地が窓Aでは枠内、窓Bでは枠外**という状態が起きる（実測 place=14 で窓A は囲み1個、窓B は `▼ 1行下`）。**同じ瞬間に、2つの窓が同じ現在地について違うことを言う。矛盾ではない——見え方は窓の事実だから。** 106 の答え（方角の担体・縦位置を動かさない・距離は行数・`▸` で飛ぶ）が、窓ごとに独立に立つことの確認にもなっている。対照は「現在地は1つなのだから見え方も1つ」とし、10回の操作の全サンプルで2つの窓の `scrollTop` が**完全に一致**する＝**窓が2つある意味が消える**。第4は窓を閉じたとき何が消えるかで、**スクロールは窓のものだから消え、現在地は台帳のものだから残る**。閉じる前 280 だった窓Bを開き直すと **196**（旧値と不一致・現在地の枠内 y=28px）で、`data-place` は "8" のまま。No.101 は「持っていても適用しない」と言ったが、こちらは適用してよい——No.101 の古い現在地は**時間で妥当性が壊れていた**のに対し、新しい窓には疑う材料が何も無い。第5に、窓をクリックして活性を移しても現在地は動かない（`place` は "2"→"2"、`activeFrame` だけ A→B）。対照はクリックした窓の先頭行へ現在地が飛ぶ（"2"→"0"）＝フォーカスと選択の混同。**既定と対照で現在地そのものの動きは完全に同じ**（`↓` 5回でどちらも "7"）で、違うのは**枠の振る舞いだけ**——主張が余計な差を作っていないことの担保になっている。実装が企画に2つ足した。ひとつ、スクロールを**行単位に量子化**すること（自由スクロールだと「行が半分だけ見えている」状態が生まれ、個数で語る受け入れ条件が半端に揺れる）。ふたつ、開き直した窓の着地点を**中央寄り**にすること（先頭に置くと `↑` 一発で即座に枠外へ戻る）。収録でもう1つ分かった。`↓` を **11回**押した位置では窓Aの `scrollTop` が偶然 280 になり、**2つの窓がまったく同じ絵になる**——既定なのに対照と見分けがつかないコマができる。9回で「両窓に囲み」、13回で「食い違い」になることを実測で確かめてから台本を書いた。**主題が写るかどうかは、実装ではなく撮る位置で決まる。**',
    Component: PlaceTwoFrames,
  },
  {
    id: 'place-in-collapsed',
    no: 108,
    nameJa: '畳まれた中の現在地',
    nameEn: 'Place In Collapsed',
    category: 'ナビゲーション',
    trigger: '親の行の ▸ を押して畳む／開く。畳んだ親に湧く段数の担体を押すと開いて現在地へ戻る。↓ は見えている行だけを巡る（右上で対照に切り替え）',
    principles: ['内側に方角は無い', '代弁する担体は、現在地の担体と別のものにする', '畳む操作は現在地を狙っていない'],
    ecology:
      'No.106 は「現在地が枠の外にある」を、縁に置いた**方角の担体**で答えた。この標本ではその答えが**使えない**。行は台帳に在るのに、親が畳まれているせいで**描かれない**——畳まれた中は上でも下でもなく「内側」で、方角という担体が指す先が無いからである。答えは、行そのものではなく**畳んだ親の行に代弁させる**こと。ただし「この中に現在地がある」と「親が現在地だ」は別の事実なので、担体を分ける（No.95）。既定の囲みは行全体を包む inset の枠（行の**存在**を言う形）、代弁は行の左端の縦棒＋右端の小さな文字タグ（行の**中身の一部**を指す形）で、濃さ違いにはしない。実測で、開閉を 30 サンプル繰り返して**両方が1個以上になったフレームは 0 枚**。対照は畳んだ親に同じ囲みを出し、そのとき `data-place` は `i112` から `s11` へ**書き換わる**（`is-cursor` の `data-row` も `s11`）。読み手には「親が現在地」と読め、しかも**開き直しても戻らない**（`s11` のまま）＝**畳んだだけで現在地を失う**。第2は数え方で、方角の代わりに置ける唯一の情報が**何段内側か**である。実測で `1段内` → `2段内` と言い直す。実装はこれを「何回畳んだか」のカウンタではなく `depth(現在地) − depth(代弁している行)` という**ツリー上の深さの差**から毎回導いた——イベントの帳簿ではなく構造の帳簿にする（No.97「座標ではなく同一性」の系譜）。第3は深さで、二重に畳まれているとき代弁するのは**いちばん外側の閉じた親だけ**（実測 `is-holds-place` 1個）。内側の閉じた親が 0個なのは「隠しているから 0」ではなく、畳まれた親の子孫を**そもそも描画対象から外している**ので**その行が DOM に無いから 0**——数える対象が最初から存在しない、という一番固い形になった。第4が芯で、**畳む操作は現在地を狙っていない。だから現在地は動かない。動いたのは描画のほう**。無関係な節を畳んだ前後で `data-place` は `i112 → i112`、`scrollTop` は `0 → 0` で**どちらも不変**。代弁の担体が湧く前後でも、その親の行の位置は偏差 **0.0px**（305→305 / 277→277）。第5は戻り道で、No.106 と同じく**担体自身に載せる**（帯を増やさない）。押すと `{囲み0, 代弁1}` → `{囲み1, 代弁0}` に切り替わり、枠を離れた位置から押しても `scrollTop` は `168 → 84` と動いて現在地が枠内に着地する。ここで実装が罠を1つ掘り当てた——**開いたあとの新しい行位置を先に計算してから畳み状態を更新しないと**、まだ畳まれたままの（＝行数が少ない）DOM の `scrollHeight` に対して `scrollTop` を設定することになり、ブラウザにクランプされて着地に失敗する。No.107 の難所（閉じた窓の値を本当に捨てる）と同種の、**状態を変える順序が見た目の正しさを決める**場面である。第6に、畳まれた中に現在地があるときの `↓` は**見えている行だけを巡る**（実測 `i112 → s12` で担体は囲みへ戻る）——見えないものを見えないまま動かさない。',
    Component: PlaceInCollapsed,
  },
  {
    id: 'place-at-live-edge',
    no: 109,
    nameJa: '逃げ続ける末尾',
    nameEn: 'Place At Live Edge',
    category: 'ナビゲーション',
    trigger: '流れ続けるログを ▲ で上へ送って追従を外し、5秒ほど待ってから下の戻り道を押して追いつく（右上で対照に切り替え）',
    principles: ['末尾は行ではなく状態', '追いついていないことと未読があることは別の事実', '着地点は着地するまでに変わる'],
    ecology:
      'No.97 は「現在地は座標ではなく**行の同一性**で持て」と言った。ライブでは**台帳のほうが伸び続ける**ので、その答えが持つ先を失う——**「末尾に居る」は行ではなく状態**で、行 id で持つと 1 件増えるたびに古くなる。だから既定は現在地を `{ライブ} | {行, id}` の 2 状態で持ち、**2 つを同じ担体で描かない**。ライブ中の担体は行の囲みではなく、枠の右下に固定した小さな `● LIVE`（`is-live-edge`）1個で、`is-cursor` は **0個**。対照はライブも行 id で持つので最終行に囲みが立ち、実測で **3 秒のあいだに `data-row` が 4 回**変わる＝**行が増えるたび現在地が飛び移る**。追従を外すと既定は `is-cursor` 1個・`is-live-edge` 0個に切り替わり、25 サンプルで**両方が 1 のフレームは 0 枚**。第2は No.90 の継承で、**追従が外れている間も台帳は伸びるが、現在地の行は 1px も動かない**（実測 14 サンプルで枠内 y は **1値のみ**、その間に台帳は **5 行**増えた）。ライブの縁の枠内 y も同じ 5 行のあいだ偏差 **0.0px**。第3が芯で、**「追いついていない」と「未読がある」は別の事実**である。既定は戻り道（`is-catch-up`）と未読の数（`is-unread-count`）を**別の要素**に置いた。上に戻って読んでいる途中で追いつくと、実測で戻り道は **0個**になるのに未読は **3件**残る（押す前は 8 件）＝**追いついたのに未読がある**（自分で読み飛ばした）が言える。対照は件数を戻り道のボタンに載せているので、同じ操作で **3 → 0** と消える＝**読み飛ばしの記憶が消える**。第4は着地点で、**押した瞬間にも末尾は動いている**。既定は「押した瞬間の最終行 id へ飛ぶ」のではなく `mode` を**ライブに戻す**ので、着地点は常に末尾＝差は**構造的に 0 行**。対照は id を捕まえて飛ぶので、押した直後こそ 0〜1 行でも **1.8 秒後には 3 行**の差になる。第5に、**見えていないところの動きは描かない**（No.90 の継承）——追従が外れている間の新着行に湧きの動きは付かない（45 サンプルで `is-arriving` **全サンプル 0個**）。実装が状態遷移の罠を1つ暴いた。**追従判定をネイティブの `scroll` イベント 1 本に書くと、末尾への自動貼り付け（新着のたびに `scrollTop` を書き戻す処理）自身が同じ `scroll` を誘発する**。それが次の tick の後に非同期で発火すると `scrollTop` と `scrollHeight` の組が矛盾し、**誰も触っていないのに追従が外れる**。手動スクロールの唯一の入口の中だけで判定する形に直した——No.105 の「旗で操作の出どころを持つと、旗の立てっぱなしという第2の状態が生まれる」と**同じ穴の別の顔**である。目視では、ライブの縁を枠下端の全幅の帯で作ったせいで最終行の文字と重なって読めなくなっていたのを、右下の小さなピルに変えて解いた。もう1つ、**未読ギャップが可視行数（5）を下回ると、追いついた時点で全部見えてしまい未読は 0 になる**——これはバグではなく正しい挙動（実際に見えたのだから既読でよい）だが、**収録では 5 秒以上待って未読を可視行数より多くしないと、この標本の芯が写らない**。No.107 が出した「主題が写るかどうかは撮る位置で決まる」の、時間の側での再演になった。',
    Component: PlaceAtLiveEdge,
  },
  {
    id: 'place-not-loaded',
    no: 110,
    nameJa: 'まだ手元に無い現在地',
    nameEn: 'Place Not Loaded',
    category: 'ナビゲーション',
    trigger: '「320行目へ」を押して未読込の領域へ現在地を送り、届いたら枠外の方角の帯を押して飛ぶ。「取り寄せを失敗させる」のあと担体自身の再試行を押す（右上で対照に切り替え）',
    principles: ['推定の位置に現在地を描かない', '骨は「中身が無い」の担体で、現在地の担体ではない', '入れ物の長さは台帳の総数で作る'],
    ecology:
      'この回の3つめは、行が**手元に無い**場面である。台帳が 400 行あることは分かっているのに、届いているのは先頭の数十行だけ。素朴な答えは「推定の位置に囲みを置いて、届いたら直す」だが、それは No.79「楽観のあと出し訂正」を**現在地で**やることになる——行高が推定と違えば届いた瞬間に囲みが飛び、読み手には現在地が動いたと読める。実測で、対照は届いた瞬間に囲みの枠内 y が **26px 跳ぶ**（130→156。別の位置から再現しても 250→276 で同じ 26px）。既定は同じ瞬間、可視4行の `offsetTop` が `[120,146,172,198]` から**1つも変わらない**。だから既定が出す答えは、**位置が分からないなら位置を名乗らない**こと。取り寄せ中の担体は枠の外の帯に固定して**枠の中のどこも指さず**（20 サンプルで枠内 y は **286px の1値のみ・偏差 0.0px**）、`320行目・取り寄せ中` と**行番号だけ**を名乗る。居場所が分からないのではなく、**画面のどこに描けばいいかが分からない**だけだからである。第2は骨との関係で、**骨は「まだ中身が無い」の担体であって、現在地の担体ではない**。既定は `.is-skeleton.is-cursor` が全サンプルで **0個**、対照は取り寄せ中に **1個**——1つの担体が2つの事実を言う（No.95）。第3は撃ち分けで、現在地の担体は `囲み`（手元にあり枠内）・`方角`（手元にあり枠外。No.106 の答えをそのまま借りる）・`取り寄せ中`（手元に無い）の3つを排他に切り替える。**送る→取り寄せ中→届く→枠外の方角→押して枠内の囲み→失敗→再取得** まで一続きに走らせた 65 サンプルで、3つ（＋失敗）の合計は**常にちょうど 1**（min=max=1）。実装ではこれを担体ごとのフラグではなく、現在地・手元にある行の集合・スクロールの3つの state から**毎レンダー導出する**形にしたので、「合計が1」はコードの形から出ている。第4は入れ物の長さで、**台帳の総数で作る**。同じスクロール操作で 30 行取り寄せた前後の実測は、既定 **10426px → 10426px（差 0）** に対し、対照は **1560px → 2340px**（＝30行 × 26px ぶん伸びる）。ただし既定も無傷ではない——推定 26px の行が実寸 52px で届けば**その差ぶんだけ**伸びる（「320行目へ」で 52px の行が届く場面の実測で **10426 → 10452px（+26px）**）。伸びるのが**チャンクまるごと**なのか**推定と実寸の差だけ**なのか、そしてそれが**届いた行より下にしか出ない**かどうかが、掴んでいるつまみの下で目盛りが動くかどうかを分ける。No.100「入れ物のほうが変わる」の再演だが、あちらは連続な変化なので連続な補正が効いた。こちらは**飛び飛びに**伸びるので補正のかけようが無い。第5は失敗したときで、**「手元に無い」は「無い」ではない**。取り寄せに失敗しても `data-place` は `395` のまま**壊れず**、再取得の導線は帯を増やさず**担体自身**に載せる（No.106 の戻り道の継承）。再取得が通ったあとも `data-place` は `395` のままで、担体だけが方角へ引き継がれる。届いた瞬間に枠は動かさない（`scrollTop` は **0 → 0**）——飛ぶのは読み手が `▸` を押したときだけである。収録で1つ分かったこともある。対照の入れ物の長さを「手元の行数と現在地のうち大きいほう」ちょうどで打ち止めにすると、現在地の行が**入れ物の末尾に貼り付く**ので、届いた瞬間の 26px の跳びが枠の下へはみ出して**画面に写らない**（実測で囲みの枠内 y は 250→276、枠の下端が 276）。1画面ぶんの余りを足して、跳びが枠の中に収まるようにした（実測 146→172）——**壊れ方は実測できても、写らなければレビューには届かない**。No.107 が出した「主題が写るかどうかは撮る位置で決まる」の、実装の側での再演である。そして実装が罠を1つ掘り当てた。**「320行目へ」の直後に `scrollTop` を同期的に書くと、そのときの入れ物の高さはまだ古いレンダーの値なので、ブラウザが古い（小さい）`scrollHeight` に丸めて飛び先に届かない。** 状態を更新してから、コミット後に位置を合わせる経路に直して解いた——No.108 が踏んだ「開いたあとの位置を先に計算しないとクランプされる」と**同じ穴**で、この回だけで2回出た。**状態を変える順序が、見た目の正しさを決める。** もう1つ、行の高さを prefix sum で持つと「現在地より上の行の高さは変わらない」が**分岐を1つも書かずに数式の構造だけで**保証される、というのも実装で分かったことである。',
    Component: PlaceNotLoaded,
  },
  {
    id: 'resolution-burst',
    no: 111,
    nameJa: '一度に20個変わる',
    nameEn: 'Resolution Burst',
    category: 'ゲーム',
    trigger: '「今週を解決する」で17項目を一斉に確定させる。展開の途中で「まとめて確定」を押して追い越す。「別の週で見る」で6項目だけ動く週に切り替える（右上で「変化量の大きい順に見せる」対照に切り替え）',
    principles: ['動きの順番はそれ自体が主張である', '順に見せるが、待たせない', '変わらなかったことはゼロでは言えない'],
    ecology:
      'No.111〜113 は「その動きは、いつの出来事か」を撃つ回で、この標本はその1つめ——**同時に確定したものを、順に見せる**場面である。実プロジェクト（Startup Sim の週次解決）からの逆算で、1週ぶんの解決では17項目が**同じ1瞬間に**確定する。順序は事実の側に存在せず、存在するのは**因果**だけ。先例との違いを先に言うと、No.77「同時に鳴ったときの順番」は**3つ**同時で、3なら「先に動いたほうが主役」で配れた。**17では主役の配り方そのものが破綻する。** No.65「因果のリレー」は原因→結果の1段で、17項目・4段のリレーでは棒が見えない。既定の第1の答えは、**順番は因果で決める**こと。**動きの順番はそれ自体が主張である**——見た目の都合（変化量の大きい順・目立つ順）で並べると、読み手は**因果を誤って学習する**。実測で既定は段の昇順で単調（順序の違反ペア **0**）、対照は変化量順なので違反ペアが **42**。今週いちばん大きく動く `評価額 +38%`（段4＝いちばん下流）の確定順位は、既定で **17位/17**、対照で **1位/17**。**対照では、結果がいちばん先に動く。** 第2は**順に見せるが、待たせない**こと。展開の総尺は件数に依らず固定で、実測は17項目 **1352ms** / 6項目 **1278ms**（**差 74ms**）。対照は件数比例で **3301ms** / **1200ms**——**件数が増えるほど待たされる**。ここで実装が企画の穴を1つ埋めた。「段の予算を件数で割る」を素直に実装すると、**件数の少ない週は間隔の合計が予算に届かず、必ず早く終わる**。正しい形は逆で、**段そのものが件数と無関係な固定尺（245ms）を持ち、項目はその舞台の中に配置されるだけ**にする——余った時間は段の中の空白になる。さらに、6項目の週を各段に均等に配ると最終段が1項目になって段内の間隔がゼロになり、**同じ実装でも総尺が 517ms ずれた**。「総尺が件数に依らない」を本当に成立させるには、**最終段の項目数を両プリセットで近づける**必要がある——企画に書かれていなかった制約である。第3は**間が段を語る**こと。実測で確定時刻の差分は二峰にきれいに割れる：段内は **48〜64ms**（全て 80ms 未満）、段の切れ目は **189〜261ms**（全て 120ms 以上）、**中間帯（80〜120ms）は 0件**。ラベルではなく**何も起きない時間**が段を語る。第4がこの標本の芯で、**変わらなかったものこそ言う**。確定の拍（左端の縦棒が 90ms で入り、地が 120ms 沈む。**確定は事実であって喜びではない**ので跳ねない）を、変化の有無に関わらず**全17項目に打つ**。実測で既定は `is-settled` **17個** / `is-changed` **5個** / `is-pending` **0個**、対照は `is-settled` **5個** / `is-pending` **12個**——**12項目は「変わらなかった」のか「まだ来ていない」のかが画面から読めない**。**翻訳したいのはゼロ（変化していないこと）で、ゼロは「動かない」では表せない**（動かないものは担体を0個しか持てない）。第5は追い越しで、展開中に「まとめて確定」を押すと残りは尺ゼロで確定する（**88ms** で `is-settling` 0個・`is-settled` 17個）。そのときの17項目の表示値は、待った場合と**完全一致**する。ここで実装が状態の設計を1つ正した——**拍と尺ゼロを同じフラグから作ると衝突する**。意味を持つ状態（未確定／確定中／確定済み）と、**演出の有無だけを表す軽いフラグ**（`is-instant`）を分けて、後者が立った行だけ CSS 側で演出を殺す形にした。状態の意味を変えずに済むので「担体の合計は常に1」というこの図鑑の原則を壊さない。そして第6が、**どこまで見たか**。追い越すと「拍が画面で再生されなかった項目」が残る。既定は収録と同じタイミング（250ms で追い越し）で **14件**、20ms で追い越すと **15件**——**早く追い越すほど未見が増える**。最後まで見れば **0件**、対照はどちらの操作でも **0件**（未見の記憶を持たない）。ここは企画の書き方が実装を誤らせた箇所でもある。初版は自然に確定した項目まで未見に入れていたため、**最後まで見ても追い越しても同じ 17件**になり、担体が「どこまで見たか」を何も語っていなかった——**受け入れ条件の数（8件以上）は通っていたのに、通り方が間違っていた**。実物を見て初めて出た誤りで、条件を数で書くことの限界がそのまま出ている。',
    Component: ResolutionBurst,
  },
  {
    id: 'place-in-history',
    no: 112,
    nameJa: '履歴の中の現在地',
    nameEn: 'Place In History',
    category: 'ナビゲーション',
    trigger: '行をクリックして現在地を置き、`◀ 戻る` / `進む ▶` で履歴を行き来する。途中から別の行を選んで分岐を捨てる。`この行を消す` のあと戻る（右上で「台帳の担体だけで描く」対照に切り替え）',
    principles: ['戻るは移動ではなく巻き戻し', '履歴の移動は台帳の出来事ではない', '捨てた分岐は捨てたと言う'],
    ecology:
      'No.108〜110 は「担体を置く相手（行）が画面に居ない」を3通りの理由で扱った（読み手が畳んだ／まだ生まれていない／まだ手元に無い）。この標本は**4つめの理由**を出す——**居ないのは行ではなく、台帳のほう**。履歴は現在地を持つ立派な台帳なのに、画面のどこにも描かれていない。だから既定はまず**それを描く**：枠の外に点の列を置き、**履歴の担体は行を指さない**（履歴の位置は行ではなく訪れた順番だから）。実測で点の個数は `data-history-len` と全操作で一致し、囲みが履歴の帯の中に出るフレームは 20 サンプルで **0**。対照は履歴の担体を持たない（点 **0個**）ので、履歴という台帳は最後まで画面に現れない。第2の芯は**戻るは移動ではなく巻き戻し**であること。No.92「飛べるのは隣まで」はここでは成立しない——**履歴の隣は台帳の隣ではない**ので、経路を描くと囲みが台帳の上をでたらめに滑る絵になる。既定の着地は尺ゼロで、`戻る` を跨ぐ 30 サンプルの囲みの位置は **[270, 91, 90]px の3値**（270→90 の2つの実在の行と、0.14s の湧き（scale）由来の1フレームぶんの端数だけ）＝**中割りが1枚も無い**。対照は経路を描くので、行0↔行23 の1回の移動で **14 個の中間位置**を通り、移動距離の合計は **460px**（＝行高×23、隙間を丸ごとなぞる）、2操作で **769px**。第3は**台帳に跡を増やさない**こと。No.94「連れて行かれる」は台帳の中の移動だったので出発地に消えない印を置いたが、**履歴の移動は台帳の出来事ではない**ので、跡は履歴の帯（いま居る点より右に残っている点＝進める先）が持つ。実測で戻る／進むを6回しても台帳の中の印は囲み **1個だけ**、行に足した印は **0個**。第4は**捨てた分岐を捨てたと言う**こと。戻ってから別の行を選ぶと履歴の先が消える。既定は捨てられる点が **0.24s** で折れて消え（`is-truncating` が 0→**2**→0）、`data-history-len` が **4→3** に減り、`進む ▶` が**クリックと同じフレームで** `disabled` になる。対照は `進む ▶` が**有効のまま**で、押しても `data-place` は **15→15**＝**死んだボタン**になる。第5がこの標本のいちばん深いところで、**履歴には No.101 が「適用しない」と決めた古い現在地がそのまま積んである**。行を消してから戻ると、着地先の行がもう無い。既定は**席を作らず**（No.96 の継承）、`data-place` は**消えた行の id（8）のまま壊れず**、囲み **0個** / 欠けた点 **1個** / 空席 **0個** で、帯が `この位置の行はもうありません` と名乗る。対照は `data-place` が **14→9** と**黙って隣の生きている行に書き換わり**、その行に囲みが **1個**立つ——読み手には、自分がそこに居たように見える。第6は枠で、着地したとき現在地が既に見えていれば `scrollTop` は **20→20（偏差 0.0px）**、見えていないときだけ **280→20** / **→220** と**入る側の縁から最小量だけ**動かす（No.106 の継承）。実装が3つの罠を掘り当てた。ひとつ、**履歴の点を配列の添字で keying すると、前から間引いた瞬間に壊れる**——9点で打ち止めにして古い側を捨てる作りにしたので、React が「3番目の点」の DOM を使い回し、**別の履歴が入った枠に過去→現在→未来の色遷移が適用される**。単調増加する `seq` を振って解いた。ふたつ、C1（点の個数＝履歴の長さ）を**折りたたみの 240ms のあいだも**保つには、捨てられていく点を**数えられないクラス**（`-dot-ghost`）に移す必要があった。同じクラスのままだと、分岐を捨てるたび 240ms だけ個数が正当に増える。みっつ、`path` / `cursor` の確定と `進む ▶` の無効化は**クリックハンドラの中で同期に**やらないと、「同時に無効になる」が折りたたみの尺ぶん（240ms）遅れる。**見た目の順序は、状態を変える順序で決まる**（この回で3回目）。収録でも1つ分かった。**対照の「黙って隣の行に化ける」は、その隣の行がたまたま画面に見えていないと写らない**（対照は着地でスクロールしないので、状態は正しく壊れているのに画面には何も起きない）。消す行を現在のスクロール位置の近くに選び直して撮った——No.107「主題が写るかどうかは撮る位置で決まる」の再演である。企画が保留した3点は実装が決めた：履歴は **9点**で打ち止め（古い側から捨てる）、`この行を消す` が消すのは**1つ前に訪れた行**（現在地の行を消すと `戻る` を押す前に現在地が壊れて C5 の手順が再現できない）、消えた行に着地したあとも `進む ▶` は**効く**（履歴の構造は行の削除で壊れていない。ここで無効にすると「無効な未来」という概念を1つ発明することになり、設計の他のどこにも使い道が無い）。',
    Component: PlaceInHistory,
  },
  {
    id: 'replay-not-now',
    no: 113,
    nameJa: 'もう一度見せて',
    nameEn: 'Replay, Not Now',
    category: 'フィードバック',
    trigger: '「更新が届く」で実演を起こし、「もう一度」で再演する。**再演中に「更新が届く」を押す**（右上で「昔の話らしく見せる」対照に切り替え）',
    principles: ['再演の動きは実演と1msも変えない', 'ずれは動きの外側で言う', '事実でないものの跡を残さない'],
    ecology:
      'この回の3つめは、**過去に起きたことを、もう一度流す**場面である。見逃した更新をもう一度見せる「再演」は、**実演とまったく同じ動きでなければ確認にならない**。ところが同じ動きは「いま起きた」と主張してしまう——この標本の芯は、その2つが両立するかどうかにある。素朴な親切（再演だと分かるように半透明・0.5倍速で流す）は、No.74 が撃った「確度を薄さで言う」の再演版で、読み手はそれを**弱い変化**と読む（No.95）。それ以前に、**実演と同じものを見るという再演の目的そのものが壊れる**。既定の答えは、**動きに1msも触らず、ずれを動きの外側（枠）で言う**こと。実測で既定の実演と再演は `transition-duration` が `0.3s` / `0.3s`、`opacity` が `1` / `1` で**完全に一致**し、同じ相対時刻でサンプルした値の系列も一致する（着地時刻の差は数十ms、表示テキストは両系列とも同一）。対照は再演だけ `0.6s` / `0.5`（尺 **約840ms 対 既定420ms** ＝ちょうど2倍）で、再演の 0〜811ms は**旧値を表示したまま**動かず、864ms でようやく新値へ飛ぶ——**同じものを見た**にならない。実装がこれを構造で担保した。実演と再演は**同じ関数を通り**、既定のメタ情報は `kind`（実演か再演か）を**一度も見ずに**倍率1・不透明度1を返す。**分岐で揃えているのではなく、分岐そのものが無い。** ここで実装が企画に1つ足した。**値をカウントアップさせてはいけない**——数え直す動きにすると再演のたびに「0から始まる別の出来事」になるので、数字は即座に確定させ、動くのは着地の跳ねだけにした。これで「同じ相対時刻に同じテキスト」が構造から出る。第2の芯は**再演は「いま」を書き換えない**こと。再演中も `いまの合計` は最新値のまま動かない（実測 900ms 窓 17 サンプルで **1値のみ**）。対照は値を本当に巻き戻すので、同じ窓で **2値**（古い値へ戻り、また戻る）——**過去への書き込み**である。No.112 が「履歴の移動を台帳に書かない」と言ったことの裏返しで、こちらは**事実でないものを事実の側に書かない**。企画は「対照は値を巻き戻す」としか書いておらず**合計を含むかを決めていなかった**が、合計まで巻き戻さないと対照の壊れ方（いまが過去に書き換わる）が画面に出ないので、含めた。第3は割り込みで、**再演中に本物が届いたら再演を切る**。No.81「行きかけて、やめる」は途中でやめても残りの距離ぶんで引き返したが、**再演には守るべき連続性が無い**（事実ではないから）——引き返さず切ってよい。実測で既定は `is-replaying` が **63ms** で 0 個になり、値の変化は **66ms** で始まる。対照は再演を最後まで流してから実演を後ろに並べるので、`is-replaying` が **1341ms** 続き、実演の開始が **1345ms** 遅れる。その 1.3 秒のあいだ画面に出ているのは**古い値**で、読み手はそれを最新の変化として読む。**切ったことは1回だけ名乗り（`再演を中断しました`、約2秒で消える）、跡は残さない**（消灯後の残留物 **0個**）——No.71・No.94 が「跡を残せ」と言ったのは事実についての決めで、**事実でないものの跡を残すと、跡のほうが事実に見える**。第4は積まないことで、再演中に `もう一度` を押すと2本目が始まるのではなく最初から（`data-replay-t` の単調増加が **1回だけ 0 へ折り返す**）。`is-replaying` は全サンプルで **1以下**（`playState` を「実演でもあり再演でもある」が作れない単一の判別値にしたため）。実装が罠を1つ掘り当てた。**対照でタイマーが2本競合した**——再演の自然終了（840ms）とキュー処理（1300ms）が両方生きていると自然終了が先に発火して `is-replaying` が早く消え、**対照の壊れ方が測れなくなる**。割り込みが来た時点で自然終了を止め、**実演の開始そのものを再演の終わりにする**（`replay→live` の1回のコミット）形に直した。**「いつ終わるか」を2か所に書くと、状態は必ずどちらか早いほうで終わる。** 最後に、実装者が実物を見て出した判断がある。**破線と帯だけで「これは再演だ」は伝わる**（静止して読めば0.1秒で分かる）。ただし**帯は静止画として読む場合にしか効かない**——流し見していると、値の跳ねに目を取られて 0.6〜1秒の帯を読み落とす。動きを弱めずに直せる余地は帯の側（出す長さ）にしか無い、というのがこの標本の限界の在り処である。',
    Component: ReplayNotNow,
  },
  {
    id: 'preview-not-yet',
    no: 114,
    nameJa: 'まだ起きていないほうの動き',
    nameEn: 'Preview, Not Yet',
    category: 'フィードバック',
    trigger: 'つまみを握って動かす。離す（やめた）／`この配分で確定`を押す（確定した）（右上で「棒を薄く伸ばす」対照に切り替え）',
    principles: ['予告は事実の担体を動かさない', '予告に緩急を付けない', '消え方が「やめた」と「確定した」を分ける'],
    ecology:
      'No.111〜113 は「動きが語る時刻」を3通りに撃ったが、**3つとも過去と現在の話**だった（引き延ばす・巻き戻す・再演する）。残っている向きは1つ——**未来**。配分のつまみを握ると「この配分にするとこうなる」が3本の棒に先出しされる。多くの実装は**事実の棒そのものを予告値まで伸ばして半透明にする**が、これは2段階で壊れる。ひとつ、**棒が動いた時点で「もう起きた」と読まれる**——濃さの問題ではない。動きは常に「起きたこと」の語彙で、薄い動きは「弱く起きたこと」にしかならない。ふたつ、薄さは No.74「推定の狭まり」が確度の語彙として使っているので、予告を薄さで描くと**確からしさを言う手段が画面から消える**。だから既定は、**事実の担体（塗り）を1pxも動かさない**。実測でつまみを 0→100 まで動かす 25 サンプル中、既定の塗りの `width` は **distinct 1値・偏差 0.0px**、対照は **25 サンプル全部が異なる値・偏差 119.06px**。予告は塗りの先端から先に置かれる**破線の輪郭**で、`is-fact` / `is-preview` は濃さ違いではなく**別プロパティ**（fact は `border-top-style: none` + `background: rgb(61,61,61)`、preview は `dashed` + `rgba(61,61,61,0.05)`）。この標本の芯は第2の主張にある——**予告に緩急を付けてはいけない**。予告の輪郭には `width` の transition を**そもそも定義しない**（computed `transition-duration: 0s`、現れだけが `0.09s linear`）。実測で輪郭の位置は5回のジャンプに対し **distinct 5個・中間値 0個**、幅は 30 サンプルで **1値のみ**——**中割りが1枚も無い**。対照は同じ操作で塗りに **12 枚の中割り**が出る。**予告は位置の情報であって、出来事ではない。** ここで No.113 の答えが**そのままでは使えない**ことが分かった。No.113 は「再演は動きを1msも変えない」と言えたが、それは**本当に起きたこと**だから同じ動きで見せる正当性があった。予告にはそれが無い。**再演は動きを変えないのが正解で、予告は動きを見せないのが正解**——同じ「いつの出来事か」の問題でも、**過去と未来では答えが逆になる**。第3は確からしさで、No.74 の継承どおり**薄さではなく幅**で言う。3本の輪郭の `opacity` は定常時も**フェードの中間（`pointerdown` + 40ms）でも 0.37 = 0.37 = 0.37 と完全に一致**し、違うのは幅だけ（資金 **2px** / 開発速度 **2px** ＝実質幅ゼロの縦線 / 評価額 **68.875px**）。第4は退場の撃ち分けで、**予告は消えるのが常態**なので消え方が意味を持つ。**やめた**（台の上で離す）ときは輪郭が**幅を変えずに**消える——フェードの 120ms 中7サンプル全部で **68.88px・偏差 0.000px**、事実の塗りも **103.22 → 103.22 → 103.22 で移動 0.000px**。縮めて消すと読み手はそれを「値が減った」と読む（対照は実際に塗りが予告値から事実値へ**戻り**、中割りが **11 枚**出る）。**確定した**ときは輪郭が**消えず**、塗りが輪郭の中を満たしにいく——24 サンプル中**輪郭が消えているフレームは 0 枚**で、追いつき完了後の右端の差は **0.00px**。輪郭を消してから塗りを伸ばすと予告と事実が別の出来事に見えるので、**担体の入れ替わり**として見せる。第5に、幅を持つ評価額は**確定値が輪郭の中心に落ちない**（実測で塗りの右端と輪郭の右端の差 **46.83px**）。そのとき輪郭は**残って**「予告はここだった」を言い続け、次にホールドを始めた瞬間に置き換わる（No.71「旧い値は縁だけ残る」の予告版）。既定・対照で**確定後の事実の値は3指標とも完全に一致**（106.141 / 144.031 / 135.688px、差 0px）＝主張が余計な差を作っていないことの担保。**実装がこの標本でいちばん深い罠を掘り当てた。確定ボタンへ向かう動きそのものが、確定される値を書き換えていた。** ネイティブの `<input type="range">` はドラッグ中ポインタをキャプチャしたまま、**Y が台を外れて確定ボタンへ向かっていても X だけから value を更新し続ける**。実測で 71% までドラッグしてから確定ボタンの中心へ指を運ぶと、運んでいるあいだに value が **71 → 50** へ**読み手に見えないまま**書き換わった。C6・C7 は構造（輪郭が消えないか・残るか）を見ているので**通っていた**——**通っていたのに、確定は今見ている値のはずという主張そのものが壊れていた**（No.111 が踏んだ事故の再演）。直しは、つまみの中心 ±4px の帯を出た瞬間から value の更新を無視すること。帯を要素の見た目の高さ（26px）のままにすると広すぎて斜めの動きのあいだドリフトを許すので、**±4px まで細くした**（最悪ケースでも 71 → 69 で収束）。企画の穴も2つ埋まった。ひとつ、「離す＝やめた／確定を押す＝確定した」の**分岐点を企画が書いていなかった**——range はドラッグ中ポインタをキャプチャするので、握ったまま別のボタンへ通常の click を届けることは**構造的に不可能**。「握ったまま確定ボタンの上まで運んで離す」という一続きのジェスチャーにして、`pointerup` の座標と確定ボタンの矩形の当たり判定だけで分けた（ボタンの click には一切頼らない）。ふたつ、企画の「破線の輪郭」は暗に**4辺を持つ箱**を想定していたが、**幅ゼロの箱は存在しない**（左右の辺が同じ x に重なる）。確定的な2指標は結局 `border-left` だけの縦線になり、「輪郭」という語と「幅で確度を言う」の間に実装で埋める必要のあるギャップがあった。最後に収録が1つ教えた。確定へ運ぶときは**X を変えずに真下へ**切らないといけない——斜めに切ると上記のドリフトが起きて、**撮っている最中に主張が壊れる**。No.107 以来「主題が写るかどうかは撮る位置で決まる」と言ってきたが、この標本では**撮り方が主張そのものを壊す側に回った**。',
    Component: PreviewNotYet,
  },
  {
    id: 'compare-two-futures',
    no: 115,
    nameJa: '二つの予告を並べる',
    nameEn: 'Compare Two Futures',
    category: 'フィードバック',
    trigger: '2つの手にホバーし、クリックで留め置く。両方を並べてから片方を選ぶ（右上で「ホバー中だけ出す」対照に切り替え）',
    principles: ['2つの未来は同じ形・同じ濃さ。分けるのは名前', '同じ原点から測る', '選ばれなかった未来は縮めずに退場する'],
    ecology:
      'No.114 は予告を1つ描いた。**2つになると、1つのときには無かった問題が3つ出る。** 同じ週に打てる手が2つあり（`A 採用する` / `B 広告を打つ`）、共通の物差しは1本の棒（`3か月後の資金`）。ひとつめの問題は、**予告は普通ホバー中しか出ない**こと——手は1つなので2つ同時には出せず、比べるには**留め置く**しかない。ところが**留め置かれた予告は事実に見えはじめる**。ふたつめは、**比較は同じ物差しの上でしか成立しない**こと。1つずつ順に見せると読み手は**記憶で比べる**ことになる（No.111 の「同時に起きたことを順に見せる」の、比較の側での再演）。みっつめは、選んだ瞬間もう片方が「起きなかった未来」になること。実測で既定は `is-preview` が **2個**・`data-candidate` が `["a","b"]` で同時に立ち、対照（ホバー中だけ出す）は全サンプルで**最大 1個**。対照で A→B とホバーを移すと、その移動中に**予告が 0 個のフレームが 2 枚**挟まる＝**比較が途切れる**。既定で同じ比較をすると **0 枚**。第2の芯は**分けるのは名前だけ**であること。2つの輪郭は `border-style: dashed` / `opacity: 1` / `border-width: 2px` / `border-color: rgb(140,140,140)` まで**完全に一致**し、出所は引き出し線と名前だけが言う。**色で分けた瞬間、読み手はそれを「A は良い未来 / B は悪い未来」の評価として読む**——対照は青 `rgb(59,126,196)` と橙 `rgb(198,122,52)` に分けているが、そもそも1つずつしか出ないので、色は比較の役に立たないまま良し悪しの記憶だけを作る。**予告の担体が言うべきは「どちらの手から出た未来か」であって、どちらが良いかではない。良し悪しは読み手が決める。** 第3は物差しで、2つの輪郭は**同じ原点**（いまの事実の塗りの右端）から測る（`left` が **144px / 144px・差 0.0px**）。上下に段は分けるが原点をずらすと「A のほうが元から多い」と読める。第4がこの標本のいちばん細かいところで、**選ばれなかった未来の消し方**。順序は**選ばれたほうの塗りが伸び切ってから**（実測でクリックから塗りの着地まで **478ms**、退場開始まで **480.4ms**＝差 **2.4ms** で直後に始まる）。同時に消すと「選んだから消えた」のか「時間が来たから消えた」のかが読めない。そして退場のあいだ、選ばれなかった輪郭の**幅は変わらない**（全フレームで **24px 固定・偏差 0.0px**）し、**薄くもならない**（`opacity` は全フレームで **1**・変化量 **0**）。縮めると「値が減った」、薄めると「確度が下がった」（No.74 の語彙）と読まれるので、**端から線が欠ける**（`clip-path`）しかない。ピンを外すと予告は **2→1→0** と減り、そのあいだ事実の塗りは **144px の1値のみ・偏差 0.0px**。既定・対照とも決めた結果の事実値は **192px** で完全に一致する。**実装が起点のズレという罠を掘り当てた。** 初版は「塗りの尺（420ms）＋20ms だけ `setTimeout` で待ってから退場する」と書いていたが、実測すると**退場が塗りの `transitionend` より先に来る**ケースが出た。原因は起点で、`setTimeout` は**クリックの時刻**から数えるのに対し、CSS の transition が実際に走り出すのは**次のペイント**（実測 40〜50ms 後）。440ms の見積もりバッファではこのズレを吸収しきれず、**「伸び切ってから退場」という主張が壊れかけていた**。直しは、尺を見積もるのをやめて**塗り要素自身の `transitionend` を起点にする**こと——**「伸び切った」を時間の見積もりからではなく、ブラウザが実際にそう言った瞬間から取る**。修正後、着地から退場開始までは常に **2〜3ms**。この過程で第2のバグも出た。決めた直後、退場タイマーが始まる前の**一瞬で選ばれなかった輪郭が消えていた**——「決めた」と「退場を再生している」を1つの状態で持っていたため。表示を凍結する状態（`retiring`）と実際に `clip-path` を再生している区間（`retreating`）に分けて解いた。**「終わるまで見せる」と「終わらせる動きを再生する」は別の状態である。** 企画の穴も埋まった。**「留め置く」と「決める」を別の入口にした**（クリックはピンのトグル専用、決めるのは専用ボタン）——同じクリックに2つの意味を載せると、1回目のクリックが**取り消せる行為なのか戻せない選択なのか**がコード上も読み手にも曖昧になる。また、比べずに直接「決める」を押した場合は退場そのものを起こさない（**一度も見えていなかったものの消滅を演出する意味は無い**）。企画の誤りも1つ出た。受け入れ条件 C2（輪郭の一致を `border-style` の computed style で見る＝ネイティブ CSS 前提）と C5（消え方を `stroke-dashoffset` 相当で＝SVG 前提）は、**文字どおりには両立しない**。輪郭本体は `border: dashed` のまま保持して C2 を満たし、退場だけ `clip-path` に切り替えて C5（width / opacity に触れない）を満たす二層で解決した。最後に、この回の分担そのものが代償を1つ生んだ。**No.114 と並行して実装したので、114 の `style.css` は実装時点でまだ雛形のまま**——破線のピッチ・太さ・角丸の実値を継承できず、企画書の記述（破線・角丸・尺ゼロ）だけを頼りに値を決めることになった。**同じ語彙を共有する標本を同じ回に並列で作ると、語彙の実体は企画書の文章の側にしか無い。**',
    Component: CompareTwoFutures,
  },
  {
    id: 'irreversible-step',
    no: 116,
    nameJa: '戻せない操作',
    nameEn: 'Irreversible Step',
    category: 'ナビゲーション',
    trigger: '2つのボタンにホバーして履歴の列を見る。`週を確定する`を押したまま外へずらす／そのまま離す（右上で「確認ダイアログ」対照に切り替え）',
    principles: ['二値を強弱で語らない', '戻せないは履歴の担体が増えないことで言う', '引き返す余地は作るが、時間は要求しない'],
    ecology:
      'この回の3つめは、**未来が閉じる**場面である。`配分を変える`（戻せる）と `週を確定する`（戻せない）が並び、画面にはもう1つ、No.112 が作った**履歴の点の列**がある。可逆／不可逆は**二値**で、この図鑑が持たない方針の閾値ではなく**境界そのもの**が主題になる。多くの実装は二値を**強弱**で語る（赤く・大きく）が、それは「重要な操作だ」と言っているだけで、**押した後に何が起きるかを何も言っていない**。既定の答えは、**新しい担体を足さず、すでにある担体（履歴の点の列）の未来を語る**こと——可逆な操作は点が **+1**、不可逆な操作は **±0**。**担体が動かないことで語る**のは No.106「動いていないものを動きで語らない」の**逆側**で、図鑑がここまで試していなかった手になる。だから既定では**2つのボタンの見た目が完全に一致する**（`background-color: rgb(255,255,255)` / `font-size: 12px` / `166×41px`）。**差は履歴の列にしか出ない。** 対照は同じ操作で可逆も不可逆も **+1** ずつ積み（差 **0**）、代わりにボタンを赤く（`rgb(192,57,43)`）大きく（`14px`）する。押す前の予告は No.114 の担体（破線の輪郭・尺ゼロ）を借りて、**ボタンの側ではなく列の末尾に**出す——可逆側にホバーすると次に積まれる点の**空席**が 1 個、不可逆側では空席 0 個で代わりに**縦の締め線**が 1 個。20 往復のサンプルで**両方が 1 以上のフレームは 0 枚**（空席の個数は常に `[1]`、締め線も常に `[1]`）。押しているあいだが第2の芯で、`pointerdown` から締め線が引かれ（`data-armed` 0→1）、**外へずらして離すと引き戻る**（1→0、`data-week` の変化 **0**）。ただし**長押しを要求しない**——押下 **30ms / 60ms / 300ms** のいずれでも確定する。**じらしではない**（No.18「宝箱」が期待の語彙に使った緩急を、警戒に流用していない）。引き返す余地を見せているだけで、時間を人質に取っていない。No.67「取り消し猶予のほどけ」が**事後**の猶予だったのに対し、これは**事前**の猶予である。押したあとは、履歴の点が1つも増えないまま**それまでの点も辿れなくなり**（`data-history-len` **0**、`◀ 戻る` は `disabled`）、締め線だけが **1 個**残る。可逆な操作の後は点が **+1**、`◀ 戻る` は有効で押すと戻る（`data-place` **55→50**）。**「戻るボタンが押せない」はボタンの状態だが、「列が締め切られている」は台帳についての事実**で、別のことを言っている。対照は確定までに **2 クリック**（既定は **1**）を要し、`role="dialog"` が **1 個**出て読み手を止め、そして確定後の列に締め線は **0 個**——**戻れないことが画面のどこにも残らない**。既定・対照とも確定後の `data-week` は **1→2** で一致する。**この標本は、実物を目視して初めて直った点がいちばん重要になった。** 数値条件（空席1個 / 締め線0個の撃ち分け）は正しく通っていたのに、履歴の列が**空のとき**は担体が地の色に溶けて**画面から読めなかった**。点が3個ある状態なら両方はっきり読める——つまり**担体が読めるかどうかが、列に既に点があるかどうかに依存していた**。この標本の主張は「差は履歴の列にしか出ない」なので、列が空のときに読めないのは主張そのものが死んでいるのと同じである（PR #32 の No.111 が踏んだ「通っていたのに、通り方が間違っている」の再演）。直しは、点が0個でも見える**レール**（場所の提示だけで事実を言わないので No.95 の担体には数えない）を敷き、空席と締め線の線色を `#b3b3b3 → #6e6e6e`、線幅を `1.5px → 2px` に上げること。**担体は、それが載る場所が描かれていないと読めない**——No.104 の「空間を描かないと空間についての主張は動きにならない」が、列という1次元の空間で再演された。収録の順序もこれで決まった。**先に点を積んでから予告を見せる**（列が空のままホバーを撮ると担体が浮くだけで主題が写らない）。実装が3つの罠も掘り当てた。ひとつ、`display: flex` の既定値 `align-items: stretch` のせいで、対照のボタンにパディングとフォントサイズを与えても**兄弟のボタンが一緒に背伸びして高さが揃う**（実測で対照でも両方 `166×50`）。**レイアウトが吸収してしまう `width`/`height` は、対照の壊れ方を示す指標として弱い**——見るべきは `background-color` や `font-size` のような内在的な値のほうだった。ふたつ、`pointerup` で受理してからキーボード対応に `onClick` を足すと、実マウスでは合成 `click` が続けて発火して **`week` が二重に加算される**。旗（`pointerHandledRef`）を `pointerdown` で立てて `click` で消費する形で解いた——No.105 の「旗の立てっぱなし」と同じ系譜の問題が、pointer と click の共存という別の入口から出ている。みっつ、`setPointerCapture` 中は `pointerleave` / `pointerout` の発火がブラウザ依存でぶれるので、外へ出たかは**座標判定**で持つ。ただしこの「境界イベントが抑制される」性質は逆に利いて、要素がアンマウントされないまま残るため、締め線の引き戻る transition が**同じ DOM の上で自然に走る**。そして No.112 が名指しした罠（点を配列の添字で keying すると React が DOM を使い回して色分けが1つ手前にすり替わる）は、`push`/`pop` のスタックでも**同じ形で踏みかけた**——`seq` を key にして回避している。企画が決めていなかったことも実装が3つ決めた。`進む ▶` が無いので履歴は**スタックで十分**（分岐を保持する必要が無いため No.112 の「捨てる瞬間」の演出も要らない）、確定後は**両ボタンを恒久的に無効**にする（押せるままだと締め線の**後ろ**に点が増えるという、主張と矛盾する絵が起こり得る）、対照の履歴は**両方同じように積む**（ナイーブな実装が「全操作を同じログに書く」形で可逆性を見失うほうが実態に近い）。',
    Component: IrreversibleStep,
  },
  {
    id: 'preview-out-of-date',
    no: 117,
    nameJa: '届いた予告はもう古い',
    nameEn: 'Preview, Out of Date',
    category: 'フィードバック',
    trigger: 'つまみを握って動かす（予告は取り寄せなので遅れて届く）。手を止める／離す（右上で「届いた順に差し替える」対照に切り替え）',
    principles: ['待機で予告を消さない', '鮮度は薄さではなくズレで言う', '古い予告は着地させない'],
    ecology:
      'No.114〜116 は「まだ起きていないこと」を3通りに撃ったが、**3つとも検証せずに前提していたことがある**。ひとつめが「予告はすぐ出せる」——手元で計算できるものとして扱っていた。実際の予告は取り寄せになることが多く（サーバ・シミュレーション・見積もり）、**読み手はつまみを握ったまま待つ**。この標本は遅延を標本の中で偽装する（値ごとに決まる疑似ランダムの `160 + (value * 37) % 260` ms。乱数を使わないので同じ操作が同じ結果を出す）。芯は待機中に予告の担体が何を言うかである。**消してはいけない**——No.114 が「輪郭が消える」に**やめた**の意味を割り当てているので、待機で消すと「待っているだけなのに予告が取り下げられた」と読める（**担体の空きの二重使用**）。**動かしてもいけない**——動かした先はまだ計算されていない未来で、それは推測の上書きになる。だから既定の輪郭は**消えず、計算された時点の値の位置に留まる**。実測でドラッグ全域 30 サンプル中、輪郭が 0 個のフレームは **0 枚**、事実の塗りの `width` は **distinct 1 値・偏差 0.0000px**（No.114 の継承。この標本では確定そのものを置かなかったので、塗りを動かす手段が**構造的に存在しない**）。第2の芯は**鮮度をどう言うか**である。薄さは No.74 が確度に使っているので、鮮度を薄さで言うと確からしさを言う手段が消える。既定は輪郭と現在のつまみのあいだに**係留線**を1本引き、**その長さがそのまま予告の古さ**になる（`data-lag-px`）。実測で待機中は全フレームで lag > 0、着地直後は全フレームで lag = 0 になり、そのあいだ輪郭の `opacity` は **distinct 1 値**（出現の 90ms フェード完了後）＝**薄さは1度も鮮度を語っていない**。ここで言っておくべきことがある——**動いているのはつまみであって、予告ではない**。係留線が伸びるのは事実（つまみが動いた）についての動きで、輪郭のほうは No.114 どおり `transition-duration` が **`0s`**、着地の数 = 位置の distinct 個数（実測 6 = 6）で**中間値 0 件**＝中割りが1枚も無い。第3は**古い予告を着地させない**ことで、届いた応答がいま握っている値のものでなければ捨てる。実測で単調増加のドラッグ中、既定の `data-preview-for` は**後戻り 0 回**。対照（届いた順にそのまま差し替える）は同じ操作で**後戻り 5 回 / 16 着地**（一時停止あり）・**18 回 / 54 着地**（止まらず動かし続ける）——**つまみは前へ進んでいるのに、予告が後ろへ戻る**。到着順のログは `45,52,48,55,59,66,62,73,69,77,80,87,84,94,91,98` で、遅延がばらつく以上これは事故ではなく常態である。対照はさらに `transition-duration` **0.26s** で滑るので、30 サンプル**全部**が遷移の途中＝**まだ起きていない未来が「起きたこと」の語彙で描かれ続ける**。**実装が、企画が書いていなかった壊れ方を1つ実演した。** 対照は「古さを名乗らない」だけでなく、**手を離したあとも保留中の取り寄せが律儀に届いて動き続ける**（離してから 700ms で到着ログが 33 → 42 件に伸び、最終的に離した位置の近くへ着地する）。**古さを名乗らない実装は、静止するのではなく、いつまでも遅れて動き続ける。** 実装の判断も3つ効いている。ひとつ、指標を **1 本**にした（No.114 は3本）——主題が鮮度そのものなので、3本あると「どの指標の鮮度を見ているか」で主題が割れる。ふたつ、**係留線に transition を付けなかった**——付けると見た目の端点と `data-lag-px` がズレる瞬間が生まれ、測れることが崩れる。みっつ、取り寄せの受理判定を**1つの関数に集約**し、モードで分けるのは「受理するかどうか」だけにした（**対照が壊れるのは受理の仕方であって、取り寄せの仕組みではない**という主張をコードの形にした）。React の側でも罠が1つ出ている。**既定の輪郭にだけ `key={holdSession}` を付ける必要がある**——対照はホールドを跨いで同一の DOM であり続けなければならない（離した後も応答が届いて動くため）一方、既定で key を外すと、消えかけの輪郭と次のホールドの輪郭が同じノードになり、フェードアウトの途中の透明度から次のホールドが始まる。最後に「やめた」の撃ち分けは No.114 と同じで、台の上で離すと輪郭は**幅を変えずに**消える（フェード中 8 サンプルで幅の偏差 **0.0000px**、事実の塗りの移動 **0.0000px**）。**待っているあいだは消えず、やめたときにだけ消える**——担体の空きは、1つの意味しか持てない。',
    Component: PreviewOutOfDate,
  },
  {
    id: 'preview-missed',
    no: 118,
    nameJa: '予告どおりに来なかった',
    nameEn: 'Preview Missed',
    category: 'フィードバック',
    trigger: '手を選んで確定する。1週目は下振れ、2週目は同じ幅で上振れ、3週目は的中（右上で「外れたら消して警告する」対照に切り替え）',
    principles: ['外れをUIが名乗らない', '外れは次の予告の幅になる', '外れの向きで語彙を変えない'],
    ecology:
      'No.114 は「確定すると塗りが輪郭の中を満たす」と決めたが、**満たさなかった場合を決めていなかった**。この標本はそこを撃つ。3週ぶん順に手を打ち、進行は決め打ちの台本にする（予告は毎週 +40。実際は 1週目 **+18**＝下振れ、2週目 **+62**＝**同じ大きさで逆向き**の上振れ、3週目 **+40**＝的中）。まず言っておくべきは、**これは No.69「楽観のあと出し訂正」ではない**ことである。あちらは事実を先に効いたように見せて失敗が返ると引き剥がす話だった。こちらは**確定が成功している**——引き剥がすべき事実はどこにも無く、外れたのは予告のほうである。**訂正ではなく、確度の更新**。第1の芯は **UI が外れを名乗らない**ことで、既定は着地後も輪郭が残り（着地後 30 サンプルで輪郭の個数は常に **1**、消えるフレーム **0 枚**）、**塗りの右端と輪郭の右端の差がそのまま画面に残る**（実測 **44.00px**、`data-miss-px` の値と**差 0.00px** で一致）。文言も同じで、既定の状態表示は的中でも外れでも **「確定しました」で完全に同一**——**違いは輪郭と塗りの位置関係にしか出ない**。対照は着地後に輪郭が **0 個**になるので、**何と比べて外れたのかが画面に残らない**。第2の芯がこの標本の中心で、**外れは1回の出来事ではなく、次の予告の幅になる**。No.74 と No.114 が確からしさを**幅**で言うと決めているので、外れたぶんは次に出る輪郭の幅へ積む——実測で予告の輪郭は **4px → 26px → 48px**（増分 **+22 / +22**）と太っていく。**3週目の輪郭がいちばん太い＝いちばん当てにならない**、が画面から読める。対照は履歴を持つ仕組みそのものを持たないので3週とも **20px**（distinct 1 値）で、**何回外れても次の予告の見え方は変わらない**。第3は向きの対称性で、下振れと上振れで跡の `border-color` **rgb(61,61,61)** / `opacity` **1** / `border-style` **dashed** が**完全一致**し、幅の増分も **+22 と +22 で同値**。対照は下振れの週だけ塗りが赤 **rgb(179,58,58)** になり、同じ大きさの上振れには何も付かない（**rgb(61,61,61)**）——さらに文言まで「確定は成功。予告どおりでした」と言ってしまう。**同じだけ外れたのに、片側だけが記憶に残る＝確度の見積もりが片側にしか育たない。** 第4に、外れを**出来事として演出しない**。既定は確定から着地までのあいだ輪郭の computed `animation-name` が **`none`**、`transition-duration` が **`0s`**（No.114 の「予告に緩急を付けない」の継承）。対照は `mz-preview-missed-vanish` が付く。震え・色・トーストで語ると「事故が起きた」の**評価**になるが、実際に分かったのは「この予告はこの程度しか当たらない」という**恒常的な性質**のほうで、読み手が次の判断に使えるのはそちらである。的中したときは跡が残らない（3週目の着地後、輪郭の要素は **0 個**）。そして事実の担体は汚れない——3週の着地後の塗りの `width` は既定・対照で **36 / 124 / 80px** と**完全一致**（差 **0px**）＝主張が余計な差を作っていないことの担保である。**実装が CSS のボックスモデルの罠を1つ掘り当てた。** 1週目の輪郭幅を 0（まだ外れの実績が無い）にしたところ、この輪郭は4辺に `border: 1.5px dashed` を持つ箱なので、**`width: 0` でも content box を負にできず、実際の描画幅が border のぶん広がる**。輪郭の右端が期待値より 2px ずれ、C2 の一致が **46px 対 44px** で一度落ちた。最小幅を border 合計（3px）より大きい **4px** に上げて解いている（No.114 が「幅ゼロの箱は存在しない」を**左辺だけの線**に逃げて解いたのに対し、こちらは箱のまま最小幅で解いた。同じ罠の別の出口）。実装の判断も1つ効いている。**輪郭を「右端固定・左に伸びる箱」にした**——中心対称に広げると幅が変わるたび右端も動き、実測差が幅に依存してしまう。右端を予告値に固定したことで、**実測差が幅と構造的に独立**になり、`data-miss-px` との一致が偶然ではなくなった。企画の言葉に足りなかったところも1つある。「跡は次の予告が出た瞬間に置き換わる」は、素直に書くと `idle`（跡が消えた状態）を経由して**跡が 0 個になるフレーム**が生まれる。1クリックで `week` と `phase` を同時に進め、`idle` を通らない形にして解いた。最後に、実物を見て直った点がこの回もある。**トラック（レール）が舞台の地色と同色で、実質見えなかった**——数値条件は全部通っていたのに、塗りと輪郭が何もない余白に浮いて「これは何かを測っている場だ」が伝わらない。背景を `#dededa` ＋ 内側 1px の縁取りに変えて、下振れ（塗りが輪郭の手前で止まる）と上振れ（塗りが輪郭を突き抜ける）が一目で読めるようにした。**担体は、それが載る場所が描かれていないと読めない**（No.116 のレールの再演。前回と同じ失敗が、別の標本で、別の実装者の手で再現した）。',
    Component: PreviewMissed,
  },
  {
    id: 'expired-by-doing-nothing',
    no: 119,
    nameJa: '何もしなかったことで閉じる',
    nameEn: 'Expired by Doing Nothing',
    category: 'ナビゲーション',
    trigger: '機会に触らないまま `次の週へ` を押していく。取った場合と見比べる（右上で「期限切れで消える＋トースト」対照に切り替え）',
    principles: ['起きなかったことを動かさない', '残り時間に担体を足さない', '読み手がやったことは履歴に、時間がやったことは定規に'],
    ecology:
      'この回の3つめは、**読み手が何もしなかったことで閉じた未来**である。No.116 は「戻せない操作」を**履歴の点が増えないこと**で言ったが、その答えはここでは使えない——**操作が無いので、履歴に対応する出来事そのものが無い**。担体を置く相手が居ない（No.108〜110 の「担体が無い」とは別の理由で、行でも台帳でもなく**出来事**が無い）。既定の答えは、**担体を履歴から週の定規へ移す**こと。機会（`人を採る`＝2〜4週 / `出展枠を押さえる`＝5〜7週）は定規の上の**区間**として描かれ、現在地の縦線がその右端を通り過ぎる。**起きなかったことは動かせない。動かせるのは、起きたこと（時間が進んだこと）だけ。** 実測で失効の瞬間、既定の区間は `left` 差分 **0.000px** / `width` 差分 **0.000px** / `opacity` 差分 **0.000**（20 フレームでも最大差分すべて 0）、同じ窓で位置が変わった要素は**現在地の縦線 1 個だけ**（目盛り 12 個・区間 2 個・ボタン 3 個はすべて **0.00px**、縦線のみ **41.19px**）。対照（期限切れでカードが消えてトーストが出る）は同じ瞬間に要素が **1 → 0 個**になる。**退場の動きを使わないのが第2の芯**で、No.86「抜けたあとの席」は「先に抜け、ひと拍おいて席が閉じる」を**読み手が起こした退場**の語彙にしている。同じ動きで「勝手に閉じた」を言うと、**読み手は自分が閉じたと思う**。第3は残り時間で、専用の担体を**足さない**。閉じる **3週前 / 1週前 / 0週前**の3時点で、既定の区間は `border-top-width` / `border-style` / `border-color` / `background-color` / `animation-name` / `opacity` が**すべて完全一致**（`1px solid rgb(110,110,110)` / `rgb(211,211,208)` / `none` / `1`）——**残り時間を言っているのは、区間の右端と現在地の距離だけ**である（**空間が期限を言う**）。対照は1週前に `mz-...-urgent-blink` が付き背景が薄赤に変わる＝**警告の担体が1つ増える**。ここを足すと、No.114 の予告の担体が警告に流用され、読み手は以後**予告を全部警告として読む**。第4は台帳の分離で、失効の前後で履歴の点は **±0**（0→0）、締め線は **0 個**——**No.116 が締め線を残すのに対し、こちらは履歴に1pxも書かない**。一方で機会を**取った**ときは点が **+1**（0→1）。**読み手がやったことは履歴に、時間がやったことは定規に。台帳が違う。** **企画がいちばん微妙だと名指しした「畳み方」を、実装が構造で解いた。** 畳む（詳しさを落とす）ことは No.91 が許しているが、畳みを失効と同じ週送りでやると、C1 が見張るまさにその1クリックの前後で区間の見た目が動いてしまう。実装は畳みの発火を**失効した週ではなく、そこからもう1つ後の週送り**に置いた（`week - end >= 2`）。失効を起こしたクリックでは `is-folded` が付かない——**分岐で隠しているのではなく、参照するルールがまだ存在しない**。結果として、失効直後の1週間は**過ぎているのに何も畳まれていない**空白が残る（実測で week4 と week5 の絵は完全に同一）。その1週間、読み手が「過ぎた」と知る手段は**縦線が区間の右端より右にある**という位置関係だけになる。**畳みは、閉じたことを知らせる合図ではなく、後からの整理である**——これが「空間が期限を言う」を最後まで通した形になった。跡は時間では消えない。失効から3秒（週は進めない）では跡 **0 個**、そこから週を2つ進めると **1 個**に転じてそのまま残る（**畳みは時間基準ではなく週基準**）。週を一気に3つ進めて失効の瞬間を飛ばしても跡は **1 個**（No.89「見ていないあいだに終わったこと」に耐える）。対照はカード **0 個**・トースト **0 個**（`TOAST_MS = 1800ms` で自動的に消える）＝**閉じたことが画面のどこにも残らない**。ひとつ正直に書いておくべきことがある。**「もう取れない」を言っているのは、区間ではなくボタンのほうである**——`取る` は週が過ぎた瞬間に `disabled` になる（実測で週5に入った瞬間、1つめの機会のボタンだけが disabled）。この標本の主張は「機会の担体を動かさない」ことであって「何も変わらない」ことではない。**閉じたことは操作の側（押せなくなる）が言い、閉じた経緯は定規が言う。** 実装は計測の側の罠も1つ掘り当てた。**対照の「見ていないあいだ」を測るときは、退場アニメ（320ms）とトースト（1800ms）の尺より十分長く待たないと、DOM 上まだカードが残っていて「対照は 0 個」の主張が早すぎるタイミングで落ちる**。見ていないあいだの話を測るテストは、見ていない時間のほうを実際に経過させる必要がある。実物を見て直った点も1つ。初版の区間の配色（背景 `#e2e2e0`・枠 `#8c8c8c`）はカードの地色 `#eaeae8` に対して輪郭がわずかに浮く程度で、**「機会の帯がそこに在る」こと自体が読み取りにくかった**。背景 `#d3d3d0` ・枠 `#6e6e6e` まで濃くして解いている。',
    Component: ExpiredByDoingNothing,
  },
  {
    id: 'preview-gives-up',
    no: 120,
    nameJa: 'もう予告できない',
    nameEn: 'Preview Gives Up',
    category: 'フィードバック',
    trigger: '`次の週へ` を押して週を進める。4週ぶん外し、5週目に予告が台に収まらなくなる（右上で「幅は固定のまま出し続け、当てにならなくなったら消して警告する」対照に切り替え）',
    principles: ['境目は閾値ではなく幾何で取り出す', '予告をやめても担体を空けない', '当てにならなさを、消さずに残す'],
    ecology:
      'No.118 は「外れは次の予告の幅になる」と決めた（実測で 4 → 26 → 48px と太った）。しかし**積み切ったときのことを決めていない**——幅がどこまでも太れるなら、予告は出ているのに何も言っていない状態が永遠に続く。この標本の問いは**「もう予告できない」を予告の担体で言えるか**である。難所は2つあった。ひとつ、**幅は連続なのに「もう予告できない」は二値の宣言**である。境目に数値の閾値を置くとこの図鑑が持たない方針の閾値（No.106）が要り、置かないと「少し当てにならない予告」が出続ける。ふたつ、**輪郭を消す手は封じられている**——No.114 が「輪郭が消える＝やめた」を確定させているので、消すと「予測をやめた」と「予測できない」の区別が付かない。第1の芯は**境目を幾何で取り出す**ことである。輪郭は No.118 と同じく右端＝予告値に固定して左へ幅ぶん伸びる箱なので、幅が太ると**左端がトラックの左端を割る**。割った予告は「トラックのどこでもありうる」と言っているのと同じで、**構造的に情報を持っていない**。境目を決めているのは定数ではなく**トラックの物理的な端**である。実測で輪郭の幅は **4 → 26 → 71 → 136px**、各増分（**22 / 45 / 65**）が直前の |外れ| と**差 0.00px** で一致し、5週目で **244px** に達して台に収まらなくなる。その瞬間、輪郭は**トラック全幅**になる（left がトラック左端と **0.00px**、right が右端と **0.00px**、`left=0 / width=300` ちょうど）——**行き先が無い**、という1枚。第2の芯は**担体を空けない**ことで、輪郭は消えるが**同じ欄に過去の実測の点が残る**。No.114 の「やめた」は消えたあとに何も残らないが、こちらは点が残るので、**空きの二重使用にならない**。点は過去に実際に起きた値を打っただけで**未来のどの1点も指しておらず**、それでいて**履歴の列へは移していない**（実測で6点すべての中心 y が **173.16px**、トラックの上端 **164.16**〜下端 **182.16** の内側）＝担体は予告の欄のまま。実測で引き渡し後の輪郭は **0 個**、点は **4 個**（過去の実測回数と一致）で、週を進めるごとに **5 → 6 個**に増え、輪郭は **0 個のまま**。点の中心 x は各週に確定した塗りの右端と**6点すべて差 0.00px**、`opacity` **distinct 1 値**・`background-color` **distinct 1 値**・`width`/`height` とも **distinct 1 値**＝**古さも順番も、薄さでは1度も語っていない**。引き渡しは予告側だけの出来事なので、事実の塗りの `width` の差分は **0.000px**。文言も引き渡しの前後で**完全に同一**（`確定しました`）で、既定の DOM に「予測不能」「分からない」の語は **0 件**、輪郭・点の `animation-name` は **`none`**・`transition-duration` は **`0s`**（No.114 の継承）。対照（幅 20px 固定で出し続け、当てにならなくなったら消して赤い `予測不能` を出す）は、4回外しても幅が **20.00px 固定**・増分 **0.00 / 0.00 / 0.00**＝**何回外れても予告の見え方が変わらない**。さらに5週目以降は輪郭 **0 個・点 0 個**のままで、**判断の材料が何も残らない**——消すと No.114 の「やめた」と同じ絵になり、読み手には「やめた」と「できない」の区別が付かない。文字列も `確定しました` → `予測不能`（**rgb(192,57,43)**）と変わる。**企画の誤りが1つ、実物を見て見つかった。** 引き渡しが起きる週、事実の塗りは前週の値 **253px** まで伸びており、そこで出る4点は **128 / 175 / 215 / 253px**——**4点すべてが塗りの中に入る**。点も塗りも `#3d3d3d` なので、**この標本がいちばん見せたいフレームが、絵として空になっていた**。しかも C1〜C8 は全部通ったままである（C4 は点どうしが同じ見た目かを、C8 は点がトラックの矩形の中にあるかを見ているだけで、**濃い担体の上で読めるか**を誰も測っていない）。点に地色の縁（`box-shadow: 0 0 0 2px #eaeae8`）を付けて解いた——`box-shadow` はレイアウトを動かさないので、C5 の中心 x も C8 の中心 y も1pxも変わらない。**担体は、それが載る場所が描かれていないと読めない**の3回目だが、今回は地の色ではなく**別の担体（事実の塗り）が下地になった**という新しい形だった。実装の判断も2つ効いている。ひとつ、**「同じクリックの中で輪郭が点へ置き換わる」は CSS では繋げなかった**——輪郭に `animation` も `transition` も持たせない縛り（C7）があるので、全幅の1枚と点の並びを CSS で繋ぐ手段が無い。1クリックの中で「即座に全幅へスナップ → 650ms 後に点へ」という**JS タイマーの自動遷移**にして、読み手の追加操作を挟まずに解いている。**緩急を禁じた担体で2つの状態を続けて見せるには、時間差を JS の側に置くしかない。** ふたつ、台本が**週5に実測値を持たない**ことが C6 をほぼ自動的に満たした——塗りは実測値がある週だけ更新されるので、週5では触れられようがない。もし週5にも実測があったら「輪郭だけ全幅にして塗りは動かさない」という分岐を明示的に書く必要が生じ、**境目の出来事が輪郭と塗りの2箇所に分散していた**はずである。外形は **320 × 147.7px**。',
    Component: PreviewGivesUp,
  },
  {
    id: 'taken-by-someone-else',
    no: 121,
    nameJa: '先に取られていた',
    nameEn: 'Taken by Someone Else',
    category: 'ナビゲーション',
    trigger: '2行目の `取る` で成功を見てから、3行目の `取る` を押す。1行目は最初から埋まっている（右上で「一度枠に入れてから引き剥がし、行を消してトーストを出す」対照に切り替え）',
    principles: ['他人の分は動いて現れない', '駒は枠に一度も入らない', '履歴に載るのは「取られた」ではなく「取れなかった」'],
    ecology:
      'No.116 は**読み手が閉じた未来**を、No.119 は**時間が閉じた未来**を扱った。残っているのは **他人が閉じた未来**——3人目の主語である。第1の難所は台帳で、No.119 が「読み手がやったことは履歴に、時間がやったことは定規に」と決めた以上、**他人がやったことはどこに載るのか**が決まっていない。3つめの台帳を足すと読み手が覚える語彙が1つ増え、既存のどちらかに載せると他人が自分の履歴に混じる（No.98「他人は主役にならない」）。既定の答えは**台帳を足さず、他人を載せないこと**である。履歴に載るのは**読み手がやったこと**だけで、しかも載る名前は「取られた」ではなく **「取れなかった」**——同じ出来事の別の名前だが、読み手の画面に載るべきなのは読み手の側の名前のほうだ。実測で履歴は行C（不成立）で **+1 件**、行B（成功）で **+1 件**、行A（最初から他人のもの）では **±0 件**（ボタンが `disabled` なので操作そのものが起こらない）。既定の履歴の DOM テキストは `取った取れなかった` で、**「他」を含む要素は 0 個**。第2の芯は、**他人の分は動いて現れない**ことである。**出発点が画面の外にあるものは、動きで描けない**——移動には出発点が要る（No.88「行き先が画面の外」の逆で、こちらは出発点が外にある）。動かした瞬間、それは「いま目の前で起きたこと」になり、実際には**とっくに起きていたこと**が嘘になる。実測で行Aの取り分は立ち上がりから30フレームで `opacity` **distinct 1 値**・x 偏差 **0px**・y 偏差 **0px**、`animation-name` **`none`** / `transition-duration` **`0s`**。第3の芯が本命で、**触りに行っている最中に取られた場合**である。押した後に「取られていました」と返るのは No.69「楽観のあと出し訂正」と同型に見えるが、**こちらは負けた相手が居る**——引き剥がすと読み手は自分の操作が失敗したと読む。実際には操作は届いていて、遅かっただけである。既定は**引き剥がさない**。駒は枠へ向かって滑り出し、**枠の手前で止まり、そのまま自分の欄へ戻る**。実測で押してから戻り切るまでの **55 フレーム**で、駒の矩形と枠の矩形の重なりは**最大 0px²・非ゼロのフレーム 0 枚**＝**駒は枠に一度も入らない**。**操作は届いた（駒は出発した）／結果が無かった（枠に入らなかった）／失敗ではない（駒は消えず、跡が残る）** の3つが、1つの動きで撃ち分けられている。他人の分が枠に現れる瞬間、**枠そのものは動かない**（`left` / `top` / `width` / `height` の差分がすべて **0.000px**）。行も消えない（押す前・止まっているとき・戻り切ったあとで **1 個のまま**）。戻りは跳ねず（戻り区間 **29 サンプル**で自分の欄を越えるフレーム **0 枚**）、出（240ms）と戻り（420ms）は**非対称**である。そして**行B（成功）と行C（不成立）の出の動きは同一**で、**違いは着地するかどうかにしか出ない**——既定は結果を述べる文言を1つも持たない（「取得できません」「失敗」「他のユーザー」が **0 個**）。対照（一度枠に入れてから引き剥がし、行を消してトーストを出す）は同じ操作で重なりが **最大 196px²**（＝駒の全面積。枠に完全に内包される）に達するフレームが **38 枚**あり、行は **1 → 0 個**になり、トーストが `他のユーザーが取得しました` と**他人を主語にする**（1800ms で自動的に消える）。**対照には、企画が挙げた3つの壊れ方に加えて4つめが自然に生まれた。** 行を消すと、**その行に紐づく記録を書く先そのものが無くなる**——結果として対照は行Cの不成立を**履歴に1件も残さず**（実測 **+0 件**）、1800ms で消えるトーストだけに頼る実装になった。意図して増やしたのではなく、「台帳を足さない」を対照側にも一貫させた帰結である。**実装が、数値条件の届かない範囲を1つ実演した。** 他人の取り分は「枠の中にある」ので JSX でも枠の子要素にしたのに、CSS は当初**レーン側の座標系**（`left: 281px`）で書かれており、実際の containing block は 24px 幅の枠なので**画面の外まで吹っ飛んでいた**。それでも **C1〜C8 は全部通る**——C1 が見ているのは「動かないこと」であって「**正しい場所にあること**」ではないからである。**目で見て初めて気づいた**。`left/top: 50%` + `transform: translate(-50%,-50%)` に変え、親の box-sizing に依存しない中心寄せにして解いた。企画の側の書き間違いも1つある。C2 の「重なりが枠の全面（24×24）に達する」は**幾何的に不可能**で、駒は 14×14（**196px²**）なので枠の 576px² には届きようがない。実装は「駒が枠に完全に内包される」を「達した」の実質的な意味として読み替えている。**受け入れ条件は、測れる形に書いた瞬間に、測れない主張を落とすことがある。** 行数の見積もりの罠も1つ出た。ラベルのフォントサイズから素朴に行の高さを積むと、ボタンの `line-height` 込みの実測が数 px 大きく、3行ぶんで外形が **246px** と予算を超えた（1〜2px ずつ削って **216px** に収めている）。1行なら無視できる誤差が、**行数に線形に効く**。外形は **320 × 216px**。',
    Component: TakenBySomeoneElse,
  },
  {
    id: 'unknown-outcome',
    no: 122,
    nameJa: '届いたかどうか分からない',
    nameEn: 'Unknown Outcome',
    category: 'フィードバック',
    trigger: '`週を提出する` を2回押す。1回目は受理され、2回目は返事が来ない。その後 `確かめる` を何回か押す（右上で「スピナーを回し続け、失敗と言い切って再送させる」対照に切り替え）',
    principles: ['分からないは着地しない線で言う', 'スピナーを1つも持たない', '再送ではなく確かめるに変える'],
    ecology:
      'この回の3つめは、**読み手自身の操作の結果が、画面にも分からない**場合である。隣接する2種はどちらも違う——No.71「保留の行列」は**いずれ返る**前提の待ちで、No.70「楽観のあと出し訂正」は返ってきて**失敗だった**（だから引き剥がす）。ここは**返らない**。成功でも失敗でもない3つめの結末で、UI は成功（結果が付く）と失敗（引き剥がす）の2つしか語彙を持っていない。第1の芯は、**往路の線が結果の欄に届かないまま止まる**ことである。成功は線が枠に**接し**（実測 gap **0.00px**）、分からないは枠の**手前 18px で止まって、そのまま残る**（実測 **18.000px**、`data-gap-px` と**差 0.000px**）。**「分からない」の全情報が、この届かなさに入っている。** 停止後 **25 サンプル**で線の `height` は **distinct 1 値・偏差 0.00000px**——止まったあとは動かない。届いた区間と届かなかった区間は**線種**で分ける（実線＝届いた／破線＝届いていない）。**濃さでは分けない**——薄さは No.74 / No.114 が確度に使っているので、薄さで「届いていない」を言うと語彙が衝突する。破線は結果の枠と同じ `1px dashed` なので、「まだ埋まっていない」を枠と同じ語彙が言うことになる。第2の芯は**スピナーを1つも持たない**ことである。回り続けるスピナーは「いま作業中」＝**まだ終わっていない**の語彙だが、ここは**もう終わっているが、どちらか分からない**。かといって止めると「終わった＝結果が出た」と読まれる。答えは**時間の経過を回転で表すのをやめて、片道の線で表す**こと——線は伸びて止まる。**止まったことが「終わった」を言い、届いていないことが「答えが無い」を言う。1つの担体で両方を同時に言える。** 実測で既定はルート配下の**全要素**の `animation-name` が **distinct `[\'none\']`**。第3の芯は**再送させない**ことで、押せなくする（disabled）のではなく**別の操作にする**——ラベルが `週を提出する` から **`確かめる`** に変わる。そして**確かめても線は1pxも伸びない**（3回連続で押して `height` の差分 **0.000px**、`data-gap-px` の差分 **0.000**）。**分からないは、繰り返しても減らない。** 実装は「確かめる」のハンドラを**完全に空**にして、これを構造で保証している——状態を一切書き換えないのが、「1px も伸びない」の最短経路だった。既定は結果を述べる文言を持たない（「再送」「失敗」「エラー」「不明」「分からない」が **0 件**）。対照（スピナーを回し続け、しばらくして赤い `送信に失敗しました` を出し `再送` ボタンを添える）の壊れ方は2つある。ひとつ、スピナーが回っているあいだ読み手は「まだ作業中」と読む＝**待てば分かると思う**。ふたつ、**失敗と言い切るが、それは嘘かもしれない**——実測で対照の `再送` を押すと結果の欄に **`受理 #2` と `受理 #3` の2件**が入る。**二重に提出されたことが画面に見える。** 既定は `確かめる` を3回押しても新しい受理は **0 件**である。跡は消えない——2回目の未着地の線は、確かめる・次へのあとも **1 個**残り、`opacity` は **distinct 1 値**（薄れない）。**企画（＝配線側）の構造の誤りが1つ、実物を見て見つかった。** 初版は提出を**縦に直列で積む**作りだった（点→線→点→線→枠）。すると2回目が積まれた瞬間、**1回目の線の行き先が「2回目の点」に変わり**、`受理 #1` が**2回目の破線の真下**に座る——読み手には「線が届かなかったのに受理が入っている」と見える。C2（1回目の線は枠に接する）は**測った瞬間には真だったが、絵として残っていなかった**。この標本の芯は「着地と非着地が同じ担体の同じ量で区別できる」ことなのに、**最終フレームに着地の実例が残っていない**。直しは構造の変更で、提出ごとに**自分の列**（自分の線と自分の枠）を持つ**くし型**にした。左の列は実線が枠に接して受理が入り、右の列は届かず枠が空——**2つが同時に並んで残る**。再測で1回目の gap は2回目を積んだ後も次へのあとも **0.000px** で、**恒久的に真であり続ける**ようになった。副産物として外形も縦積みの最大 208px から **320 × 160px** に縮んでいる。**受け入れ条件が「ある瞬間に真であること」しか測っていないと、真であり続けることを取り落とす。** 実装は計測の罠も2つ掘り当てた。ひとつ、**測る対象を挟む親の `flex` の `gap` が幾何をずらす**——ルートに `gap: 8px` があったせいで、gap 0.00px のはずが **8.000px**、18.00px のはずが **26.000px** と出ていた。内側に `gap: 0` の wrapper を挟んで解いた。図鑑の既存の教訓は「測る対象に `transition` を付けない」だったが、**親のレイアウトも測定対象の幾何に混ざる**という別種の罠がある。ふたつ、C3 / C7 の「結果の欄が **0 個**」は**企画の書き間違い**だった——台本は1回目で `受理 #1` を必ず入れ、しかも「跡は消えない」が原則なので、絶対数は **1 個**にしかならない。「そのアクション自身が新規に追加した要素数」というデルタとして読めば両方 **0** で一貫する。**原則（跡は消えない）と受け入れ条件（0 個）を別々に書くと、互いに矛盾していても書けてしまう。**',
    Component: UnknownOutcome,
  },
  {
    id: 'answer-arrives-late',
    no: 123,
    nameJa: 'あとから答えが来る',
    nameEn: 'Answer, Arriving Late',
    category: 'フィードバック',
    trigger: '週を提出する（1回目は答えが返らない）。`次へ ▶` で次の列へ進み、そのまま待つ（右上で「破線を実線に書き換える」対照に切り替え）',
    principles: ['起きたのは事実ではなく知ったこと', '分からなかった時間を消さない', '受理番号は判明した順'],
    ecology:
      'No.122 は「分からない」を**線が結果の欄に届かないまま止まること**で言い切ったが、**そのあとで答えが届いたときのことを決めていなかった**。この標本はそこを撃つ。芯は1行で言える——**起きたのは事実ではなく、知ったことである。** 受理はずっと前に、画面の外で起きていて、いま起きたのは画面がそれを知ったことだけ。ところがこの図鑑では**動きは常に「起きたこと」の語彙**なので、線を伸ばすと「いま受理された」と読める。だから既定は**線を1pxも動かさない**。列①の遅着の前後 20 フレームで実線の `height` 差分は **0.000px**、`data-gap-px` は終始 **18.00** のまま。対照（届いたら破線を実線に書き換えて伸ばす）は同じ窓で **19.750px**（22.0 → 41.75px）伸び、gap は **18.00 → 0.00** になる。第2の芯は**破線を残すこと**である。No.122 は破線に「答えが無い」を割り当てた。実線に書き換えると、破線は「一時的な状態」だったことになる——だが**あのときの破線は正しかった**。分からなかったのは事実であって、訂正すべき誤りではない。**訂正（No.71）ではなく解消**であり、消してよい記述ではない。既定は遅着の後も破線が **1 個**残る。対照は **0 個**——**分からなかった時間が画面から消える**ので、読み手がなぜ列②を出したのか（＝二重提出の理由）が説明できなくなる。第3の芯が**受理番号を判明した順で振る**ことで、これが「あとから分かった」を**新しい担体を1つも足さずに**言う手になっている。既定の並びは列①=`受理 #2` / 列②=`受理 #1` / 列③=`不受理 #3`——**左の列の番号のほうが大きい**。番号の乱れそのものが「遅れて分かった」と「そのあいだに次を出していた」を同時に語る。一度置かれたチップの文字列が後から変化した回数は **0 回**。対照は提出順に振り直すので、列②のチップが `受理 #1` → `受理 #2` へ**書き換わる**——**あとから来た答えが、先に知っていた事実の番号を書き換える**（訂正でないものに訂正の語彙を使っている）。第4に、**出現に緩急を付けない**。既定の全要素の computed `animation-name` は **`none`**、チップの `transition-duration` は **`0s`**。ここでこの図鑑は新しい原則を1つ得た——**担体に緩急を付けてよいのは、その担体が指している出来事が、いま、その場所で起きたときだけ**。受理は結果欄では起きていない。チップは**現れるが、動かない**。そして朗報と凶報で語彙を変えない。既定のチップ3つは `background-color` **rgb(255,255,255)** / `border-color` **rgb(61,61,61)** / `font-size` **9.5px** / 外形 **68×21px** がすべて **distinct 1 値**で、**遅れて来たことも、不受理であることも、チップの見た目では言わない**（No.118 の対称性の継承）。**違いは経路——破線が残っているかどうか——にしか出ない。** No.122 の「分からないは繰り返しても減らない」も生きていて、遅着の後に `確かめる` を3回押しても線の伸びは `[0.000, 0.000, 0.000]px`・チップ増加 **0 件**。**実装が、企画の書き間違いを2つ見つけた。** ひとつ、企画は「すべて定数と提出順で決まる」と書いたが、**番号の順は提出の間隔にも依存する**——①(4200ms) と ③(3000ms) は各自の提出時刻を起点にした独立タイマーなので、③を①の提出から 1200ms 以上あけて出さないと ③ が先に解決して番号順が入れ替わる。**決め打ちの台本は「乱数を使わない」だけでは決まらない。** ふたつ、企画は「列③は `次へ ▶` のあと提出」と書いたが、No.122 の `isBlocked` をそのまま継承すると列②は即着地するので `次へ` が描画されず、**この手順は実装不可能だった**。目視も2件拾っている。対照のトーストが `position: absolute` で列②のチップに重なって `受理 #2` を隠していた（数値条件は全部通っていた。過去3回起きた「担体が別の担体に隠れて読めない」の再発になりかけた）ので、専用の行として高さ 26px を確保する形に直した——外形は対照だけ **160 → 194px** に増えている。もう1つは C4 を字面通り読んで見つけたもので、チップの外形が文字数の違いで **52.91px** と **62.41px** に割れていた（`width: 68px` 固定で解決）。対照の壊れ方は**作り込まずに出た**——番号を保存せず解決済みの集合を提出順にソートして毎レンダー計算し直す、という**素直な実装をそのまま書いただけ**で、既存チップの書き換えが自然に起きる。',
    Component: AnswerArrivesLate,
  },
  {
    id: 'cause-unknown',
    no: 124,
    nameJa: 'どれが効いたのか分からない',
    nameEn: 'Cause Unknown',
    category: 'アナリティクス',
    trigger: '3つの施策を同時に打って `次の週へ`。1つずつ止めながら週を進める（右上で「主要因を名指しする」対照に切り替え）',
    principles: ['候補は個数で言い、寄与では言わない', '絞り込みは原因の側だけで起きる', '確定していないあいだ実線は幹だけ'],
    ecology:
      '1週に施策 A・B・C を**同時に**打ち、翌週に効果（**+18**）が出た。**どれが効いたのかは、画面には分からない。** 素直な実装は3通りとも嘘をつく——線を3本引けば「3つとも効いた」、1本も引かなければ「何も効いていない」、1本だけ選べば**推測を事実の語彙で描く**。太さを 1/3 ずつにするのも逃げにならない（**それぞれ 1/3 効いた**という別の嘘になる。**分からないのは配分であって、合計ではない**）。既定の答えは**候補を「本数」ではなく「個数」で言う**こと。縦のレールを1本立て、そこから結果へ**実線の幹を1本だけ**引き（＝効果は1つぶん。量の嘘が構造的に出ない）、レールと各原因のあいだには**候補である原因にだけ破線の枝**を出す。破線は No.122 の語彙で「確かでない」。実測で `data-candidates` と枝の個数は週1〜週3で **3 / 2 / 1** と完全一致し、幹は常に **1 本**・`width` は3週とも **50px**（distinct 1 値）。枝どうしは `border-top-width` **2px** / `border-style` **dashed** / `border-color` **rgb(140,140,140)** / `opacity` **1** / 長さ **34px** がすべて **distinct 1 値**——**枝は候補であることしか言わず、寄与の大小は1つも語らない**。第2の芯は**絞り込みが原因の側だけで起きる**ことで、結果側の先端 `trunk-head` は `left/top/width/height` が **393/188.5/6/6** のまま3週とも動かない。候補が 2→1 に落ちるクリックの直後から rAF で 20 フレーム連続サンプリングしても最大差分 **0.0000px**。**分かったのは原因についてのことで、結果は何も変わっていない。** 第3の芯が締めで、**候補が1つに絞れた瞬間、その枝だけが `dashed` → `solid` に変わる**（週1・2は全枝 dashed、週3で唯一の枝が `2px/solid/rgb(61,61,61)`）。このとき絵は **No.65「因果のリレー」と同じ1本の実線**になる——**No.65 は、この標本の特殊解（候補が1つに絞れた場合）である。** 既定はどの原因も名指ししない。カード3枚は `background-color` **rgb(255,255,255)** / `border-color` **rgb(61,61,61)** / `font-size` **16px** が全週で同一で、`[data-role="badge"]` は **DOM に一度も存在しない**。対照（候補の先頭を `主要因` と名指しして線を引く）は badge が常に **1 個**、カードの背景が **rgb(251,241,222)** と **rgb(255,255,255)** の **2 値に割れ**、名指しの元にした A が候補から外れると**線の根元が B へ乗り換わる**——`left` が **252.37px → 347px**、クリック 50ms 後のサンプルは **304.83px** と中間値を取り、`transition-duration` は **0.34s**。**起きていない出来事（因果の乗り換え）のアニメーションが実際に走る。** 既定の幹の `left` は **338 → 338 → 338**（差分 0.000px）。**実装が、企画が書いていなかったことを3つ決めた。** ひとつ、対照だけ**横並びレイアウト**にした——C7 が「根元の **x** が変化する」を要求しているが、既定と同じ縦並びだと名指し対象の変化は y にしか出ない。**受け入れ条件の書き方が、対照の幾何を決めてしまった**（企画が意図していなかった帰結）。ふたつ、候補が1になった時点でトグルと `次の週へ` を無効にして最終フレームを凍結した。みっつ、枝を**水平にレールへ伸ばす**形にしたことで「枝の長さが distinct 1 値」が構造的に自明になった（斜めに個別に結ぶ案は行ごとに距離が変わり「配分を言わない」と衝突する）。**実装は企画の前提の裏取りも1つ返してきた**——この絞り込み規則の下では**真の原因 B は決して排除されない**（B が動いている週は必ず効果が出るので「止めていた側」に入らず、B が止まっている週は必ず効果が出ないので「動かしていた側」に入らない）。**候補集合が空にならないことが、規則の性質として証明できる。** 目視も1件拾った。初版はレールを「3行の全高を常に覆う常設の構造材」として固定していたので、週3（候補1）で**使われていない上下の縦線が残って「Tの字」に見え**、「絞れたら No.65 と同じ絵になる」という主張と矛盾していた（数値条件は全部通っていた）。レールの高さを「現在の候補の行 ∪ 幹の起点」の範囲だけに縮め、候補が1つになると高さがちょうど 0 になって**折れ目のない1本の実線**になるよう直している。最後に、この標本を作って初めて見えたことがある——**因果が確定する瞬間は、効果が起きていない週である。** 原因を止めて効果が消えることでしか特定できないので、**No.65 と同じ絵が完成するフレームで、結果の欄は「効果（今週） 0」を出している。** 確定した因果の線と、今週の測定値は、別のことを言っている。',
    Component: CauseUnknown,
  },
  {
    id: 'reader-fills-in',
    no: 125,
    nameJa: '読み手が答えを埋める',
    nameEn: 'Filled In by the Reader',
    category: '入力',
    trigger: '分類できなかった行に `広告費です` / `違います` と答える。`外す` で剥がす。答えないまま `次の週へ` も押せる（右上で「モーダルで聞いて確定させる」対照に切り替え）',
    principles: ['減るのは値ではなく幅', '申告と測定を濃さで分けない', '分からないままにする権利を奪わない'],
    ecology:
      'No.120〜122 が「画面が答えを持っていない」を3通りに撃ったので、残っていたのは**最後の手——読み手に聞く**である。舞台は「広告費の今週の合計」。3行の支出のうち2行はカテゴリが確定（**測った**）、1行は**画面が分類できなかった行**（金額は分かるがカテゴリが不明）。合計は No.114 の語彙を継承して**塗り（確定分 ¥18,000＝180px）＋ 破線の輪郭（ありうる範囲 90px）**で描かれる。芯は1行で言える——**読み手が答えることで減るのは、値ではなく幅である。** `これは広告費です` でも `違います` でも、**塗りは1pxも動かない**（全操作を通して `width` 差分 **0.000px**）。動くのは輪郭のほうで、**90.00px → 4.00px**（`data-band-px` との差 **0.00px**）へ縮み、`広告費です` なら右端に、`違います` なら左端に張り付く。**読み手の申告は測定ではないので、測った合計には入らない。** 対照（モーダルで聞いて確定させる）は答えた瞬間に塗りが **180 → 270px** と **+90px** 伸び、数字が `分類待ち ¥18,000` → `確定 ¥27,000` へカウントアップする——**何も測っていないのに、新しい事実が入ったと言っている。** 既定では合計の数字の文字列が全操作を通してユニーク数 **1**（＝1度も変化しない）で、全要素の computed `animation-name` は **`none`**。第2の芯は**申告と測定を線種でだけ分ける**こと。申告した行の箱は `border-style: dashed`、測った2行は `solid`、一方で `background-color` **rgb(255,255,255)** / `font-size` **11px** / 高さ **32px** は3行とも同一——**濃さで格を付けない。** 対照は3行とも `solid` で、**翌週この画面を見た人には、どれが測った値でどれが読み手の申告かが区別できない。** 第3の芯は**不確かさが下流へ伝播する**ことで、合計の担体（`sum-track`）自身の縁が**答えても破線のまま**（初期・yes・no・週送り後のいずれでも `borderTopStyle` は dashed）。**申告が1つでも混じっている合計は、測った合計ではない。** これは実装が構造で解いた——「行3が測定によって解決される経路が構造上あり得ない」ことの帰結として、**分岐なしで常に dashed** になる（対照側は「確定した」と言い切る実装なので実線にしてある）。第4に**剥がせる**。`外す` で輪郭は **90 → 4 → 90px** と往復し、差は **0.00px**。対照に `外す` は **0 個**——**読み手の間違いがそのまま固まる。** **剥がせることが、申告と測定の違いそのものである。** 第5に**分からないままにする権利を奪わない**。既定は `次の週へ` が最初から `disabled` ではなく、`role="dialog"` は **0 個**。答えないまま週を送っても輪郭は **90.00px** を保ったまま持ち越される。対照は答えるまで `disabled` で `dialog` が **1 個**出て読み手を止める（No.116 の「引き返す余地は作るが、時間は要求しない」の入力版）。良し悪しで語彙を変えないのも守られていて、`広告費です` と `違います` の輪郭は `border-color` **rgb(61,61,61)** / `border-style` **dashed** / `opacity` **1** / `width` **4px** が完全一致し、**違うのは `left`（377px と 291px）だけ**（No.118 の対称性の継承）。ここで**この標本は、読み手が答えても画面の数字が1文字も変わらないという、かなり強い絵になる**——`確定 ¥18,000 ・ ありうる上限 ¥27,000` は申告の前後で同一である。それが正しい。申告は上限を動かさないし、確定も動かさない。**動いたのは「どこがありえて、どこがありえないか」だけで、それは幅の話である。** 実装の判断も2つ効いている。ひとつ、`外す` で申告内容の履歴を持たせなかった（持たせると別の標本の主題に踏み込む）。ふたつ、対照の壊れ方を「答えの中身に関係なく確定として扱う」で**両方の答えに一貫させた**——`違います` でもバッジが付く。目視も1件拾っていて、対照の `確定` バッジを `position: absolute` で行に重ねた初版は**金額「¥9,000」の末尾を隠していた**（数値条件は通っていた）。兄弟の flex コンテナに金額とバッジを並べて解決している。',
    Component: ReaderFillsIn,
  },
  {
    id: 'cause-off-screen',
    no: 126,
    nameJa: '原因が画面に無い',
    nameEn: 'Cause Off Screen',
    category: 'アナリティクス',
    trigger: '3つの施策を1つずつ止めながら週を進める。3つとも止めても効果が残る（右上で「`その他` を候補に足して線を引く」対照に切り替え）',
    principles: ['候補の集合は閉じていない', '画面に無いものに名前を付けない', '閉じているのは台であって、効果ではない'],
    ecology:
      'No.124 は「1つ以上が効いたが、どれかは言えない」を候補の**個数**で言い、絞り込みが進めば最後に1本の実線（No.65 の絵）になると決めた。その実装が証明として返してきたのは、**あの絞り込み規則の下では真の原因は決して排除されず、候補集合は必ず1個以上に収束する**ということだった。ところがそれは**規則の性質であって、世界の性質ではない**。**候補の集合が閉じていると仮定していること自体が、いちばん大きな嘘**である。この標本の台本は1行で言える——**3つ全部止めても、効果が消えない**（4週とも `+12`。効果の文字列は**4週で完全に同一**）。第1の芯は、**画面が最初から言い切っていたことを可視化する**ことにある。候補が載る台（レール）を明示的に描き、台は**最初から舞台の右端まで**伸びている（`left`/`width` が4週で最大差分 **0.000px**、台の右端 **596** は舞台の右端と差 **0.00px**）。その台の、**候補の右端に締め線が1本**立っている——No.116 が「履歴の列が締め切られた」に使ったのと同じ形で、意味も同じ「**この台にはもうこれ以上載らない**」。つまり**画面は最初から「候補はこれで全部だ」と言い切っていた**のであり、読み手はそれに気づいていない。**4週目、候補が0になった瞬間に、この締め線が外れる**（個数 **1 → 0**、`data-open` **0→0→0→1**）。**動くものは何も無い。要素が1つ消えるだけである。** 遷移をまたぐ **20 フレーム**で台・幹・結果欄・カード3枚の矩形は**全フレーム完全一致**（最大差分 **0.000px**）、動いた要素 **0 個**、消えた要素は締め線 **1 個**だけ。**読み手が反証したのは効果の帰属ではなく、画面の言い切りのほうである。** 第2の芯は、**枝0本を「何も効いていない」と読ませない**ことにある。効果は起きているので実線の幹は残り、しかも No.124 の既定では幹の根元がもともと候補のどれにも繋がっていなかったので（124 の実測 338/338/338）、候補が0になっても幹は何も変わらない——**4週を通して幹の矩形は `{left:492, top:192, width:34}` で完全一致**（最大差分 **0.0000px**）、`data-trunk` は **4週とも 1**。**枝0本＋幹1本が「原因が画面に無い」、枝0本＋幹0本が「何も効いていない」**で、枝の個数だけでは足りず、**幹の有無と締め線の有無の3つで読む**。枝そのものは 124 の語彙のまま `data-candidates` と一致して **3 / 2 / 1 / 0**、枝どうしの `border-left-width` **2px** / `dashed` / `rgb(140,140,140)` / `opacity` **1** / 長さ **26px** は **distinct 1 値**である。第3の芯は、**画面に無いものに名前を付けない**こと。既定に `その他` も `不明` も `該当なし` も **0 個**、名指し・バッジ・警告文言も **0 個**、`dialog` **0 個**、既定の全要素の computed `animation-name` は **`none`**、台と締め線の `transition-duration` は **`0s`**。**「あなたはまだ全部を疑っていない」を、画面は先回りして言わない**——締め線が外れるのは、**読み手が実際に3つとも止めたときだけ**である。ここで撃ち分けが1つ要る。締め線が消えることは No.116 の語彙では「戻せるようになった」に読めてしまうので、**履歴の点で切る**——`次の週へ`（＝締め線が外れる操作）の前後で履歴は **±0**（3→3）であり、増えるのは**原因のトグルを押したとき**だけ（2→3）。**実装はこれを分岐ではなくトリガーの分離で解いた**（履歴を週送りに紐づけると、締め線が外れるその1クリックが履歴も動かしてしまう）。対照（候補が0になったら `その他` というカードを足して実線を引く）は、実務でいちばんよく書かれる実装であり、いちばん大きな嘘である——**画面に無いものに名前を付けて、候補の中に混ぜてしまう。** カードは **3 → 4** 個に増え、`その他` への線は `border-top-style` **`solid`** で **1 本**、幹の根元は `transition-duration` **0.34s** で乗り換え、遷移中の10サンプル（`343.256 → 427.631 → … → 413.995`）は始点とも終点とも一致しない中間値を含む（イージングのオーバーシュートで終点を一度越えて戻る）——**起きていない出来事（因果の乗り換え）のアニメーションが実際に走る。** そして対照の `その他` には `止める` が付き、**押せてしまう**。押すと因果の線は **0 本**になるのに効果は **`+12`** のまま——**名前を付けたせいで、意味のない操作が読み手に提供される。** **実装が、企画の縛りと継承元の語彙が衝突していることを1つ掘り当てた。** No.124 は `.is-solid` の跳ねと結果値の登場に `animation` を持っていたが、この回の縛りは既定の全要素に `animation-name: none` を要求する。**継承する語彙には、継承先の縛りが禁じている演出が付いてくる**——実装は既定側の演出を削り、緩急を対照側（0.34s の乗り換え）にだけ残した。企画が決めていなかったことも実装が2つ決めている。ひとつ、**「候補の右端」が具体的にどの x なのか**（最後のカードの中心 +14px にした）。ふたつ、**幹の根元をどこに置くか**——実装は根元を締め線と**同じ x に重ねる**判断をした。これが効いていて、締め線が外れた週の絵は、**効果の実線が、候補の並びの向こう側からそのまま伸びてくる**一枚になる。**「原因は画面の外にある」が、線の出どころとして絵に写る。** 外形は既定 **300×249px** / 対照 **300×295px**。',
    Component: CauseOffScreen,
  },
  {
    id: 'mostly-declared',
    no: 127,
    nameJa: 'ほとんどが申告になる',
    nameEn: 'Mostly Declared',
    category: 'アナリティクス',
    trigger: '`次の週へ` で週を進めると、測れていた行が申告に置き換わっていく。`測り直す` で1行だけ戻す（右上で「`推定` バッジ＋半数超で警告」対照に切り替え）',
    principles: ['数字は動かず、成分だけが変わる', '二値の線種でも、長さを持てば量を運べる', '多いかどうかは画面が判定しない'],
    ecology:
      'No.125 は「申告は破線、測定は実線」「不確かさは合計の縁へ伝播する」と決めた。それは**1行ずつなら正しく効く**。問題は積もったときで、**破線が10行あっても、縁が破線であることは1行のときと変わらない**——**伝播はしているが、量を運んでいない**。しかも手段が3つとも塞がっている。**幅は使えない**（No.74/114/118/125 が確からしさを幅に割り当てたが、申告は範囲を**狭める**操作なので、**量が増えると指標が減る**）。**線種も空いていない**（実線／破線は測定／申告と、届いた／届かないに埋まっている）。**閾値も置けない**（方針の閾値は No.106 が持たない）。だからこの標本は舞台のほうを作り替えた——**行は増えない。12行のまま、金額も合計も変わらない。** 変わるのは「**そのうち何行が測定で、何行が申告か**」だけである（週が進むほど、測れていた行が測れなくなって申告に置き換わる）。**芯は1行で言える。同じ数字が、だんだん別のもので出来ていく。** 合計の文字列は4週とも **`¥120,000`（distinct 1 値）**、塗りとトラックの `width`/`left` は4週で最大差分 **0.0000px**。第2の芯が答えそのもので、**合計の台（トラック）の下辺を、12行ぶんの区間に分ける**。各区間の長さはその行の金額に比例し、線種はその行が測定なら `solid`、申告なら `dashed`——**125 の二値の線種のまま、長さで量を運ぶ。3つめの線種は要らなかった。** `data-declared-px` は **0 → 100.00 → 217.50 → 288.75px** と伸び、各週とも実測（破線区間の `width` の合計）との差は **0.0000px**。区間どうしは `border-bottom-width` **3px** / `color` **rgb(61,61,61)** / `opacity` **1** がすべて **distinct 1 値**で、**違うのは `border-bottom-style` と長さだけ**である。ここで**個数と量が割れる**のがこの標本のいちばん強い絵になる。金額の大きい行から先に申告へ変わるので、**週2は個数では 3/12（25%）なのに、下辺ではもう 100/300px（33%）が破線**、**週4は個数 10/12（83%）に対して下辺は 288.75/300px（96%）**——**「何行が申告か」と「どれだけが申告か」は、同じ画面の別の量である。** 第3の芯は**画面が多いかどうかを判定しない**ことで、全週で `background-color`/`color` は **distinct 1 値**、`推定`/`信頼度`/`警告` に相当する要素 **0 個**、`dialog` **0 個**、幅（band）に相当する要素も **0 個**（**この標本は幅の担体を1つも持たない**——上記の理由で、幅は申告の量を語れないため）。全要素の computed `animation-name` は **`none`**、トラックと区間の `transition-duration` は **`0s`**。第4に、**台の長さが本当に成分の関数であることは、逆向きの操作でしか担保できない**。`測り直す` で1行（`広告出稿` ¥14,000）を測定に戻すと `data-declared-px` は **288.75 → 253.75 → 288.75** と往復し、期待差分 **35.00px** と実測差分の差は **0.0000px**（往復差 **0.0000px**）。これが無いと、破線が伸びていく絵を別々に描いただけでも C1〜C5 は通ってしまう。対照（行ごとに `推定` バッジを付け、申告が半数を超えたら合計を赤くして `信頼度: 低` と出す）の壊れ方は3つある。**閾値を持つ**（バッジは **0 / 3 / 7 / 10 個**、塗りの色が週1〜2 の `rgb(61,61,61)` から週3〜4 の `rgb(163,51,39)` へ **2 値**に割れ、`信頼度: 低` が **1 個**出る）。**バッジは個数を出すが、量を出さない**（**1行の巨大な申告と、10行の小さな申告が同じ絵になる**）。そして決定的に、**対照の台の下辺は全週で `border-bottom-style: solid` の distinct 1 値**——**装飾は増えているのに、成分についての情報はゼロ**である。実装はこれを分岐で均一化するのではなく、**区間分割の DOM そのものを作らない**設計で満たした（No.125 の「実線になる経路がそもそも無い」の踏襲）。**企画の側の穴も出た。** 企画は No.125 の語彙（塗り＋輪郭）を継承する体で書き始めたが、**この標本の合計は常に 100% 既知（¥120,000 に不確かさが無い）なので、輪郭に相当する第2の要素が存在しない**。「幅を持たない」とは書いたが、**その帰結（125 からの継承要素が実質1つ減り、塗りとトラックを分ける理由が自明でなくなること）を書いていなかった**。ほかに、`測り直す` をどの行に出すか（実装は「一度でも申告に到達した行だけ」にした）と、対照の閾値の境界（「半数を超えたら」が `>6` か `>=6` か。実装は `>6`）も企画が決めていない。外形は既定 **340×297px** / 対照 **340×298px** で、**12行はスクロールせず全部同時に見えている**（全体が見えていることが、この標本の主張の一部である）。',
    Component: MostlyDeclared,
  },
  {
    id: 'definition-changed',
    no: 128,
    nameJa: '定義が途中で変わった',
    nameEn: 'Definition Changed',
    category: 'アナリティクス',
    trigger: '週の点を2つ選んで比べる。同じ区間なら差が出る。継ぎ目を跨ぐと何も出ない（右上で「1本の線＋貫通する目盛り＋変化率バッジ」対照に切り替え）',
    principles: ['比較の約束は、目盛りが横断することに入っている', '時間の定規は貫通し、数え方の定規は貫通しない', '線は正しい。間違っているのは定規のほう'],
    ecology:
      '12週の週次「アクティブ人数」の折れ線で、**第7週から数え方が変わっている**（`7日以内に開いた人` → `30日以内に開いた人`。値は `118,132,121,140,128,145 / 284,305,292,318,300,330` の決め打ちで、週6→週7 は **+95.9%**）。素直な実装は1本の連続した線を引き、読み手は第7週で「跳ねた」と読む。**跳ねていない。別のものを数え始めただけである。** 手段はほとんど塞がっている——色は対照の語彙、線種は測定／申告（No.125）と届いた／届かない（No.122）に埋まっており、線を切って離すと「データが無い」（No.122）に読まれ、注釈バッジと変化率の名指しは No.124 の対照の語彙である。そして決定的に、**線の側では何も起きていない**。定義が変わったのは第7週であって、いま起きたことではないので、No.123 の原則（担体に緩急を付けてよいのは、その担体が指している出来事が、いま、その場所で起きたときだけ）により**線には一切触れられない**。この標本の答えは、**比較可能性の約束は、目盛り線ではなく、目盛り線がグラフを横断することに入っていた**、という読みから出る。普通のグラフの水平な目盛りが全幅を貫通していることが「**同じ高さは、どこでも同じ量を意味する**」という約束になっている。**数え方が変わったなら、撤回すべきはその約束のほうである。** 既定では**水平の目盛り線が継ぎ目を1本も横断しない**（横断する線 **0 本**。左区間の線の右端 x と右区間の線の左端 x が `data-seam-x` **152.00** と**すべて差 0.00px** で一致）。対照は同じ絵で**貫通する水平線が 4 本**（150 / 200 / 250 / 300）ある。継ぎ目そのものは No.116・No.126 と同じ締め線（**1 個**、`stroke-width` **2px** / `stroke` **rgb(61,61,61)**）で、対照には **0 個**。第2の芯は、**継ぎ目が時間の断絶ではない**ことである。週1〜12 は連続しているので、**x 軸（No.119 の時間の定規）は1本のまま全幅を貫通し**、週ラベルは **12 個**の連番、継ぎ目の左右で週の間隔は **20.3636…px の distinct 1 値**（詰まってもいないし空いてもいない）。**貫通する定規（時間）と貫通しない定規（数え方）を同じ舞台に並べることで、「時間は続いている／数え方は続いていない」が撃ち分けられる**——これが無いと、読み手は「6週目と7週目のあいだにデータが欠けている」と読む。第3が**この標本のいちばん強い証拠**で、**既定と対照で折れ線の12個の頂点座標が完全に一致する**（最大差分 **0.0000px**。`d` 属性の文字列そのものが両モードで同一）。**線は何も間違っていない。間違っているのは定規のほうである。差は全部、台に出る。** 触り方は「2つの週を選んで比べる」で、**同じ区間の2点**（週2・週5）なら帯が **1 個**出て `data-delta` **-4** が実測差（128−132）と一致し、**継ぎ目を跨ぐ2点**（週6・週7）では帯が **0 個**になる。そして**代わりに何も出さない**——追加で現れる要素 **0 個**、エラー文言も `比較できません` も無く、選択そのものは `data-selected="6,7"` のまま残る（No.110「位置が分からないなら位置を名乗らない」の直系。**出せないものは、出せないと名乗ることもしない**）。対照は跨いでも帯を出し、**存在しない差を `+96%` と言い切る**。既定は色を足さず（線・目盛り・継ぎ目・点の色は **rgb(61,61,61)** と **rgb(214,214,211)** の **distinct 2 値**）、変化率バッジ **0 個**、`dialog` **0 個**、全要素の `animation-name` は **`none`**、線・目盛り・継ぎ目の `transition-duration` は **`0s`**（初回描画のひと筆書き（No.39）も**借りていない**——描画の緩急は「いま描かれた」を意味してしまう）。対照だけが線の draw-in とバッジの pop を持つ。**実装が、企画の書いていなかったことを2つ決めて、どちらも効いた。** ひとつ、**既定の帯は生の差分（`-4`）、対照の帯は百分率（`+96%`）**にした——**`%` という書式そのものが「同じ母数で割った」という主張を持ち込む**ので、既定はそれを避けた。企画は帯の中身の書式を指定していなかったが、この標本の芯からすれば書式は芯そのものだった。ふたつ、**左右の y 軸ラベルを別々の数字にした**（左 **120/135/150**、右 **280/305/330**）——目盛りが継ぎ目で止まっているだけでは「線が途切れている」と誤読される恐れがあり、**同じ高さに違う数字が載って初めて「ここから数え方が違う」が一目で立つ**。加えて実装は継ぎ目の左右に `7日以内` / `30日以内` の区分名を置いた。企画は「文言 0 個」と書いていたが、**これは値の変化についての名指しではなく、定規が自分の単位を名乗っている**——この回の主題（台のほうが画面について語る）からすれば、**台が自分の名前を名乗るのは名指しではない**。目視も1件拾っている。対照の変化率バッジで、位置決めの SVG 属性 `transform` と入場アニメの CSS `transform` が同じ `<g>` に載っていたため、**CSS の計算値が SVG 属性を上書きし、アニメ終了後にバッジがカード左上 (0,0) へワープしていた**。座標・個数の数値条件はどちらの版でも通っていて、**絵としてだけ破綻していた**（過去4回と同じ形の再演）。位置決め用の外側 `<g>` とアニメーション用の内側 `<g>` に分けて解いている。外形は **320×242px**（既定・対照とも同一）。',
    Component: DefinitionChanged,
  },
  {
    id: 'past-restated',
    no: 129,
    nameJa: '過去のほうが変わった',
    nameEn: 'Past Restated',
    category: 'アナリティクス',
    trigger: '`ひらく` で遡及済みの画面を静止したまま開く。`前に見たときの形` で旧の形を読み、`確かめた` で跡を消す。`初めての読み手` に切り替えて `ひらく` すると跡が出ない（右上で「書き換えを再生し、旧線を薄く重ねる」対照に切り替え）',
    principles: ['遡及は動きで描かない', '跡は世界にではなく読み手の側に置く', '旧の形は再演の枠の中でだけ見せる'],
    ecology:
      'No.128は「第7週から数え方が変わった」を、目盛りが継ぎ目を横断しないことで言い、線には1pxも触らなかった。ところがその答えは、過去のデータがそのまま残っていることに全面的に寄りかかっている。実務では逆のほうが多い——新しい定義で過去まで計算し直す(遡及適用)。すると継ぎ目は消える。全区間が同じ数え方になるので、128の答えが使えなくなる。舞台は128と同じ系譜の12週の折れ線で、**旧**(週1〜6が7日以内、週7〜12が30日以内で数えた、128そのものの状態: `118,132,121,140,128,145 / 284,305,292,318,300,330`)から**新**(全12週を30日以内で計算し直した値。週7〜12は元々新定義だったので影響を受けず、週1〜6だけが `224,250,230,265,243,271` へ動く)へ書き換わる。第1の芯(難所「事実の担体が動いてしまう」「動かすと再演と同じ絵になる」への答え)は、**遡及を動きで描かない**ことである。`ひらく`(時間が経って再訪する、を模した操作)を押すと、既定の折れ線は1フレームも中間値を取らずに新しい形へ差し替わる。20フレームを実測すると中間値は**0件**(`transition-duration` は `0s`、`animation-name` は `none`)。対照は同じ窓で**17/20フレーム**が少なくとも1頂点で中間値を含み、値が変わる6頂点×20フレームの120サンプル中**96サンプル**が中間値(全12頂点×20フレームの240サンプルで数えると**102サンプル**)——読み手は「そのとき本当にそう動いた」と読む(No.113が禁じた読み違い)。**動く過程が1フレームも無いので、「担体が動いてしまう」も「再演と同じ絵になる」も構造的に消える。** 第2の芯(この標本のいちばんの主張)は、**跡は世界にではなく読み手の側にしか置けない**ことである。遡及で世界では何も起きていない——変わったのは過去についての画面の言い分であって、跡を置く相手が世界に居ない。だから跡(変わった週に立つリング)は、画面が持つ「読み手が前回もここを見たか」という識別にだけ従う。既定で`ひらく`すると跡は**6個**(週1〜6、値が変わった週と完全に一致)立ち、`初めての読み手`に切り替えて`ひらく`し直すと**0個**——読み手が「前に見た」を持っていない場合、跡は最初から出ない。対照は同じ切り替えをしても跡は**6→6**のまま変わらない——跡が読み手の識別と無関係に出る、という壊れ方がそのまま数字に出る。跡は時間でも消えない。4秒待っても**6→6**のまま、`確かめた`を押した瞬間だけ**6→0**になる——No.89「既読は時間ではなく行為で決まる」の直系。第3の芯は、**旧の形を台の上に常設しない**ことである。`前に見たときの形`を開くと、いまのチャートの上に破線の枠(replay-not-nowの語彙: 「これは事実の描画ではない」)が重なり、中に旧の折れ線(週1〜6が旧値、継ぎ目つき)が現れる。枠の中の線は本チャートの線と**完全に同じクラス**で描いていて、実測で `stroke`(`rgb(61,61,61)`)・`stroke-width`(`2.2px`)・`stroke-dasharray`(`none`)・`opacity`(`1`)が**すべて一致**する——違うのは枠のラベル「前に見たときの画面」だけ。跡が出ている状態(枠を閉じているとき)で線の要素は**1本**、対照は旧線を薄く常設で重ねるので**2本**——旧の形は再演の枠の中でだけ存在し、閉じれば跡形もなく消える。第4の芯は、**遡及が128の継ぎ目を解消する操作である**ことである。遡及前は128と同じ目盛り配置(継ぎ目で止まる二群、締め線1個、横断0本)、`ひらく`の後は目盛りが全幅を貫通する一群に変わり(横断**4本**)、締め線は**1→0個**外れる。一方でx軸(時間の定規)は遡及の前後で1pxも変わらない——週ラベルは**12個**のまま、週の間隔は**20.3636…pxのdistinct 1値**のまま、全幅を貫通したまま(遡及前後で全12点のx座標が完全一致)。**遡及で失われたのは比較可能性ではない。読み手の記憶のほうである。** 既定は新しい色も新しい不透明度も持ち込まない——線・目盛り・継ぎ目・跡の `stroke` は `rgb(61,61,61)` と `rgb(214,214,211)` の**distinct 2値**、点の `fill` は `rgb(61,61,61)` の**distinct 1値**のまま、全要素の `animation-name` は**`none`**(枠を含む。既定側に `@keyframes` は1つも書いていない)。対照(書き換えを再生し、旧線を薄く重ねる)は新しい色相を持ち込まない判断をした——薄さの誤用(旧線に**不透明度0.32**を与え、No.74の確度の語彙を奪う)と、再生と、跡の無関係さの3つだけを撃つ設計にした。**実装が掘り当てた罠が1つある。** 対照の「書き換えを再生する」は、最初CSSの `transition: cx .7s, x1 .7s, ...` だけで作った。ところが実測すると中間値が**0件**だった——ChromiumはSVGのジオメトリプロパティ(`cx`/`cy`/`x1`等)をCSS transitionの対象にできるが、それは値の変更が**CSSOM経由**(`element.style.cx = ...`)のときだけで、Reactが書く `cx={p.x}` は素のDOM属性(`setAttribute`相当)にしかならない。属性としての変更はtransitionの監視対象にならず、値は1フレームで瞬間的に切り替わる——空の `<circle>` に `setAttribute` だけで同じ実験をしても再現した。だから対照の再生はNo.89の `runReplay` と同型の `requestAnimationFrame` によるJS側の補間で作っている。**位置を表す担体をCSSで動かしたいなら、値をCSSプロパティとして渡さない限りtransitionは効かない**——この図鑑がまだ書いていなかった注意点である。企画が決めていなかったことも2つ実装が決めている。ひとつ、遡及後の週1〜6の値(`224,250,230,265,243,271`)——旧値に128の週6→週7の実測比率(+95.9%)に近い倍率をかけつつ、週6の遡及後値(271)が週7の値(284)へ自然に連続するよう決め打ちにした(継ぎ目が本当に消えて見えるかどうかは、この連続性に懸かっている)。ふたつ、`前に見たときの形` ボタンを開閉両方の入口にし、枠自身には閉じるボタンを持たせなかった——最初は枠にも独立の「閉じる」ボタンを付けたが、Playwrightの厳格モードが「`閉じる`という名前のボタンが2つある」を即座に検出した。同じ操作に2つの入口を持たせると、行為の主体が枠なのか外側のトグルなのか読み手にも曖昧になる——数値条件が拾う前に道具立てそのものが拾ってくれた、珍しいケースである。目視は、この回で名指しされている3つの罠(担体が地色に溶ける/担体が別の担体の上に乗って読めない/SVG属性のtransformをCSSのtransformが上書きする)のどれも再現しなかった。3つめは構造的に起こりえない——この標本は位置を表す担体(点・線分)に一度もCSSの `transform` を使っていない(補間はすべてx1/y1/x2/y2/cx/cyという素の属性で完結させた)。対照の旧線(不透明度0.32)は白地の上でも十分に濃く、地色に溶けなかった。跡のリング(半径5.5px)は点(半径3.2px)より一回り大きいだけなので、リングが点を隠すことも無かった。強いて言えば、対照で書き換えの再生中は跡のリングを**着地するまで出さない**設計にしたのは、視覚確認で「補間中の点から跡のリングだけが浮いて見える」絵を避けるための判断であって、受け入れ条件には無い。**目視は今回も1件拾った(数値条件が拾えたものは0件)。** `前に見たときの形` を開いた最初の版は、ラベルをHTMLの`<div>`にしてsvgの上にflexで積んでいた——ラベルの行の高さぶん中身全体が押し下げられ、枠の外枠(`inset:0`で本体チャートと同じ184px高に固定)からx軸の目盛りと週ラベル(1〜12)がはみ出していた。C1〜C8はどれも「要素の有無」「stroke/strokeWidth/strokeDasharray/opacityの一致」「個数」しか見ておらず、**枠の矩形が中身の矩形を包んでいるかは誰も測っていなかった**——数値条件をすべて通したまま、絵としてだけ破綻していた(この図鑑で6回連続、同じ形の見落とし)。直しは、ラベルをHTMLではなく同じsvg内の`<text>`にし、svg自体の高さをラベルぶん(18px)だけ増やして、チャート本体は`<g transform="translate(0, 18)">`でそのまま下にずらすだけにした——本体の座標(目盛り・軸・線・点のx/y)は1つも変えていないので、C5(線の描き方の一致)にも影響しない。枠のDOM上のwidth/heightはこの拡張後のsvgのサイズと完全に同じ値をindex.tsx側で渡しており、枠が中身より小さくなる余地が構造上無い(`overflow:hidden`は最後の安全網)。直した後に「枠の矩形が内側の全要素(目盛り・y軸ラベル・区分ラベル・継ぎ目・軸・週目盛り・週ラベル・線・点・枠自身のラベル、計64要素)の外接矩形を完全に含むか」を実測し、**はみ出し0件**を確認した。外形は既定・対照とも**320×310px**、枠を開いた状態でカードの縦幅が**320×328px**まで伸びる(枠の高さぶんだけ`chart-wrap`が伸縮する設計で、これも340×330px以内に収まる)。',
    Component: PastRestated,
  },
  {
    id: 'declared-on-declared',
    no: 130,
    nameJa: '申告の上に積んだ申告',
    nameEn: 'Declared on Declared',
    category: 'アナリティクス',
    trigger:
      '単価・原価率の「＋」で埋める、「⟲」で測り直す。行をクリックすると台が主役になる（右上で「触れたら値ごと破線＋"推定"」対照に切り替え）',
    principles: ['深さは長さではなく本数で運ぶ', '伝播は止めない。運ぶのは段数', '着地するかどうかは、根に届くかどうかで決まる'],
    ecology:
      'No.125 は伝播を**1ホップ**で解いた（申告が混じった合計の縁は破線）。No.127 は積もった量を**台の下辺の長さ**で解いた。どちらも**平ら**である——申告が申告を材料にする場合を扱っていない。ここでは客数(測定・固定)・単価・原価率(ともに読み手が埋める葉)から**売上→粗利→来期の粗利(試算)**が式で連なる。難所は「深さを載せる軸が下辺(1次元)に無い」ことで、答えは**下辺を段数ぶん縦に積む**——127が横に分けた区間を、130は縦に重ねる。段数は**leafなら測定0/申告1、computedなら依存の最大値+1**という再帰だけで決まり、実測で `data-depth` と下辺の本数は**全30チェック(5状態×6行)で差0件**。単価を1回「埋める」だけで、**売上(1→2)・粗利(2→3)・来期の粗利(1→2)の3行が同時に**増える——1つの葉が、そこに依存する行すべての段数を一斉に動かす。下辺どうしは `border-bottom-width` **2px**・`border-bottom-color` **rgb(61,61,61)**・`opacity` **1** が全区間で **distinct 1 値**、`border-bottom-style` は **solid/dashed の distinct 2 値**——**深さは本数だけが運ぶ**（C2）。区間の下には**台(レール)を全行に常設**した——測定そのもの(段数0、客数・および測定状態の単価/原価率)でも `#d6d6d3`(既存トークン。128の `rgb(214,214,211)` と同じ値の再利用で新色ではない)の薄い線が必ず描かれ、その上に区間が0本、という絵になる。区間(と台)どうしのy座標の最小間隔を実測すると、**全30チェック(5状態×6行)を通して最小3.000px・最大3.000px**(常に一定)——隣り合う2本が重ならないことを個数の一致とは別に確認している。第2の芯が**着地の判定**で、客数という固定の錨に系譜のどこかで届くかどうかで、届けば**最下段だけsolid**（売上・粗利は`単価`が申告になっても客数経由で必ず着地し、実測は `[solid,dashed]` `[solid,dashed,dashed]`）、届かなければ**全段dashed**になる。`来期の粗利`は依存が**単価と原価率の2つの葉だけ**(客数を一度も経由しない)なので、両方を埋めた瞬間 `grounded=0`・`styles=[dashed,dashed]` になる——**着地しない値が実在する**(C5)。数字は6行とも `1,240人`/`¥3,200`/`¥3,968,000`/`62%`/`¥1,507,840`/`¥608,000` で **5状態を通して distinct 1 値**、台の幅も6行×5状態すべてで **130px** の distinct 1 値（差 **0.0000px**、C3）。`測り直す`を埋めた順と逆に2回押すと、`data-depth`・`grounded`・`styles`・値のすべてが初期状態と**バイト単位で一致**する(JSON比較で完全一致、往復差0、C4)——深さは経路の関数であって、押した回数の関数ではない。既定は `推定`/`信頼度`/`dialog`が**0個**、閾値定数も既定の描画には一切現れない(C6)。全要素の `animation-name` は **`none`**、`.track`/`.seg` に `transition` 宣言はコード上どこにも無く `transition-duration` は **`0s`**(C7)。対照(「触れたら値ごと破線+推定」)は125/127の対照の延長だが、**伝播の仕方そのものを間違える**——売上は客数(測定)に支えられているのに、単価が申告になった瞬間、対照はそれを見ずに**触れた値を丸ごと**推定にする。実測で**単価を1回埋めただけ**で `単価・売上・粗利・来期の粗利` の**4行**が推定になり(既定でこの時点で根拠を失うのは単価**1行**だけ)、`TAINT_THRESHOLD=3`(対照だけが持つ閾値定数、6行の半数)を**この1手だけで**超えて `信頼度: 低（推定4/6）` と `dialog` が割り込む。原価率も埋めると推定は **5/6**(客数だけが残る)——対照の下辺は6行とも常に **1本・solid の distinct 1 値**で、深さの情報を1つも運ばない(C8)。`測り直す`を1回戻すと、既定は下辺の破線が **7→3(delta -4)**、対照は推定行が **5→3(delta -2)**——**対照は増えるときは1手で過半数を超えるほど大げさなのに、減るときは既定ほど戻らない**という非対称性が実測から見えた。外形は既定 **340×313px**(全操作を通して不動、depth3まで到達しても1pxも動かない——台の高さを段数ぶんではなく固定18pxで確保しているため)、対照は初期 **340×241px**・警告バー表示時 **340×263px**(ダイアログはoverlayなのでレイアウトには影響しない)。いずれも340×330pxの上限内。**実装が企画の書き間違いを1つ掘り当てた。** 企画の台本は`来期の粗利=粗利×成長率`と書いていたが、そのまま実装すると`来期の粗利`は`粗利→売上→客数`を経由して**必ず**測定に着地してしまい、答え4が要求する「着地しない値」を1行も作れない。実装は`来期の粗利`の依存を**客数を経由しない単価・原価率の2葉だけ**に付け替えることでC5を満たした——企画の例は「例:」と断ってあったので踏み越えたが、**企画の台本をそのまま実装すると、企画自身の受け入れ条件(C5)と矛盾する**という組み合わせは今回が初めてで、報告に残す。もう1つ、企画は段数0(客数)の下辺をどう見せるか書いていなかった——実装は「0本(何も積んでいない)」を採用し、測定である客数だけが下辺そのものを持たない特別な行になった(この帰結で、`計算であること自体が+1`という規則も導かれる——客数と単価が両方測定でも、売上は計算値である以上つねに段数1から始まる)。目視では、対照のダイアログ文言(`過半数の値が推定です。このまま読みますか？`)が幅220pxだと2行に割れて読点の位置で不格好に折り返していたのを実測後に発見し、幅を**250px**に広げて1行に収めている(数値条件はどちらの幅でも通っていた)。この標本にはSVGもCSS `transform` も一切無く(過去5回の「絵としてだけ破綻」はいずれも`transform`の二重定義が原因だった)、赤で塗るのは対照の警告バー・バッジ・ダイアログのボタンだけで背景色との衝突は起きていない。**この図鑑で6回連続になった「実測は全部通るのに絵としてだけ破綻する」を、この標本も一度は踏んだ。** 初版は区間の間隔を1px、下辺の高さを11pxで組んでいた——`getBoundingClientRect`は隣接する区間の矩形が1px離れていることを正しく返し、C1(本数=段数)・C2(線種二値/太さ・色・不透明度distinct1)は全部通っていた。しかし**実測は「2本の矩形が重なっていないか」しか見ておらず、「2本が見分けられる太さの隙間か」は誰も測っていなかった**。実際に描画すると、`border-bottom`は`box-sizing:border-box`の2px高の箱いっぱいに描かれるため区間そのものは太さ2pxの帯になり、1px の隙間はGIFの縮小(560×360→480×309)と組み合わさるとほぼ潰れ、**段数2の行(粗利の初期状態など)は1本の太い線にしか見えなかった**。この標本の芯は「深さは下辺の本数だけが運ぶ」であり、本数を数えられない絵は主張そのものが立たない——この不具合は**目視でしか拾えず、実測(C1・C2)は0件のまま6回連続の型を繰り返すところだった**。直した点は2つ。ひとつ、区間どうしの間隔を1px→**3px**に広げ、台の高さを11px→**18px**にした(段数3(この標本の最大)+台1本ぶんの4本を、間隔3pxで確実に離して収める)。ふたつ、**台(レール)を全行に常設**した——直す前は段数0の行(客数、および測定状態の単価・原価率)は区間もレールも無く、「担体が無いのか、担体はあるが0本なのか」が画面から読めなかった(図鑑の既存の教訓「担体は、それが載る場所が描かれていないと読めない」)。直した後は、隣接する区間(および台)のy座標の最小間隔を新しく実測項目に加え、**全30チェックで最小3.000px・最大3.000px**(常に一定)であることを確認している。ズームしたスクリーンショットで3段の下辺(粗利: solid/dashed/dashed)と2段の全dashed(来期の粗利)、GIFの実サイズ(480×309)への縮小後の絵の両方を見比べ、本数と最下段の実線/破線が肉眼で即座に数えられることを確認済み。',
    Component: DeclaredOnDeclared,
  },
  {
    id: 'as-of-mismatch',
    no: 131,
    nameJa: 'そろっていない現在',
    nameEn: 'Unaligned As-Of',
    category: 'アナリティクス',
    trigger:
      '行の右端の ⟲ で1行だけ取り直す。`最古を取り直す` / `全部取り直す` / `しばらく置く` を押す（右上で「バッジ＋`最終更新`＋`同期済み`」対照に切り替え）',
    principles: ['そろっていないことは、台の端の不揃いで読む', '合計はいちばん古い材料より新しくなれない', '揃っているは状態ではなく、許容の宣言'],
    ecology:
      '8つの指標（新規登録・ログイン数・商品閲覧・カート追加・決済完了・問い合わせ・返品・招待送信）が並び、合計行が最下段に付く。**行ごとに取得時刻が違う**（`3分前`から`7日前`まで）が、画面はずっと自分が1つの「いま」を持っているかのように振る舞ってきた。手段はほとんど塞がっている——No.117 の係留線は1担体に1本で、8行に8本引くと No.127 が言った「伝播が強すぎて区別が死ぬ」が線の側で起きる。No.128 が「時間の定規（x軸）は貫通させる」と決めたので、行ごとの基準時点はその1本のxには載せられない。**答えは、台を行ごとに持つことだった。** 各行が自分の台（トラック、全行共通の全長 `TRACK_PX=190px`、左端は全行共通で固定）を持ち、その**右端の位置**が基準時点になる（x=時刻、右が「いま」、対数目盛り＝`log1p(経過分)/log1p(20160)`）。線を1本も増やさず、もともと在る台の輪郭がズレを運ぶ。C1（各行の台の右端 x が `data-as-of-min` から計算した期待 x と一致するか）は8行とも**最大差 0.0154px**（`≤0.5px` を通過）。C2（合計の台の右端＝いちばん古い行の右端）は初期状態で **`243.281px` と `243.281px`、差 0.000px** と完全一致（合計の材料のうち最古は `問い合わせ`＝7日前）。**この標本のいちばん強い絵は C3。** いちばん古くない行（`ログイン数`、2日前）を取り直すと、その行の台の右端は **`267.281px → 420px`（+152.719px）** 伸びるのに、**合計の右端は `243.281px → 243.281px`（差 0.000px）で1pxも動かない**——合計の材料の中でいちばん古いのは別の行（`問い合わせ`）だからである。続けて `最古を取り直す`（＝いちばん古い行、`問い合わせ`）を押すと、今度は合計の右端が **`243.281px → 284.063px`（+40.781px）** 動く——次点の最古（`カート追加`、20時間前）まで進んだ値と実測が一致する。**1行を新しくしても合計は新しくならないが、いちばん古い行を新しくすると合計が新しくなる**、という答え2の非対称性を、動かなかった数値と動いた数値を並べて示せた。C4（取り直しの前後で行の個数・並び順・y座標が変わらないこと）は `しばらく置く`＋`全部取り直す` を挟んでも**全9行（8指標＋合計）の `top` 差分が0.000px**、行数は**9→9**で不変。C5（既定に `同期済み`/`最新`/警告に相当する要素・閾値定数が0個であること）は `sync-badge`/`header-updated` に相当する要素が既定側に**そもそも存在しない（0個）**——分岐で隠したのではなく、その概念自体を既定のレンダリング関数が持たない。台の右端の `background-color`（`rgb(61,61,61)`）・`opacity`（`1`）は全9本の台で **distinct 1値**——**ズレは位置（width）だけが運ぶ**。C6（`全部取り直す` の後も右端が揃わないこと）が答え3の証明で、取り直しに処理順のズレ（1行ごとに3分＝`RETAKE_ALL_STEP_MIN`）を持たせてあるので、8行の右端は **`360.7 / 363.5 / 366.8 / 370.8 / 375.9 / 382.7 / 393.4 / 420px`（distinct 8値、最大差 59.266px）**——**揃えようとしても、揃った状態は画面に一度も現れない**。C7 は既定の全要素で `animation-name` が **`none`（distinct 1値）**、台・台の右端の `transition-duration` は **`0s`（distinct 1値）**——時間経過（`しばらく置く`）ですら中割りを作らない。対照（台をやめて行ごとに`N分前`バッジを出し、全体に`最終更新`と`同期済み`を出す）の壊れ方はC8で3つ実測できた。ひとつ、**全体の`最終更新`は、いちばん新しい行の時刻を名乗る**——初期状態で最新の行は`商品閲覧`（3分前）だが、最古の`問い合わせ`は7日前。見出しは`最終更新: 3分前`と表示され（`data-shown-min`が全行中の最小値と一致）、**合計の材料の半分近くが何時間も前の値であることを一度も言わない**。ふたつ、**合計行のバッジも同じ理由で`3分前`を名乗る**（本来の合計の時点＝全行中の最大age＝7日前は画面のどこにも出てこない）。みっつ、**`同期済み`は閾値（`SYNC_THRESHOLD_MIN=30分`。対照だけが持つ値で既定のロジックには一度も出てこない）を全行が下回ったときにだけ現れる**——`全部取り直す`の直後（8行のageが0〜21分に収まる）は`syncBadgePresent: true`だが、そこからもう一度`しばらく置く`（+10分、最大ageが21→31分）を押すと**`syncBadgePresent: false`に断絶する**。**8行のバッジの数字自体は取り直し前後でバラバラのまま（distinct値のまま）なのに、`同期済み`の有無だけが閾値を跨いだ瞬間に飛ぶ**——ここが No.106 違反の実演であり、既定の「揃った状態は一度も現れない」という誠実さと対照的な、対照側の嘘そのものである。**実装で踏んだ罠が1つ。** 最初は行のまとまりを `display:contents` の div で持たせようとしたが、`display:contents` の要素は自分のボックスを持たないため `getBoundingClientRect` が全て0を返し、C4（行のy座標が動かないこと）が実測できなくなる——DOMに出ない `React.Fragment` を「まとめ役」にし、行の位置は `.mz-as-of-mismatch-track`（実体のある要素）そのもので測る設計に変えて解いた。**もう1つ、`全部取り直す` を最初「全行を同時に age=0 にする」で書くと、C6（揃った状態が一度も現れないこと）が成立しなくなる**（8行が distinct 1値に収束し、答え3の証明が自壊する）——取り直しに処理順のズレを明示的に持たせて初めて、「揃えようとしても揃わない」が実測できるようになった。**企画が決めていなかったこと**が2つある。ひとつ、目盛りの単位表記（`いま`/`-1h`/`-6h`/`-1d`/`-1w`）は No.128 の前例（台は自分の単位を名乗ってよい）に従って実装が決めた——値についての名指しではなく、定規が自分の単位を名乗っているだけなので、この回の主題（画面について語ってよいのは台だけ）には触れない。ふたつ、合計の「値」（1,855件、8行の素の合計）をどの操作でも1文字も変えないことにした——企画は「値は変わってよい」としていたが、値まで動かすと「動くのは台の右端だけ」という芯がぼやけるため、値を固定して位置だけを動かす設計にした（No.127 の踏襲でもある）。外形は既定 **340×245px**、対照 **340×247px**（いずれも340×330px以内）。',
    Component: AsOfMismatch,
  },
  {
    id: 'compare-across-as-of',
    no: 132,
    nameJa: '窓の違う2つを比べる',
    nameEn: 'Compare Across As-Of',
    category: 'アナリティクス',
    trigger: '`窓をそろえる` を押す。`やり直す` で戻す（右上で「差を1値で言い切り、`最終更新` は新しいほうを名乗る」対照に切り替え）',
    principles: ['分解できない差は、幅のまま出す', 'そろえることは、捨てること', '捨てた材料は薄めない。台を失うだけ'],
    ecology:
      '今週の合計（¥318,600）と先週の合計（¥146,700）を並べて比べる。**数え方は同じ**なので、No.128「定義が途中で変わった」の答え（数え方の定規は貫通させない）はここでは使えない——目盛りは**貫通してよい**（既定の `ruler` は2行で共通の **1 組**）。違うのは**材料の締め日**だけで、今週は6日目まで、先週は3日目までの材料で出来ている。**差は本当に存在する。ただし、そのうちどれだけが実際の変化で、どれだけが窓の違いかが分解できない**——「出せない」のではなく「分解できない」。既定の答えは、**差を1つの数にせず、幅を持った区間で出す**こと。No.74「推定の狭まり」の語彙を借りるが、借りるのは**幅だけで中心線は描かない**（中心に相当する要素は DOM に **0 個**）。実測で帯は初期状態 **207.08px**（`+¥12,600 〜 +¥171,900`）。**この標本の芯は `窓をそろえる` の1クリックにある。** 押すと比較可能になる（帯の幅 **207.08px → 0px**、値は `+¥12,600` の1値に確定）と**同時に**、今週の台の右端が **476.14px → 347.56px** へ引く——**そろえるとは、新しいほうの材料を捨てること**である。遷移中の10サンプルで台と帯は常に一緒に動き（`257.14/207.08 → 221.03/148.92 → 180.30/83.31 → … → 128.75/0.30`）、**片方だけが動くフレームは 0 枚**。捨てられた材料は**消えない**——`discard-fill` が **347.56〜476.13px** にそのまま残り、`background-color` **rgb(61,61,61)** / `opacity` **1** は台に載っている塗りと**完全一致**する（薄めていない）。**実物を見て企画が1つ壊れていたことが分かった回でもある。** 初版は数値条件（C1〜C6）を全部通していたのに、**揃える前と後で絵がほとんど同じ**だった——捨てられた塗りが、台の引いたあとの空間をちょうど同じ濃さで埋めるので、塗りの総延長も見た目も変わらない。No.116・No.118 が踏んだ「**担体は、それが載る場所が描かれていないと読めない**」の裏返しで、ここでは**「台を失った」を言うのに、失われる台そのものが描かれていなかった**。直しは、レールを塗りの**背景ではなく下**（塗りの下端から4px下、高さ2px、`rgb(201,201,198)`）に独立した担体として描き、台と同じ 0.5s で一緒に縮ませること（**476.14px → 347.56px**）。**塗りは1pxも動かない**まま、揃えたあとは「塗りの右側3日分の下にだけレールが無い」という絵になる。**不透明な塗りの下に敷いた台は、永久に見えない。** 閾値は置かない（`比較可能` `そろっています` 等の判定文言・バッジは既定に **0 個**）。押す前から「そろえると何日ぶん捨てるか」は台の右端の差として見えているので、**読み手は交換レートを見てから決められる**。基本イージング（ぷるん）は使わない——帯の幅は確度についての事実なので、行き過ぎて戻ると「一瞬だけ実際より確信していた」という嘘になる（No.74 の判断の継承。`animation-name` は既定の全要素で **none**）。対照は差を**生の1値**（**+¥171,900**＝既定の帯の**上限と同じ数**）で言い切り、帯の要素は **0 個**。`窓をそろえる` を押しても台もレールも **257.14px / 128.56px のまま1pxも動かず**、`discard-fill` は **0 個**——**差の数字だけが黙って `+¥12,600` に変わる**。しかも as-of の表示は `最終更新: 今日 09:12` の **1 つだけ**で、先週側の締め日を一度も名乗らない（No.131 の対照と同型の誤り。**最後に触った値が画面全体の名前になる**）。**捨てたことが画面のどこにも出ない。**',
    Component: CompareAcrossAsOf,
  },
  {
    id: 'branch-abandoned',
    no: 133,
    nameJa: '捨てた分岐',
    nameEn: 'Abandoned Branch',
    category: 'ナビゲーション',
    trigger: '`次の週へ` で第6週まで進め、`第3週からやり直す` を押す。`捨てたほうを見る` で再演の枠を開く（右上で「やり直しを履歴に1点足し、枝は消してトーストを出す」対照に切り替え）',
    principles: ['やり直しは台帳に点を増やさない', '捨てた枝は消さない。薄めない。動かさない', '捨てた値は、いまの台に載せない'],
    ecology:
      '同じ週を**別の手でやり直す**。捨てたほうの結果を読み手は覚えているのに、画面のどこにも無い——**起きたのに、いまの世界には無い**。この図鑑がまだ持っていない三つ目の状態である（No.114 の「まだ起きていない」でもなく、No.113 の「本当に起きた（ので同じ動きで再演してよい）」でもない）。交換関係は **「やり直せること」↔「いまの世界が1本であること」**。既定の第1の芯は、**やり直しが台帳に点を1つも増やさない**こと（No.112「巻き戻しは移動ではない。台帳に跡を増やさない」の継承）——実測で本線の点は `data-main-count` **7 → 7**、対照は **5 → 6** で **+1**。**対照では、戻ったのに前へ進んだように見える。** 増えるのは枝のほうで、**台帳は1本のまま、その外側**に残る（前回の回が禁じた「台帳を足す」をやらずに、「戻れること」と「戻った記録が残ること」を両立させる形）。第2の芯は**薄めないこと**で、枝の点と本線の点は `background-color` **rgb(61,61,61)** / `opacity` **1** / **9×9px** まで完全一致する。違うのは位置だけ——本線は台の上端 **y=19.50px**、枝は **y=51.50px**、x は週ごとに**完全に一致**する（週4/5/6 が **243.50 / 301.50 / 359.50px** で本線と同じ）。**同じ週の下に、同じ形で置く。** 第3の芯は**枝が一度も動かない**ことで、生えたあと再演の枠を開閉しながら取った 20 サンプルで、枝3点の位置は **distinct 1 通り**（`243.50,51.50 | 301.50,51.50 | 359.50,51.50`）。これは No.98「他人の現在地」との撃ち分けである——**他人は行の外に遅れて滑って届き、自分の捨てた過去は行の外で動かない**。同じ「列の外」でも、動きの有無で別の事実を言う。第4に、**現在地は枝に一度も乗らない**（`is-current` が付いた枝の点は **0 個**）。現在地は本線の末尾座標だけから導出され、実装は枝の配列を一度も参照しない——**分岐で隠しているのではなく、参照するルールが存在しない**。第5に、捨てた枝の**値**（145 / 190 / 195）は再演の枠（No.113・No.129 の語彙）の中でだけ読め、`いまの残高` は同じ操作を通して **distinct 1 値（215）**——枝の値が現在の台へ漏れない。そして**画面は何も推奨しない**（「こちらのほうが良い結果でした」「元に戻しますか？」に相当する文言は既定に 0 個）。捨てた枝のほうが良い数字でも、読み手が枝の点の値を見て自分で読む。対照は同じ操作で枝の要素が **0 個**、`やり直しました` のトーストが **1 個 → 2.2 秒後に 0 個**——**分岐したことが画面のどこにも残らず、読み手の記憶にだけ残る数字ができる**（No.129「過去のほうが変わった」と同じ構造で、しかもこちらは**読み手自身が起こした**）。**実装が企画の言葉の穴を1つ埋めている。** 企画は「やり直しの前後で点の個数が ±0」と書いたが、素直に「第3週まで切り詰める」と実装すると個数は**減る**。実装は切り詰めた分をその場で同じ本数だけ別の手で積み直す形にして ±0 を成立させた（週の中身だけが入れ替わる）。あわせて、`branches` を**末尾追記オンリーの配列**にして枝の行番号を配列 index そのものにしている——後から生えた枝が既存の枝の位置をずらす経路を、構造ごと消してある。**着地に尺ゼロを与えるより、中間状態を持たないほうが確実**という判断も出た（やり直しを1回の同期的な更新で最終形まで作るので、「第3週にいったん戻る」フレームが DOM に存在しない）。',
    Component: BranchAbandoned,
  },
  {
    id: 'thinned-to-fit',
    no: 134,
    nameJa: '入れきれないので間引く',
    nameEn: 'Thinned to Fit',
    category: 'アナリティクス',
    trigger: '`拡大` で中央付近を 1/8 に絞り、`戻す` で全域へ。同じ操作を対照でも繰り返す（右上で「等間隔サンプリングで滑らかな折れ線を描く」対照に切り替え）',
    principles: ['落としていいのは点の個数だけ', '拡大しても、山の頂点は動かない', '捨てたことは帯の太さだけが言う'],
    ecology:
      '5,000 点の系列を 400px の台に描く。1画素あたり 12.5 点あるので、**全部は描けない**——この回の3つめの交換を起こすのは読み手でも台帳でもなく、**画面の幅という物理**である。既定の答えは、**落としてよいのは点の個数だけで、極値は落とさない**こと（No.88「動かさずに同じことを言う」＝潰していいのは尺と反復だけ、の**データ版**）。各画素列を「その画素に落ちる点の min〜max を結ぶ縦の1本」として描くので、**1 点しか無いスパイクでも必ず画面に出る**。実測で系列の真の最大値は **150（y=5.56px）**、既定の描画上の最大値は **150.00（y=5.56px）** で**完全一致**。対照（等間隔サンプリングで 400 点を拾って結ぶ）は全体表示での最大値が **63.04（y=114.99px）**——**真の最大値より 109.43px 低い位置にしか線が無い＝スパイクが1本も画面に出ない**。第2の芯は**拡大しても絵の形が変わらない**ことで、y のドメインは系列全体から一度だけ算出して倍率で再計算しない（**35.22〜154.41** が全モード・全倍率で同一）。拡大区間（idx 2187〜2811）内の最大値の y は、既定が全体表示 **74.77px** → 拡大 **74.77px** で**差 0.000px**。対照は同じ区間が全体表示では **114.99px**（値 63.04）にしか無く、拡大すると **74.77px**（値 95.00）に跳ぶ——**40.22px 動く＝データは1点も変わっていないのに、無かった山が生えてくる**。しかも生え方が**動き**なので、読み手は「いま何かが起きた」と読む（No.102 の「湧く」＝出現の語彙の誤用）。第3に、**捨てた順序は帯の太さが言う**。帯にしても画素の中の点の順序は本当に捨てているが、**太い画素ほど「ここには中身がある」と言っている**ので、読み手が次にどこを拡大すべきかが画面から分かる（帯の高さの distinct 値は全体表示 **14**、拡大時 **15**）。交換レートを画面が決めず、**読み手に次の一手を渡す**形になっている。第4に、画面は**判定しない**——`間引いています` `一部は表示されていません` に相当するバッジ・文言は **0 個**（`data-badge-count="0"`）で、件数表示は既定・対照とも **`5,000 件`** の同一文字列。**数字は嘘をつかない。違うのは絵だけである。** 基本イージング（ぷるん）は使わない——行き過ぎて戻ると「一瞬だけ実際より大きい値があった」というデータについての嘘になる。**実物を見て企画の言葉が1つ足りないと分かった。** 初版は「落としていいのは点の個数だけ」を素直に実装したが、拡大すると1画素あたり 1.5 点に落ちて `min === max` の列が増え、**隣の列と値域が重ならない箇所が 248 件**発生した——帯が繋がらず、**折れ線が粒の散らばりになって系列の形が読めない**。直しは各列の値域に**直前の列の最後の点を必ず含める**こと（min/max 間引きの実務で知られた欠陥と同じ解き方）で、拡大時の途切れは **248 件 → 0 件**。極値は広がる方向にしか変わらないので、C1・C2 の実測値（150/5.56、74.77 → 74.77）は**修正前後で1つも変わっていない**。**正しい言い方は「落としていいのは点の個数だけで、値の範囲も、隣とのつながりも落としてはいけない」だった。**',
    Component: ThinnedToFit,
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
