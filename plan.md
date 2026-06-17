# 🚀 ラズパイ3から始める！モダンニュースサイト開発・進化計画（2台連結版）

## 🛠️ 技術スタック
- フロントエンド: Next.js (App Router), TypeScript, Tailwind CSS
- バックエンド: Hono, Bun
- ORM: Drizzle ORM
- バリデーション: Zod
- 型安全API: Hono RPC
- データベース: PostgreSQL
- キャッシュ / キュー: Redis + BullMQ
- テスト: Vitest（ユニット）, Playwright（E2E）
- 監視: Prometheus + Grafana, OpenTelemetry
- リモートトンネル: Cloudflare Tunnels
- インフラ（現在）: Docker Compose（ラズパイ3向け省エネ設定）
- インフラ（未来）: k3s（軽量Kubernetes）+ ミニPC

---

## 🗺️ 実行ロードマップ

### 【第1章】現状：ラズパイ3単体での運用（Docker Compose）

---

#### Step 1-1: プロジェクト骨格の構築

**バックエンド**
- [ ] `backend/` ディレクトリを作成し、`bun init` でプロジェクト初期化
- [ ] Hono をインストールし `GET /health` が `200 OK` を返す最小構成を確認
- [ ] `tsconfig.json` を設定（strict モード有効）
- [ ] Vitest をインストールし `bun test` が通る状態にする

**フロントエンド**
- [ ] `frontend/` ディレクトリに Next.js を初期化（App Router / TypeScript / Tailwind CSS）
- [ ] `bun dev` でデフォルト画面が表示されることを確認

**インフラ下準備**
- [ ] `docker-compose.yml` を作成し、PostgreSQL と Redis の2コンテナだけ起動できることを確認
- [ ] `psql` コマンドで PostgreSQL に接続できることを確認
- [ ] `redis-cli ping` で Redis が応答することを確認

---

#### Step 1-2: データベース設計・セットアップ

- [ ] Drizzle ORM と `drizzle-kit` をインストール
- [ ] `backend/src/db/schema.ts` に `articles` テーブルを定義
  ```
  id, hn_id（HN記事ID・ユニーク）, title, url, score, author, comment_count, fetched_at
  ```
- [ ] `drizzle.config.ts` を作成し、マイグレーションの出力先を `backend/src/db/migrations/` に設定
- [ ] `bun run db:generate` でマイグレーションファイルを生成
- [ ] `bun run db:migrate` でPostgreSQLにテーブルが作成されることを確認
- [ ] Drizzle 経由で `SELECT 1` が通ることを Vitest で確認

---

#### Step 1-3: Hacker News API 連携・バッチ実装

**APIクライアント**
- [x] `backend/src/lib/hn-client.ts` に HN API クライアントを実装
- [x] Zod でレスポンススキーマを定義し、外部データを必ず検証する
  ```
  トップ記事IDリスト: GET https://hacker-news.firebaseio.com/v0/topstories.json
  記事詳細:          GET https://hacker-news.firebaseio.com/v0/item/{id}.json
  ```
- [x] トップ30件のIDを取得 → 各詳細を `Promise.all` で並列フェッチするロジックを実装

**BullMQ ジョブ**
- [x] BullMQ をインストールし、`backend/src/lib/redis.ts` に Redis クライアントを実装
- [x] `backend/src/jobs/fetch-news.job.ts` にニュース取得ジョブを実装
  - 取得した記事を PostgreSQL に upsert（`hn_id` をキーに重複排除）
- [x] `backend/src/jobs/scheduler.ts` に Cron スケジューラーを実装（毎日 JST 0時）
- [x] `bun run dev` でジョブが実行され、DBにデータが入ることを確認

---

#### Step 1-4: バックエンド API 実装

**ルート・サービス層**
- [x] `backend/src/services/articles.service.ts` にビジネスロジックを実装
  - Redis にキャッシュがあればそれを返す（TTL: 5分）
  - なければ DB から取得してキャッシュに保存
- [x] `backend/src/routes/articles.route.ts` に `GET /api/articles` エンドポイントを実装
  - `@hono/zod-validator` でクエリパラメータを検証（`?limit=30&page=1`）
  - Hono RPC 用の型をエクスポート

