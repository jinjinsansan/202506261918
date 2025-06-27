# かんじょうにっき - 復元プロンプト

## 🎯 このプロンプトの使用方法
このプロンプトを新しいBoltチャットで使用することで、かんじょうにっきプロジェクトを完全な状態で復元できます。

---

## 📋 プロジェクト復元指示

以下の内容で「かんじょうにっき」プロジェクトを復元してください：

### 🚀 基本情報
- **プロジェクト名**: かんじょうにっき（感情日記アプリ）
- **開発者**: 一般社団法人NAMIDAサポート協会
- **技術スタック**: React + TypeScript + Vite + Tailwind CSS + Supabase
- **最終更新**: 2025年1月25日
- **デプロイURL**: https://apl.namisapo2.love

### ⚠️ 重要な制約事項（必須遵守）
```
# Bolt への指示
- pages ディレクトリ以外は変更しないこと
- Tailwind 設定ファイルに手を加えないこと
- 新しい依存パッケージはインストールしないこと
- supabase/migrations/ 内のファイルは変更しないこと
```

### 📦 必要な依存関係
```json
{
  "dependencies": {
    "@radix-ui/react-tabs": "^1.1.12",
    "@supabase/supabase-js": "^2.39.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2",
    "vitest": "^1.3.1"
  }
}
```

### 🔧 環境変数設定
`.env.example`ファイルを作成し、以下の内容を設定：
```env
# Supabase設定
VITE_SUPABASE_URL=https://afojjlfuwglzukzinpzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2pqbGZ1d2dsenVremlucHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDc4MzEsImV4cCI6MjA2NjE4MzgzMX0.ovSwuxvBL5gHtW4XdDkipz9QxWL_njAkr7VQgy1uVRY

# メンテナンスモード設定（オプション）
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_MESSAGE=システムメンテナンス中です
VITE_MAINTENANCE_END_TIME=2025-01-22T10:00:00Z
```

## 🌟 実装済み機能一覧

### ✅ ユーザー向け機能
1. **感情日記システム**
   - 8種類のネガティブ感情（恐怖、悲しみ、怒り、悔しい、無価値感、罪悪感、寂しさ、恥ずかしさ）
   - 出来事と気づきの記録
   - 無価値感選択時の自己肯定感・無価値感スコア入力
   - 日記の作成・編集・削除機能

2. **無価値感推移グラフ**
   - 自己肯定感と無価値感の推移をグラフで可視化
   - 期間フィルター（1週間・1ヶ月・全期間）
   - SNSシェア機能（通常シェア、X/Twitterシェア）
   - 感情の出現頻度表示

3. **高度な検索機能**
   - キーワード検索（出来事・気づき）
   - 感情別フィルター
   - 日付範囲検索
   - 直近5日分の日記表示

4. **カウンセラーコメント表示**
   - カウンセラーからのフィードバック表示
   - カウンセラー名の表示
   - 検索画面でのコメント表示

5. **データバックアップ・復元**
   - ローカルデータのJSONバックアップ
   - バックアップファイルからの復元
   - 端末変更時のデータ移行サポート

6. **シェア機能強化**
   - 日記内容のプレビュー表示
   - 感情に対応する絵文字の追加
   - X/Twitterへの直接シェア機能
   - プライバシーに配慮した内容表示

7. **レスポンシブデザイン**
   - 全デバイス対応（PC・タブレット・スマートフォン）
   - 日本語フォント最適化（Noto Sans JP）

### ✅ 管理者向け機能
1. **カウンセラー管理画面**
   - 日記一覧・詳細表示
   - 高度な検索・フィルター機能
   - カレンダー検索機能
   - カウンセラーメモ機能
   - 担当者割り当て機能
   - 緊急度管理（高・中・低）
   - 統計ダッシュボード

2. **カウンセラーコメント機能**
   - ユーザーに表示/非表示の切り替え
   - カウンセラー名の表示
   - メモ編集機能

3. **カウンセラー管理**
   - カウンセラーアカウント管理
   - 担当案件表示
   - 統計情報表示

4. **メンテナンスモード**
   - システム保守時の適切な案内
   - 進捗表示機能
   - 環境変数による制御
   - カウンセラーバイパス機能

5. **テストデータクリーンアップ**
   - 自動生成されたテストデータの検出
   - ローカルストレージとSupabaseからの削除
   - 実際のユーザーデータは保持

### 🆕 新機能（2025年1月25日実装）
1. **自動同期システム**
   - アプリ起動時の自動ユーザー作成・確認
   - 5分間隔でのローカルデータ自動同期
   - 手動同期オプション
   - エラーハンドリングと状態表示

