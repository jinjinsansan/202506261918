/*
  # カウンセラーバイパス機能の追加

  1. 変更内容
    - メンテナンスモードでもカウンセラーがアクセスできるようにするためのフラグを追加
    - メンテナンス設定テーブルにカウンセラーバイパスフラグを追加

  2. 目的
    - カウンセラーがメンテナンスモード中でもシステムにアクセスできるようにする
    - 一般ユーザーはメンテナンス画面を表示するが、カウンセラーは通常通り操作可能にする
*/

-- メンテナンス設定テーブルの作成（存在しない場合）
CREATE TABLE IF NOT EXISTS maintenance_settings (
  id SERIAL PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT false,
  message TEXT DEFAULT 'システムメンテナンス中です。ご不便をおかけして申し訳ございません。',
  end_time TIMESTAMPTZ,
  type TEXT DEFAULT 'scheduled' CHECK (type IN ('scheduled', 'emergency', 'completed')),
  progress INTEGER,
  estimated_duration TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  counselor_bypass BOOLEAN DEFAULT true
);

-- カウンセラーバイパスフラグを追加（既存テーブルの場合）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'maintenance_settings') THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'maintenance_settings' AND column_name = 'counselor_bypass'
    ) THEN
      ALTER TABLE maintenance_settings ADD COLUMN counselor_bypass BOOLEAN DEFAULT true;
    END IF;
  END IF;
END $$;

-- コメント
COMMENT ON TABLE maintenance_settings IS 'メンテナンスモードの設定を管理するテーブル';
COMMENT ON COLUMN maintenance_settings.counselor_bypass IS 'カウンセラーがメンテナンスモードをバイパスできるかどうか';

-- RLSポリシー
ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;

-- カウンセラーのみが設定を変更できるポリシー
CREATE POLICY IF NOT EXISTS "Counselors can manage maintenance settings"
  ON maintenance_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM counselors 
      WHERE email = auth.email() AND is_active = true
    )
  );

-- 全員が設定を読み取れるポリシー
CREATE POLICY IF NOT EXISTS "Everyone can read maintenance settings"
  ON maintenance_settings
  FOR SELECT
  TO authenticated
  USING (true);