**OpenTelemetry**
- [x] `@opentelemetry/sdk-node` をインストール
- [x] `backend/src/lib/otel.ts` を作成し、アプリ起動前にトレースを初期化

**テスト**
- [x] `articles.service.ts` の Vitest ユニットテストを作成
  - キャッシュヒット時・ミス時それぞれの挙動をテスト

**追加変更（設計見直し）**
- [x] バックエンド・PostgreSQL を JST に統一（`TZ=Asia/Tokyo` / `PGTZ=Asia/Tokyo`）
- [x] `findArticles` → `findTodayArticles` にリネーム（今日の記事のみ返すフィルター追加）
- [x] `findArticlesByDate(date, limit, offset)` を新規追加（YYYYMMDD 形式・ページネーション対応）
- [x] `getArticlesByDate(date, limit, page)` をサービス層に追加（Redis キャッシュ対応）
- [x] `GET /api/articles/:date?limit&page` ルートを追加（YYYYMMDD バリデーション付き）

---

#### Step 1-5: フロントエンド実装

**Hono RPC クライアント**
- [x] `frontend/lib/api.ts` に Hono RPC クライアントをセットアップ
  - バックエンドの型を直接インポートして使う

**UI**
- [x] `app/page.tsx` に Server Components でニュース一覧ページを実装
- [x] Tailwind CSS でニュースカードを実装（タイトル・URL・スコア・投稿者・コメント数）
- [x] ローディング中の表示（`loading.tsx`）とエラー時の表示（`error.tsx`）を実装

**E2E テスト**
- [x] Playwright をインストール
- [x] 基本シナリオの E2E テストを作成（タイトル表示・カード表示・スコア表示）

**追加変更**
- [x] `bullmqConnection` を `redis.ts` に追加（ioredis 型競合の解消）
- [x] `frontend/tsconfig.json` に `../backend/src/**/*.ts` を追加（Hono RPC 型参照用）

---

#### Step 1-6: Docker Compose 統合・ローカル動作確認

**Dockerfile 作成**
- [x] `backend/Dockerfile` をマルチステージビルドで作成（deps → runner）
- [x] `frontend/Dockerfile` をマルチステージビルドで作成（deps → builder → runner、コンテキスト = モノレポルート）

**Nginx 設定**
- [x] `nginx/nginx.conf` を作成
  - `/api/*` → Hono（:8080）にプロキシ
  - `/health`, `/metrics` → Hono にプロキシ
  - それ以外 → Next.js（:3000）にプロキシ

**Prometheus / Grafana 設定**
- [x] `monitoring/prometheus.yml` でスクレイプ対象（Hono バックエンド）を設定
- [x] `monitoring/grafana/provisioning/` にデータソース・ダッシュボード自動設定を配置
- [x] `monitoring/grafana/dashboards/backend.json` に HTTP リクエスト・メモリ・稼働時間パネルを作成

**バックエンド追加実装**
- [x] `prom-client` で `/metrics` エンドポイントを追加（HTTP カウンター・ヒストグラム・プロセスメトリクス）
- [x] `frontend/app/page.tsx` に `export const dynamic = 'force-dynamic'` を追加（ビルド時静的プリレンダリング無効化）

**docker-compose.yml 完成**
- [x] 全コンテナ（Next.js / Hono / PostgreSQL / Redis / Nginx / Prometheus / Grafana）を定義
- [x] 各コンテナに `mem_limit` と `restart: always` を設定
- [x] `docker compose build && docker compose up -d` で全コンテナ起動
- [x] `http://localhost:80` でニュースが表示されることを確認
- [x] Prometheus（:9090）で `hono-backend` が `up` であることを確認
- [x] Grafana（:3001）でデータソースが自動設定されていることを確認

---

#### Step 1-7: GitHub Actions CI/CD 構築

- [x] `.github/workflows/ci.yml` を作成
  - PR / push 時にバックエンドのテスト（Vitest）とフロントエンドの型チェック（tsc）を自動実行
  - PostgreSQL・Redis サービスコンテナを起動してマイグレーションも実行