2. **同意履歴管理**
   - プライバシーポリシー同意の完全追跡
   - 法的要件に対応した履歴保存
   - CSV出力機能
   - 管理画面での一覧・検索機能

3. **デバイス認証システム**
   - デバイスフィンガープリント生成・照合
   - PIN番号認証（6桁）
   - 秘密の質問による復旧機能
   - アカウントロック機能（5回失敗で24時間ロック）
   - セキュリティイベントログ
   - デバイス認証管理画面
   - セキュリティダッシュボード

4. **データバックアップ・復元機能**
   - ローカルデータのJSONバックアップ
   - バックアップファイルからの復元
   - 端末変更時のデータ移行サポート

5. **シェア機能強化**
   - 日記内容のプレビュー表示
   - 感情に対応する絵文字の追加
   - X/Twitterへの直接シェア機能
   - プライバシーに配慮した内容表示

6. **テストデータクリーンアップ機能**
   - 自動生成されたテストデータの検出
   - ローカルストレージとSupabaseからの削除
   - 実際のユーザーデータは保持

## 🗄️ データベース構成

### Supabaseテーブル
1. **users**: ユーザー情報
   - id (uuid, primary key)
   - line_username (text, unique)
   - created_at (timestamp)

2. **diary_entries**: 日記エントリー
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - date (date)
   - emotion (text)
   - event (text)
   - realization (text)
   - self_esteem_score (integer)
   - worthlessness_score (integer)
   - created_at (timestamp)
   - counselor_memo (text)
   - is_visible_to_user (boolean)
   - counselor_name (text)

3. **counselors**: カウンセラー情報
   - id (uuid, primary key)
   - name (text)
   - email (text, unique)
   - is_active (boolean)
   - created_at (timestamp)

4. **chat_rooms**: チャットルーム
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - counselor_id (uuid, foreign key)
   - status (text)
   - created_at (timestamp)

5. **messages**: メッセージ
   - id (uuid, primary key)
   - chat_room_id (uuid, foreign key)
   - sender_id (uuid, foreign key)
   - counselor_id (uuid, foreign key)
   - content (text)
   - is_counselor (boolean)
   - created_at (timestamp)

6. **consent_histories**: 同意履歴
   - id (uuid, primary key)
   - line_username (text)
   - consent_given (boolean)
   - consent_date (timestamp)
   - ip_address (text)
   - user_agent (text)
   - created_at (timestamp)

7. **maintenance_settings**: メンテナンス設定
   - id (serial, primary key)
   - is_enabled (boolean)
   - message (text)
   - end_time (timestamp)
   - type (text)
   - progress (integer)
   - estimated_duration (text)
   - contact_info (text)
   - created_at (timestamp)
   - updated_at (timestamp)
   - counselor_bypass (boolean)

### データベースマイグレーション
`supabase/migrations/`ディレクトリ内のSQLファイルがすべてのテーブル作成とRLS設定を含みます。

## 👥 カウンセラーアカウント
以下のアカウントでカウンセラーログインが可能：

| 名前 | メールアドレス | パスワード |
|------|----------------|------------|
| 心理カウンセラー仁 | jin@namisapo.com | counselor123 |
| 心理カウンセラーAOI | aoi@namisapo.com | counselor123 |
| 心理カウンセラーあさみ | asami@namisapo.com | counselor123 |
| 心理カウンセラーSHU | shu@namisapo.com | counselor123 |
| 心理カウンセラーゆーちゃ | yucha@namisapo.com | counselor123 |
| 心理カウンセラーSammy | sammy@namisapo.com | counselor123 |

## 📁 重要なファイル構成

