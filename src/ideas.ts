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
  {
    id: 'hold-charge',
    title: '長押しチャージショット',
    motion: '押すほどぐぐっと潰れて力がたまり、満タンで武者震い。離すとためた分だけ星が飛ぶ',
    tags: ['ゲーム', 'モバイル', '長押し'],
    status: 'captured',
    specimenId: 'charge',
  },
  {
    id: 'virtual-joystick',
    title: 'バーチャルパッド',
    motion: 'ノブが指に吸い付いて倒れ、倒した分だけキャラが歩く。離すとばねで中央へ跳ね戻る',
    tags: ['ゲーム', 'モバイル', 'ドラッグ'],
    status: 'captured',
    specimenId: 'joystick',
  },
  {
    id: 'slingshot',
    title: '引っぱり発射',
    motion: '引くほど発射方向のドットが濃く伸び、離すと逆向きへ勢いよく飛ぶ。命中でぐしゃっ',
    tags: ['ゲーム', 'モバイル', 'ドラッグ'],
    status: 'captured',
    specimenId: 'sling',
  },
  {
    id: 'swipe-judge',
    title: 'フリック仕分けカード',
    motion: '指に付いて傾き、スタンプがにじみ出て判定を予告。しきい値を越えると回転して飛んでいく',
    tags: ['ゲーム', 'モバイル', 'スワイプ'],
    status: 'captured',
    specimenId: 'flick',
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
    tags: ['ゲーム', '報酬', 'じらし', 'モバイル'],
    status: 'captured',
    specimenId: 'wheel',
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
    tags: ['ゲーム', 'ドラッグ', 'インベントリ', 'モバイル'],
    status: 'captured',
    specimenId: 'snap',
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
    motion:
      '条件が灯るたび掛け金が3分の1ずつ持ち上がり、最後の1つで錠が跳ねて外れて落ちる。扉はそれを見届けてから開き、中身がぽんと登場する',
    tags: ['ゲーム', '祝福', '解放', '条件'],
    status: 'captured',
    specimenId: 'unlock-door',
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
    motion:
      '達成した目標がチェック付きで上へ抜け、次の目標が下からせり上がって入れ替わる。着地してから進捗バーがゼロから伸びる',
    tags: ['ゲーム', 'タスク', 'リスト'],
    status: 'captured',
    specimenId: 'quest-tracker-slide',
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

  /* ---------- モバイル操作（指のジェスチャー）の種 ---------- */
  {
    id: 'pinch-map',
    title: 'ピンチでマップ拡縮',
    motion: '2本指で地図がゴムのように伸び縮みし、指を離すとグリッドへぱちんと吸い付く',
    tags: ['ゲーム', 'モバイル', 'ピンチ'],
    status: 'seed',
  },
  {
    id: 'pull-reload',
    title: '引っぱりリロード',
    motion: '弾倉を下へ引いて離すと、ばねが戻ってじゃきんと装填。引きの深さで戻りの勢いが変わる',
    tags: ['ゲーム', 'モバイル', 'スワイプ'],
    status: 'seed',
  },
  {
    id: 'rhythm-ring',
    title: 'リズムタップの判定リング',
    motion: '縮んでくる輪に合わせてタップ。ぴったりならPERFECTが弾け、ズレると輪がくしゃっと歪む',
    tags: ['ゲーム', 'モバイル', 'タップ'],
    status: 'seed',
  },
  {
    id: 'aim-cone',
    title: 'スキルのドラッグ照準',
    motion: '押した指から扇形の照準がにゅっと伸び、離すと範囲が一瞬光って発動する',
    tags: ['ゲーム', 'モバイル', 'ドラッグ'],
    status: 'seed',
  },
  {
    id: 'edge-dodge',
    title: 'フリック回避の残像',
    motion: '左右フリックでキャラが残像を残してステップ。連続で決めるほど残像が濃く尾を引く',
    tags: ['ゲーム', 'モバイル', 'フリック'],
    status: 'seed',
  },
  {
    id: 'gyro-parallax',
    title: '傾き視差のレアカード',
    motion: 'ドラッグや端末の傾きで絵柄と箔が別速度で滑り、奥行きがきらりと覗く',
    tags: ['ゲーム', 'モバイル', '3D'],
    status: 'seed',
  },

  /* ---------- カードスタック（Amicro採取）の種 ----------
     数値の設計図は skills リポジトリの creative/card-micro-interactions を参照。
     基本バネは stiffness180/damping20/mass0.8 ≒ transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) */
  {
    id: 'card-fan-arc',
    title: '扇に開くカード束',
    motion: '重なった5枚がホバーで底辺を支点にしゃらっと扇状に開く（端±30°/±70px）。端は+10px沈み中央は-10px浮いて弧を描き、中央だけ1.05倍で主役になる',
    tags: ['汎用', 'カード', 'ホバー'],
    status: 'captured',
    specimenId: 'card-fan-arc',
  },
  {
    id: 'card-scatter-deal',
    title: '手札ディールの散らばり',
    motion: 'ホバーで5枚がぱらっと不揃いに散らばる。均等計算でなく1枚ずつ手置きのオフセット（中央も+2°だけ崩す）が「人が並べた感」を伝える',
    tags: ['汎用', 'カード', 'ホバー'],
    status: 'captured',
    specimenId: 'card-scatter-deal',
  },
  {
    id: 'card-cascade-rise',
    title: '階段にせり上がるカード',
    motion: '待機中も2pxずつズレて束感を仕込み、ホバーで1枚ごとに-28pxずつ階段状にすっとせり上がる（+6°ずつ傾く）。少し重めのバネで紙の質量を伝える',
    tags: ['汎用', 'カード', 'ホバー'],
    status: 'captured',
    specimenId: 'card-cascade-rise',
  },
  {
    id: 'card-cover-flow',
    title: 'CSSカバーフロー',
    motion: '選択カードが正面を向き、左右はrotateY±38°で奥へ畳まれる。送ると跳ねずにすっと入れ替わり、タイトルだけ一拍遅れてふわり',
    tags: ['汎用', 'カード', '3D'],
    status: 'captured',
    specimenId: 'card-cover-flow',
  },
  {
    id: 'card-time-machine',
    title: 'タイムマシンの奥行きスクラブ',
    motion: '目盛りを撫でるとカードが奥からせり出し、通過した1枚は手前へ1.3倍に飛び抜けて消える。目盛り自体もscaleXでにゅっと伸びて応える',
    tags: ['汎用', 'カード', '3D', 'スクラブ'],
    status: 'captured',
    specimenId: 'card-time-machine',
  },

  /* ---------- アナリティクスのグラフ表現の種 ----------
     掛け算レシピ：グラフの部品（棒・線・円弧・点・セル・帯・針・数字）
     × 動きの性格（にょきにょき・ひと筆書き・鼓動・波打つ・滴る・磁力）
     × ダッシュボードの感情（達成の祝福・異常のドキッ・比較のワクワク・待ち時間のそわそわ） */
  {
    id: 'bar-sprout',
    title: '棒グラフの発芽',
    motion: '棒が左から60msずつ時間差でにょきにょき伸び、行き過ぎてぷるんと戻る。最大値の棒だけ一拍遅れて登場し、てっぺんで数字がぽんと咲く',
    tags: ['アナリティクス', 'グラフ', '登場'],
    status: 'captured',
    specimenId: 'bar-sprout',
  },
  {
    id: 'line-ink-draw',
    title: '折れ線のひと筆書き',
    motion: '線が左からするすると描かれ、先端の点がペン先のように光る。通過したデータ点があとから順にぽつぽつ灯り、最後にエリアの薄塗りがじわっと満ちる',
    tags: ['アナリティクス', 'グラフ', '登場'],
    status: 'captured',
    specimenId: 'line-ink-draw',
  },
  {
    id: 'donut-pour',
    title: 'ドーナツグラフの注ぎ込み',
    motion: '円弧が12時からしゅるっと伸びてセグメントが時間差で継ぎ足され、中央の%数字が弧を追いかけてカウントアップ。最後のひと欠けはゆっくり閉じてタメを作る',
    tags: ['アナリティクス', 'グラフ', '数値', 'じらし'],
    status: 'captured',
    specimenId: 'donut-pour',
  },
  {
    id: 'gauge-overshoot',
    title: 'メーター針の勢い余り',
    motion: '針がぶんっと目標値を通り過ぎ、ゆらゆらと減衰しながら止まる。振れ幅が「勢いよく届いた」ことの誇張になる。危険域に入ると針の根元が赤く鼓動',
    tags: ['アナリティクス', 'ゲージ', '緩急'],
    status: 'captured',
    specimenId: 'gauge-overshoot',
  },
  {
    id: 'kpi-landing',
    title: 'KPI数字の着地',
    motion: '数字が最初は桁ごとに高速で回り、後半ぐっと減速して着地、最後にぷるんとひと揺れ。前期比バッジは着地の余韻でぴょこんと跳ねて出る',
    tags: ['アナリティクス', '数値', '緩急'],
    status: 'captured',
    specimenId: 'kpi-landing',
  },
  {
    id: 'goal-ring-burst',
    title: '目標達成リングの臨界',
    motion: '進捗リングが100%で閉じた瞬間、continueの輪がぱっと外へ放たれ、チェックがひと筆書きで描かれる。99%まではわざとゆっくり閉じてじらす',
    tags: ['アナリティクス', 'ゲージ', '祝福'],
    status: 'captured',
    specimenId: 'goal-ring-burst',
  },
  {
    id: 'scatter-popcorn',
    title: '散布図のポップコーン',
    motion: '点が原点側からぽんぽんと弾けて着地し、密集クラスターは連鎖して咲く。外れ値だけ最後に大きく跳ねて登場し「こいつを見ろ」と主張する',
    tags: ['アナリティクス', 'グラフ', '登場'],
    status: 'captured',
    specimenId: 'scatter-popcorn',
  },
  {
    id: 'heatmap-conduction',
    title: 'ヒートマップの熱伝導',
    motion: '最大値のセルからじわじわと色が伝播して全体が温まる。いちばん熱いセルはゆっくり鼓動し続けて視線を集める',
    tags: ['アナリティクス', 'グラフ', '誘導'],
    status: 'captured',
    specimenId: 'heatmap-conduction',
  },
  {
    id: 'sparkline-ecg',
    title: 'スパークラインの心電図',
    motion: 'ミニ折れ線が右から左へ流れ続け、異常値が来ると波形がピクッと跳ねて一瞬光る。正常時は静かな呼吸のリズム',
    tags: ['アナリティクス', 'グラフ', 'リアルタイム'],
    status: 'captured',
    specimenId: 'sparkline-ecg',
  },
  {
    id: 'bar-race-overtake',
    title: 'バーチャートレースの追い抜き',
    motion: '棒が抜きつ抜かれつ伸び、順位交代の瞬間に行がすっと滑って入れ替わる。抜いた棒は一瞬光り、抜かれた棒は少し沈んで席を譲る',
    tags: ['アナリティクス', 'グラフ', 'ランキング'],
    status: 'seed',
  },
  {
    id: 'funnel-drip',
    title: 'ファネルの滴り',
    motion: '各段から次の段へ数字の粒がぽたぽたと落ちて注がれ、離脱分は横へ霧のように散って消える。どこで漏れているかが水の流れで分かる',
    tags: ['アナリティクス', 'グラフ', 'フロー'],
    status: 'captured',
    specimenId: 'funnel-drip',
  },
  {
    id: 'sankey-stream',
    title: 'サンキーの水流',
    motion: '帯の中を光の粒がさらさらと流れ続ける。ホバーした流路だけ流速が上がって明るくなり、他はすっと薄まる',
    tags: ['アナリティクス', 'グラフ', 'フロー', 'ホバー'],
    status: 'seed',
  },
  {
    id: 'area-tide',
    title: 'エリアチャートの満ち引き',
    motion: '面が水のように下から満ち、ホバー位置の水面がたぷんと揺れて値を教える。期間切替では水位がざばっと入れ替わる',
    tags: ['アナリティクス', 'グラフ', 'ホバー'],
    status: 'captured',
    specimenId: 'area-tide',
  },
  {
    id: 'radar-morph',
    title: 'レーダーチャートの変身',
    motion: '期間を切り替えると多角形がぐにゃりとモーフィングし、伸びた軸の頂点だけきらっと光る。縮んだ軸は名残の残像が薄く残る',
    tags: ['アナリティクス', 'グラフ', '比較'],
    status: 'captured',
    specimenId: 'radar-morph',
  },
  {
    id: 'treemap-crack',
    title: 'ツリーマップの分裂',
    motion: '大きなタイルがぱきっ、ぱきっと順に割れて子タイルが生まれる。クリックでそのタイルがぐんと画面いっぱいにズームし、中でまた分裂が始まる',
    tags: ['アナリティクス', 'グラフ', 'ドリルダウン'],
    status: 'seed',
  },
  {
    id: 'calendar-streak-glow',
    title: '草カレンダーの連続点灯',
    motion: '貢献セルが日付順にぽつぽつと灯り、連続している区間はひとつながりに光が走る。最長ストリークの端で光が折り返して往復する',
    tags: ['アナリティクス', 'グラフ', '継続'],
    status: 'seed',
  },
  {
    id: 'candle-breath',
    title: 'ローソク足の呼吸',
    motion: '最新の足だけリアルタイムに伸び縮みして呼吸し、確定の瞬間にこちっと固まって次の足が生まれる。急変時は呼吸が荒くなる',
    tags: ['アナリティクス', 'グラフ', 'リアルタイム'],
    status: 'seed',
  },
  {
    id: 'diff-arrow-mood',
    title: '前週比矢印の感情',
    motion:
      '上向き矢印はぴょこんと跳ねて濃くなり、下向きは跳ね返さずぽとりと沈んでしぼむ。横ばいはゆらゆら迷ってから水平に落ち着く',
    tags: ['アナリティクス', '数値', '比較'],
    status: 'captured',
    specimenId: 'diff-arrow-mood',
  },
  {
    id: 'threshold-alarm',
    title: 'しきい値越えのドキッ',
    motion:
      '折れ線がしきい値線を越えた瞬間、越えた区間だけ太く濃く持ち上がって明滅し、しきい値線自体がびりっと震える。戻ると色がすっと引いて安堵',
    tags: ['アナリティクス', 'グラフ', '警告', '緊張感'],
    status: 'captured',
    specimenId: 'threshold-alarm',
  },
  {
    id: 'tooltip-magnet-dot',
    title: 'データ点の磁力ツールチップ',
    motion: 'カーソルに最寄りのデータ点が磁石のように吸い付いてぷるんと膨らみ、ツールチップがばねで追従する。点から点へはしゅっと乗り移る',
    tags: ['アナリティクス', 'グラフ', 'ホバー', '磁力'],
    status: 'seed',
  },
  {
    id: 'pie-pull-out',
    title: '円グラフの切り分け',
    motion: 'ホバーしたピースがケーキサーバーで取るようにすっと外へ抜け出し、影が付いて主役になる。戻るときはぷるんと吸い付いて収まる',
    tags: ['アナリティクス', 'グラフ', 'ホバー'],
    status: 'seed',
  },
  {
    id: 'skeleton-to-real',
    title: 'データ待ちの衣替え',
    motion: 'ロード中は灰色の棒がゆらゆら揺れて待ち、データ到着で本物の棒が下からしゅっと差し替わる。プレースホルダは煙のようにふっと消える',
    tags: ['アナリティクス', 'ローディング', '待ち時間'],
    status: 'seed',
  },
  {
    id: 'stack-reorder-weight',
    title: '積み上げ棒の並び替え',
    motion: 'ソートすると棒たちが重さを持ってどさどさと入れ替わり、着地でわずかに潰れて戻る。移動距離が長い棒ほど大きく弧を描いて飛ぶ',
    tags: ['アナリティクス', 'グラフ', 'ソート'],
    status: 'seed',
  },
  {
    id: 'annotation-stamp',
    title: '注釈ピンの打刻',
    motion: 'グラフ上の出来事ポイントにピンがドンと落ちて波紋が広がり、ラベルが一拍遅れてひらっと開く。リリース日などの文脈が「事件」として刻まれる',
    tags: ['アナリティクス', 'グラフ', '注釈'],
    status: 'captured',
    specimenId: 'annotation-stamp',
  },

  /* ---------- 経営シミュレーションから採取した種 ----------
     ゲーム(RUNWAY 78)側のUIを部品単位で数え、「必要としているのに図鑑に無い動き」
     として洗い出したもの。共通するのは、ゲームの派手な報酬演出でも汎用UIの
     ぷるんでもなく、「数字が意味を持つ画面」で緩急を作るための語彙という点。 */
  {
    id: 'cash-bridge',
    title: '収支の橋',
    motion:
      '期首の柱の肩から次の柱へ線が架かり、渡った先で内訳が生える。増えた分は上へ伸び、減った分は肩からぶら下がる。期末だけ床から立て直して、とんと着地する',
    tags: ['アナリティクス', 'グラフ', '因果', '財務'],
    status: 'captured',
    specimenId: 'cash-bridge',
  },
  {
    id: 'share-dilute',
    title: '持ち分の希薄化',
    motion:
      '総量の変わらない帯に新しい層が幅ゼロの楔で割り込み、既存の層が行き過ぎて縮んでから少し押し返す。痩せる前の境界が破線で一拍だけ残る',
    tags: ['アナリティクス', 'グラフ', '構成比', 'ゼロサム'],
    status: 'captured',
    specimenId: 'share-dilute',
  },
  {
    id: 'pending-commit',
    title: '予約と一斉確定',
    motion:
      '選んだ札が破線のまま浮いて浅く呼吸し、確定すると選んだ順に押印が降りて実線になる。最後の押印のあと、束がひとつに締まる',
    tags: ['入力', 'カード', '確定', 'バッチ'],
    status: 'captured',
    specimenId: 'pending-commit',
  },
  {
    id: 'allocation-seesaw',
    title: '総量固定の配分',
    motion:
      '片方を増やすと必ず他方が減る。譲る側だけたわんでから引き下がり、総量バーは伸びずに光がひとつ横切る。取れる先が無いときは首を横に振る',
    tags: ['入力', '配分', 'ゼロサム'],
    status: 'captured',
    specimenId: 'allocation-seesaw',
  },
  {
    id: 'news-preview-effect',
    title: '予告と発効',
    motion:
      '見出しだけが薄い紙で先に貼られ、待っているあいだ端がかすかに揺れる。発効の週に濃度が入って本文が確定し、紙がぴたりと止まる',
    tags: ['ゲーム', '予告', '待ち時間', '通知'],
    status: 'sprout',
  },
  {
    id: 'confirmed-vs-paper',
    title: '確定と含みの二層',
    motion:
      '同じ数字を実線の土台と点線の上乗せに割る。含み分だけがゆらゆら呼吸し、確定した瞬間に点線が実線へ落ちて固まる',
    tags: ['アナリティクス', '数値', '確度'],
    status: 'sprout',
  },
  {
    id: 'runway-sandglass',
    title: '残りの砂',
    motion:
      '砂が落ちる速さが収支の悪さに比例する。黒字なら止まり、赤字が深いほど落ちが速まる。ひっくり返せない砂時計',
    tags: ['ゲーム', '待ち時間', '緊張感', '資源'],
    status: 'seed',
  },
  {
    id: 'causal-relay',
    title: '因果のリレー',
    motion:
      '原因の区画が押し込まれると、その原因が動かした結果の帯だけが±0から一斉に伸びる。伸び切ってから次の原因へ渡り、同時に起きた出来事に読む順番を与える',
    tags: ['アナリティクス', 'グラフ', '因果'],
    status: 'captured',
    specimenId: 'causal-relay',
  },
  {
    id: 'line-measure',
    title: '数値行の物差し',
    motion:
      '数字の行に、その数字だけの物差しが敷かれる。いまの値まで満ちてから、今週動いたぶんが継ぎ足しで灯る。減った週は失う前の位置に斜線が残ってから薄れる',
    tags: ['アナリティクス', 'ゲージ', '数値', '増減'],
    status: 'captured',
    specimenId: 'line-measure',
  },
  {
    id: 'paper-press',
    title: '紙の押し込み',
    motion:
      '回転も拡大もせず、1px沈んで0.985倍に締まるだけ。跳ね返さず、離すと紙の繊維が戻るようにゆっくり浮く',
    tags: ['入力', 'ボタン', '静かな演出'],
    status: 'seed',
  },
  {
    id: 'compound-snowball',
    title: '複利の雪だるま',
    motion:
      '同じ操作でも回を追うごとに増分の厚みが増していく。転がるほど加速し、止めた瞬間に自重でわずかに沈む',
    tags: ['アナリティクス', '成長', '数値'],
    status: 'seed',
  },
  {
    id: 'probability-band',
    title: '確率の帯',
    motion:
      '成功率のバーが左右に振れてから目盛りに落ち着く。振れ幅が大きいほど不確かで、賭ける前に「どのくらい危ういか」が手に伝わる',
    tags: ['ゲーム', '確率', '緊張感'],
    status: 'seed',
  },
]