- [x] `.github/workflows/deploy.yml` を作成
  - `main` ブランチにマージされたら Docker イメージをビルドして GHCR に push
  - amd64（Mac/サーバー）と arm64（ラズパイ3 64bit）のマルチプラットフォームビルド
- [x] `docker-compose.prod.yml` を作成（ラズパイ用オーバーライド）
  - `build:` を無効にして GHCR のイメージを使うよう設定

**ラズパイへのデプロイ手順（手動）：**
```bash
# ① GHCR にログイン（初回のみ）
docker login ghcr.io -u JunJon09 -p <GitHub Personal Access Token>

# ② 最新イメージを pull して再起動
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

#### Step 1-8: 記事詳細ページ・翻訳・語彙機能

**方針**
- 取得件数を5〜10件に絞り、テキスト記事のみを対象とする
- Jina AI Reader で本文を取得 → OpenAI で翻訳・語彙抽出 → DB に保存（1記事1日1回）
- 詳細ページ（`/articles/[id]`）にiframe埋め込み＋翻訳＋語彙を上下に並べる
- iframeがブロックされた場合は「元記事を開く」リンクにフォールバック

**バックエンド**
- [ ] `articles` テーブルに3カラム追加（マイグレーション）
  - `content TEXT` : Jinaで取得した英語原文（Markdown）
  - `content_ja TEXT` : OpenAIによる日本語翻訳
  - `keywords JSONB` : TOEIC700点超えの単語・イディオム一覧
- [ ] `backend/src/lib/jina-client.ts` を作成
  - `https://r.jina.ai/{url}` にGETリクエストしてMarkdownを返す関数
- [ ] `backend/src/lib/openai-client.ts` を作成
  - OpenAI APIクライアントの初期化
  - 英語テキストを受け取り、日本語翻訳とTOEIC700点超えの単語一覧をJSON形式で返す関数
- [ ] `fetch-news.job.ts` を修正
  - 取得件数を5〜10件に変更
  - 除外ドメインリストを定義（twitter.com / x.com / github.com / youtube.com / apps.apple.com / play.google.com / reddit.com）
  - 記事保存後にJina → OpenAIの順で処理してDBに保存
- [ ] `backend/src/db/articles.repository.ts` に単一記事取得関数を追加
- [ ] `GET /api/articles/:id` エンドポイントを追加（`articles.route.ts`）

**フロントエンド**
- [ ] TOPページのリンク先を外部URLから `/articles/[id]` に変更
- [ ] `frontend/app/articles/[id]/page.tsx` を新規作成
  - 上段：iframe（`src` に元記事URL）＋エラー時は「元記事を開く →」リンクを表示
  - 中段：日本語翻訳（`content_ja`）
  - 下段：難しい単語一覧（`keywords`）

---

### 【第2章】未来：ミニPC購入後の「2台連結Kubernetes」フェーズ

#### Step 2-1: 2台を繋いだ k3s クラスターの構築
- [ ] ミニPCに k3s の「Server（マスター）」をインストール
- [ ] ラズパイ3を「Agent（ワーカー）」として k3s クラスターに参加させる
- [ ] `kubectl get nodes` で2台が `Ready` 状態であることを確認

#### Step 2-2: 役割を決めてデプロイ（ノードアフィニティの設定）
- [ ] 各 Deployment の YAML に `nodeSelector` を設定
  - ミニPC: Next.js / Hono / PostgreSQL / Redis / Nginx / Prometheus / Grafana
  - ラズパイ3: ニュース取得（Kubernetes CronJob）
- [ ] `kubectl apply -f k8s/` で2台に自動振り分けされて起動することを確認

#### Step 2-3: 2台を束ねて Cloudflare Tunnel 外部公開
- [ ] ミニPC側で cloudflared を Kubernetes Deployment として起動
- [ ] Cloudflare Dashboard でトンネルが接続中になることを確認
- [ ] スマホの4G回線から独自ドメインでアクセスし、ニュースが表示されることを確認
- [ ] 翌朝、ラズパイ3の CronJob が動いてミニPCの DB にニュースが溜まっていることを確認 🎉
