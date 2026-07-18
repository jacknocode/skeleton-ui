/* ============================================================
   アイデアの苗床 — 標本候補の台帳
   ============================================================
   ここに1エントリ追記するだけで、図鑑の下部「アイデアの苗床」に
   自動で並ぶ。思いついたら書く、育ったら標本化する、が回る場所。

   ライフサイクル:
     seed（種）      … 一行の思いつき。質より量でどんどん貯める
     sprout（育成中） … 動きの設計を詰めている・試作中
     captured（標本化済み） … specimens/ に実装済み。specimenId で図鑑と繋がる

   標本化の手順は IDEAS.md を参照（pnpm new <id> で雛形が作れる）。
   ============================================================ */

export type IdeaStatus = 'seed' | 'sprout' | 'captured'

export interface Idea {
  /** 台帳内でユニークなslug。標本化したらフォルダ名と揃える */
  id: string
  title: string
  /** どう動くかの一行スケッチ。「何が・どんな緩急で・何を伝えるか」 */
  motion: string
  /** 使いどころのタグ（ゲーム/汎用/通知 など自由に） */
  tags: string[]
  status: IdeaStatus
  /** captured のとき、specimens/ のフォルダ名 */
  specimenId?: string
}

export const IDEA_STATUS_LABEL: Record<IdeaStatus, string> = {
  seed: '種',
  sprout: '育成中',
  captured: '標本化済み',
}

