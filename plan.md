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
- [ ] `backend/src/lib/hn-client.ts` に HN API クライアントを実装
- [ ] Zod でレスポンススキーマを定義し、外部データを必ず検証する
  ```
  トップ記事IDリスト: GET https://hacker-news.firebaseio.com/v0/topstories.json
  記事詳細:          GET https://hacker-news.firebaseio.com/v0/item/{id}.json
  ```
- [ ] トップ30件のIDを取得 → 各詳細を `Promise.all` で並列フェッチするロジックを実装

**BullMQ ジョブ**
- [ ] BullMQ をインストールし、`backend/src/lib/redis.ts` に Redis クライアントを実装
- [ ] `backend/src/jobs/fetch-news.job.ts` にニュース取得ジョブを実装
  - 取得した記事を PostgreSQL に upsert（`hn_id` をキーに重複排除）
- [ ] `backend/src/jobs/scheduler.ts` に Cron スケジューラーを実装（例：毎時0分）
- [ ] `bun run dev` でジョブが実行され、DBにデータが入ることを確認

---

#### Step 1-4: バックエンド API 実装

**ルート・サービス層**
- [ ] `backend/src/services/articles.service.ts` にビジネスロジックを実装
  - Redis にキャッシュがあればそれを返す（TTL: 5分）
  - なければ DB から取得してキャッシュに保存
- [ ] `backend/src/routes/articles.route.ts` に `GET /api/articles` エンドポイントを実装
  - `@hono/zod-validator` でクエリパラメータを検証（例: `?limit=30&page=1`）
  - Hono RPC 用の型をエクスポート

**OpenTelemetry**
- [ ] `@opentelemetry/sdk-node` をインストール
- [ ] `backend/src/lib/otel.ts` を作成し、アプリ起動前にトレースを初期化

**テスト**
- [ ] `articles.service.ts` の Vitest ユニットテストを作成
  - キャッシュヒット時・ミス時それぞれの挙動をテスト

---

#### Step 1-5: フロントエンド実装

**Hono RPC クライアント**
- [ ] `frontend/src/lib/api.ts` に Hono RPC クライアントをセットアップ
  - バックエンドの型を直接インポートして使う

**UI**
- [ ] `app/page.tsx` に Server Components でニュース一覧ページを実装
- [ ] Tailwind CSS でニュースカードを実装（タイトル・URL・スコア・投稿者・コメント数）
- [ ] ローディング中の表示（`loading.tsx`）とエラー時の表示（`error.tsx`）を実装

**E2E テスト**
- [ ] Playwright をインストール
- [ ] 「ニュースが30件表示される」基本シナリオのE2Eテストを作成

---

#### Step 1-6: Docker Compose 統合・ローカル動作確認

**Dockerfile 作成**
- [ ] `backend/Dockerfile` をマルチステージビルドで作成（builder → runner）
- [ ] `frontend/Dockerfile` をマルチステージビルドで作成

**Nginx 設定**
- [ ] `nginx/nginx.conf` を作成
  - `/api/*` → Hono（:8080）にプロキシ
  - それ以外 → Next.js（:3000）にプロキシ

**Prometheus / Grafana 設定**
- [ ] `monitoring/prometheus.yml` でスクレイプ対象（Hono・Next.js・Nginx）を設定
- [ ] `monitoring/grafana/` にダッシュボード設定を配置

**docker-compose.yml 完成**
- [ ] 全コンテナ（Next.js / Hono / PostgreSQL / Redis / Nginx / Prometheus / Grafana）を定義
- [ ] 各コンテナに `mem_limit` と `restart: always` を設定
- [ ] `docker compose up -d` で全コンテナ起動し、ブラウザでニュースが表示されることを確認
- [ ] Grafana（:3001）でメトリクスが取れていることを確認

---

#### Step 1-7: GitHub Actions CI/CD 構築

- [ ] `.github/workflows/ci.yml` を作成
  - PR 時にバックエンドの `bun test` とフロントエンドの `bun lint` を自動実行
- [ ] `.github/workflows/deploy.yml` を作成
  - `main` ブランチにマージされたら Docker イメージをビルドして GitHub Container Registry に push
  - ラズパイ3 で `docker compose pull && docker compose up -d` を実行してデプロイ

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