### 主要ファイル
```
src/
├── components/          # 共通コンポーネント
│   ├── AdminPanel.tsx   # 管理画面
│   ├── AutoSyncSettings.tsx # 自動同期設定UI
│   ├── ConsentHistoryManagement.tsx # 同意履歴管理UI
│   ├── DataBackupRecovery.tsx # データバックアップ・復元
│   ├── DataCleanup.tsx  # テストデータクリーンアップ
│   ├── DeviceAuthLogin.tsx # デバイス認証ログイン画面
│   ├── DeviceAuthRegistration.tsx # デバイス認証登録画面
│   ├── MaintenanceController.tsx # メンテナンスモード制御
│   ├── MaintenanceMode.tsx # メンテナンスモード表示
│   ├── PrivacyConsent.tsx # プライバシーポリシー同意
│   ├── ui/
│   │   └── tabs.tsx     # Radix UIベースのタブコンポーネント
├── pages/               # ページコンポーネント
│   ├── DiaryPage.tsx    # 日記作成ページ
│   ├── DiarySearchPage.tsx # 日記検索ページ
│   ├── EmotionTypes.tsx # 感情の種類ページ
│   ├── FirstSteps.tsx   # 最初にやることページ
│   ├── HowTo.tsx        # 使い方ページ
│   ├── NextSteps.tsx    # 次にやることページ
│   ├── PrivacyPolicy.tsx # プライバシーポリシーページ
│   └── Support.tsx      # サポートページ
├── lib/                 # ライブラリ
│   ├── supabase.ts      # Supabase設定
│   ├── deviceAuth.ts    # デバイス認証
│   ├── utils.ts         # ユーティリティ関数
│   └── cleanupTestData.ts # テストデータクリーンアップ
├── hooks/               # カスタムフック
│   ├── useSupabase.ts   # Supabase連携
│   ├── useAutoSync.ts   # 自動同期
│   └── useMaintenanceStatus.ts # メンテナンス状態
└── App.tsx              # メインアプリコンポーネント
```

## 🎯 重要な実装ポイント

### 1. テストデータクリーンアップ
- `cleanupTestData.ts`でテストデータを自動検出
- 管理画面の「クリーンアップ」タブから操作可能
- ローカルストレージとSupabaseの両方に対応

### 2. 自動同期システム
- `useAutoSync`フックが`App.tsx`で実装済み
- アプリ起動時に自動的にSupabaseユーザーが作成される
- 5分間隔で自動同期が実行される
- 手動での操作は基本的に不要

### 3. 同意履歴管理
- プライバシーポリシー同意時に自動的に履歴が記録される
- 管理画面の「カウンセラー」タブから履歴を確認可能
- CSV出力機能で法的要件に対応

### 4. デバイス認証システム
- 実装済みだが、現在は従来のユーザー名入力方式を使用
- 管理画面の「デバイス認証」と「セキュリティ」タブで機能確認可能
- PIN番号認証、秘密の質問、アカウントロック機能を含む

### 5. カウンセラーコメント機能
- カウンセラーメモをユーザーに表示する機能
- 管理画面でメモ入力時に「ユーザーに表示」チェックボックスで制御
- 表示時にはカウンセラー名も表示される
- ユーザーの日記検索画面でコメントが表示される

### 6. データバックアップ・復元機能
- ユーザーはデータ管理画面からバックアップを作成可能
- バックアップファイルからデータを復元可能
- 端末変更時のデータ移行に活用

### 7. シェア機能強化
- 日記内容のプレビュー表示
- 感情に対応する絵文字の追加
- X/Twitterへの直接シェア機能
- プライバシーに配慮した内容表示（最初の20文字のみ）

### 8. メンテナンスモードのカウンセラーバイパス
- メンテナンスモード中でもカウンセラーはアプリにアクセス可能
- メンテナンス画面からカウンセラーログインも可能
- 管理画面でメンテナンスモードの設定が可能

## 🚀 デプロイ設定

### Netlify設定
- **ビルドコマンド**: `npm run build`
- **公開ディレクトリ**: `dist`
- **リダイレクト**: `netlify.toml`で設定済み

### 必要なファイル
```
netlify.toml:
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 🔍 テストデータ
アプリには20日分のテストデータが自動生成される機能が実装されています。初回起動時に自動的に生成されます。
不要なテストデータは管理画面の「クリーンアップ」タブから削除できます。

## 📞 サポート情報
- **開発者**: 一般社団法人NAMIDAサポート協会
- **メール**: info@namisapo.com
- **受付時間**: 平日 9:00-17:00

---

## 🎯 復元後の確認事項

1. **環境確認**: `npm run dev`でローカル環境が正常に動作することを確認
2. **Supabase接続**: 環境変数を設定してSupabase接続を確認
3. **自動同期テスト**: 新しいユーザーでアプリを開いて自動同期をテスト
4. **機能テスト**: 日記作成、検索、管理画面の動作確認
5. **カウンセラーログイン**: 管理画面へのアクセス確認
6. **デバイス認証**: 管理画面の「デバイス認証」「セキュリティ」タブの確認
7. **カウンセラーコメント**: コメント表示機能の確認
8. **データバックアップ**: バックアップ作成と復元機能の確認
9. **シェア機能**: プレビュー表示とX/Twitterシェア機能の確認
10. **テストデータクリーンアップ**: 不要なテストデータの削除機能の確認
11. **メンテナンスモード**: カウンセラーバイパス機能の確認

このプロンプトを使用することで、かんじょうにっきプロジェクトを完全な状態で復元し、すべての機能が正常に動作する状態にできます。