export const ideas: Idea[] = [
  /* ---------- 標本化済み（図鑑と繋がった種たち） ---------- */
  {
    id: 'hpbar',
    title: 'HPバーの遅延ゴースト',
    motion: '本体は即減り、薄い残像がワンテンポ遅れて溶けて追いつく。削られた幅が目に残る',
    tags: ['ゲーム', 'ゲージ'],
    status: 'captured',
    specimenId: 'hpbar',
  },
  {
    id: 'counter',
    title: 'コインのドラムロール',
    motion: '各桁がスロットのドラムのように回って止まる。桁上がりはぽこっと湧く',
    tags: ['ゲーム', '数値', '報酬'],
    status: 'captured',
    specimenId: 'counter',
  },
  {
    id: 'popnum',
    title: '飛び出すダメージ数字',
    motion: '叩くと数字が跳ね上がって散らばる。会心はためてから3倍サイズで弾ける',
    tags: ['ゲーム', '数値', 'ヒット'],
    status: 'captured',
    specimenId: 'popnum',
  },
  {
    id: 'levelup',
    title: '経験値バーの臨界',
    motion: '満タンの瞬間に光の波が走り、バッジがぼんっと跳ねて桁が上がる。余りは持ち越し',
    tags: ['ゲーム', 'ゲージ', '祝福'],
    status: 'captured',
    specimenId: 'levelup',
  },
  {
    id: 'combo',
    title: '育つコンボカウンター',
    motion: '連打で数字がパンチのように打ち込まれ、育つ。途切れるとぱたっと崩れ落ちる',
    tags: ['ゲーム', '数値', '緊張感'],
    status: 'captured',
    specimenId: 'combo',
  },
  {
    id: 'chest',
    title: 'じらす宝箱',
    motion: 'すぐ開かずガタガタ震えてタメ、それからぱかっと開いて光と戦利品が飛び出す',
    tags: ['ゲーム', '報酬', 'じらし'],
    status: 'captured',
    specimenId: 'chest',
  },
  {
    id: 'cooldown',
    title: 'スキルの影時計',
    motion: '発動でバチンと弾け、影が時計回りに晴れていく。回復の瞬間はぷるんと輪を放つ',
    tags: ['ゲーム', 'ボタン', '待ち時間'],
    status: 'captured',
    specimenId: 'cooldown',
  },
  {
    id: 'gacha',
    title: 'カードめくりの引き',
    motion: '浮遊して期待を作り、勢い余ってひるがえる。光の輪と斜めのシャインで祝う',
    tags: ['ゲーム', '報酬', '3D'],
    status: 'captured',
    specimenId: 'gacha',
  },

  {
    id: 'energy-drops',
    title: 'スタミナのしずく',
    motion: '行動するとエネルギー玉がひとつ、ぷちんと潰れて蒸発する。回復はぽたっと満ちる',
    tags: ['ゲーム', 'ゲージ', 'リソース'],
    status: 'captured',
    specimenId: 'energy',
  },
  {
    id: 'shield-crack',
    title: 'シールド割れ',
    motion: 'ガードにヒビが走り、パリンと破片が飛び散る。割れる直前に一瞬白く光る',
    tags: ['ゲーム', 'ヒット', 'パーティクル'],
    status: 'captured',
    specimenId: 'shield',
  },
  {
    id: 'achievement-toast',
    title: '実績トースト',
    motion: '下からせり上がり、メダルがくるんと一回転してから静止。少し待って引っ込む',
    tags: ['ゲーム', '通知', '祝福'],
    status: 'captured',
    specimenId: 'toast',
  },

  /* ---------- 種・育成中 ---------- */
  {
    id: 'quest-stamp',
    title: 'クエスト受注スタンプ',
    motion: '判子がドンと押されて紙が波打つ。インクが一瞬にじむ',
    tags: ['ゲーム', '確認'],
    status: 'seed',
  },
  {
    id: 'map-pin',
    title: 'ミニマップのピン',
    motion: 'ピンが空から落ちてバウンドし、着地点に波紋が広がる',
    tags: ['ゲーム', 'ナビゲーション'],
    status: 'seed',
  },
  {
    id: 'roulette',
    title: '惜しがるルーレット',
    motion: '減速していき、境界で一度戻りそうになってから止まる。物理の重さで期待を作る',
    tags: ['ゲーム', '報酬', 'じらし'],
    status: 'seed',
  },
  {
    id: 'slot-reel',
    title: 'スロットの目押し',
    motion: 'リールが行き過ぎてから、がしゃんと戻って揃う。揃った列が明滅する',
    tags: ['ゲーム', '報酬'],
    status: 'seed',
  },
  {
    id: 'path-dots',
    title: '経路の点線行進',
    motion: '目的地までの点線が、先頭からにょろにょろと進んで道を教える',
    tags: ['ゲーム', 'ナビゲーション'],
    status: 'seed',
  },
  {
    id: 'dialog-typewriter',
    title: '会話のぽこぽこ文字',
    motion: 'セリフが1文字ずつぽこっと湧く。感情が高ぶると文字が震える',
    tags: ['ゲーム', 'テキスト'],
    status: 'seed',
  },
  {
    id: 'buff-bubbles',
    title: '状態異常の泡',
    motion: '毒アイコンがぷくぷくと泡立ち、バフは上向きの矢印が繰り返し湧き上がる',
    tags: ['ゲーム', 'ステータス'],
    status: 'seed',
  },
  {
    id: 'rank-swap',
    title: 'ランキングの入れ替わり',
    motion: '自分の行が滑り上がり、抜かれた行は少し沈んでから席を譲る',
    tags: ['ゲーム', 'リスト'],
    status: 'seed',
  },
  {
    id: 'countdown-heartbeat',
    title: '残り3秒の鼓動',
    motion: 'カウントダウンの数字が心臓のように鼓動し、残りが減るほど拍が速まる',
    tags: ['ゲーム', '緊張感', '数値'],
    status: 'captured',
    specimenId: 'countdown',
  },
  {
    id: 'daily-calendar',
    title: '日替わり報酬めくり',
    motion: '今日のマスがめくれて光り、受け取るとチェックがしゅっと描かれる',
    tags: ['ゲーム', '報酬', 'カレンダー'],
    status: 'seed',
  },
  {
    id: 'slot-snap',
    title: '装備スロットの磁力',
    motion: 'ドラッグ中のアイテムがスロットに近づくと磁石のように吸い付き、ぷるんと収まる',
    tags: ['ゲーム', 'ドラッグ', 'インベントリ'],
    status: 'seed',
  },
  {
    id: 'wallet-shake',
    title: 'お金が足りない首振り',
    motion: '購入ボタンが「ううん」と首を横に振る。財布アイコンが逆さになって空っぽを見せる',
    tags: ['ゲーム', 'エラー', '汎用'],
    status: 'captured',
    specimenId: 'wallet',
  },
  {
    id: 'unlock-door',
    title: '新機能アンロック',
    motion: '錠前が跳ねて外れて落ち、扉がひらいて中身がぽんと登場する',
    tags: ['ゲーム', '祝福', '解放'],
    status: 'seed',
  },
  {
    id: 'check-chain',
    title: 'ミッション達成の連鎖',
    motion: 'チェックが連鎖して付き、達成分がゲージへしゅるしゅると吸い込まれていく',
    tags: ['ゲーム', 'タスク', 'ゲージ'],
    status: 'seed',
  },
  {
    id: 'iris-wipe',
    title: 'アイリスワイプ遷移',
    motion: '丸い穴がきゅっと閉じて暗転し、次のシーンでぱっと開く。レトロゲームの幕間',
    tags: ['ゲーム', '画面遷移'],
    status: 'seed',
  },
  {
    id: 'boss-banner',
    title: 'ボス登場の帯',
    motion: '黒い帯が左右からシャキーンと交差し、名前が一拍遅れてドンと据わる',
    tags: ['ゲーム', '演出', '緊張感'],
    status: 'captured',
    specimenId: 'banner',
  },
  {
    id: 'hit-stop',
    title: '会心のヒットストップ',
    motion: '当たった瞬間に全体が2フレーム止まり、それから衝撃が弾ける。止め＝強さの誇張',
    tags: ['ゲーム', 'ヒット', '緩急'],
    status: 'seed',
  },
  {
    id: 'rainbow-tease',
    title: 'レア排出の待ち焦らし',
    motion: '開封前の光の色が段階的に変わり、最後は光の柱が立つ。色が期待値の言語になる',
    tags: ['ゲーム', '報酬', 'じらし'],
    status: 'seed',
  },
  {
    id: 'save-book',
    title: 'セーブ中の本めくり',
    motion: '小さな本のページがぱらぱらとめくれ続ける。保存完了でぱたんと閉じる',
    tags: ['ゲーム', 'ローディング'],
    status: 'seed',
  },
  {
    id: 'quest-tracker-slide',
    title: 'クエスト目標の差し替え',
    motion: '達成した目標がチェック付きで上へ抜け、次の目標が下からせり上がって入れ替わる',
    tags: ['ゲーム', 'タスク', 'リスト'],
    status: 'seed',
  },
  {
    id: 'radar-ping',
    title: 'レーダーのピン',
    motion: '走査線がくるりと回り、獲物を見つけると輝点がぽんっと膨らんで鼓動する',
    tags: ['ゲーム', 'ナビゲーション'],
    status: 'seed',
  },
  {
    id: 'stack-collect',
    title: '戦利品の吸い込み',
    motion: 'ドロップ品が弧を描いてカバンへ吸い込まれ、着弾のたびにカバンがぷるんと膨れる',
    tags: ['ゲーム', '報酬', 'インベントリ'],
    status: 'seed',
  },
  {
    id: 'turn-flip',
    title: 'ターン交代の札',
    motion: '「YOUR TURN」の札がくるっと裏返って相手の色になる。交代の瞬間だけ少し浮く',
    tags: ['ゲーム', 'ターン制'],
    status: 'seed',
  },
  {
    id: 'weakpoint-blink',
    title: '弱点のまたたき',
    motion: '弱点マーカーがゆっくり呼吸し、攻撃チャンスの間だけ拍が速まって誘う',
    tags: ['ゲーム', '誘導', '緊張感'],
    status: 'seed',
  },
  {
    id: 'streak-flame',
    title: '連勝の火が育つ',
    motion: '勝つたびに炎アイコンがひと回り育ってゆらめく。途切れると煙だけ残して消える',
    tags: ['ゲーム', '継続', '成長'],
    status: 'seed',
  },
]
