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
