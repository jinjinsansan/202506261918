import React, { useState } from 'react';
import { Shield, Eye, Lock, Database, AlertTriangle, Users, Clock, MessageCircle, Upload, RefreshCw } from 'lucide-react';
import { logSecurityEvent } from '../lib/deviceAuth';

interface PrivacyConsentProps {
  onConsent: (accepted: boolean) => void;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onConsent }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecked) {
      onConsent(true);
    }
  };

  const handleReject = () => {
    // 拒否履歴を記録
    const consentRecord = {
      id: Date.now().toString(), 
      line_username: 'declined_user_' + Date.now(), 
      consent_given: false, 
      consent_date: new Date().toISOString(), 
      ip_address: 'unknown', 
      user_agent: navigator.userAgent 
    };
    
    // ローカルストレージに保存
    const existingHistories = localStorage.getItem('consent_histories');
    const histories = existingHistories ? JSON.parse(existingHistories) : [];
    histories.push(consentRecord);
    localStorage.setItem('consent_histories', JSON.stringify(histories));

    // セキュリティイベントをログ
    logSecurityEvent('privacy_consent_rejected', consentRecord.line_username, 'プライバシーポリシーを拒否');
    
    onConsent(false);
  };

  // バックアップファイルの選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBackupFile(e.target.files[0]);
      setRestoreStatus(null);
    }
  };

  // バックアップからの復元
  const handleRestoreBackup = async () => {
    if (!backupFile) {
      setRestoreStatus('バックアップファイルを選択してください。');
      return;
    }
    
    setRestoring(true);
    setRestoreStatus('復元中...');
    
    try {
      // ファイルを読み込み
      const fileReader = new FileReader();
      
      fileReader.onload = (event) => {
        try {
          if (!event.target || typeof event.target.result !== 'string') {
            throw new Error('ファイルの読み込みに失敗しました。');
          }
          
          const backupObject = JSON.parse(event.target.result);
          
          // バージョンチェック
          if (!backupObject.version) {
            throw new Error('無効なバックアップファイルです。');
          }
          
          // データの復元
          if (backupObject.journalEntries) {
            localStorage.setItem('journalEntries', JSON.stringify(backupObject.journalEntries));
          }
          
          if (backupObject.initialScores) {
            localStorage.setItem('initialScores', JSON.stringify(backupObject.initialScores));
          }
          
          if (backupObject.consentHistories) {
            localStorage.setItem('consent_histories', JSON.stringify(backupObject.consentHistories));
          }
          
          if (backupObject.lineUsername) {
            localStorage.setItem('line-username', backupObject.lineUsername);
          }
          
          if (backupObject.privacyConsentGiven) {
            localStorage.setItem('privacyConsentGiven', backupObject.privacyConsentGiven);
          }
          
          if (backupObject.privacyConsentDate) {
            localStorage.setItem('privacyConsentDate', backupObject.privacyConsentDate);
          }
          
          setRestoreStatus('データが正常に復元されました！プライバシーポリシーに同意して続行してください。');
          
        } catch (error) {
          console.error('データ復元エラー:', error);
          setRestoreStatus('データの復元に失敗しました。有効なバックアップファイルか確認してください。');
        } finally {
          setRestoring(false);
        }
      };
      
      fileReader.onerror = () => {
        setRestoreStatus('ファイルの読み込みに失敗しました。');
        setRestoring(false);
      };
      
      fileReader.readAsText(backupFile);
      
    } catch (error) {
      console.error('バックアップ復元エラー:', error);
      setRestoreStatus('バックアップの復元に失敗しました。');
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">
            プライバシーに関する重要なお知らせ
          </h1>
          <p className="text-gray-600 font-jp-normal">
            本サービス「かんじょうにっき」では、次の情報を取得し、下記の目的で利用します。
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Database className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 取得する情報</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>・LINEユーザー識別子（userId）</p>
                  <p>・あなたが投稿する「感情日記」の本文（精神・心理状態を含む要配慮個人情報）</p>
                  <p>・投稿日時・端末等の利用メタデータ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 利用目的</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>感情日記サービスの提供および品質向上のため</p>
                  <p>心理カウンセラーによる個別アドバイス・緊急対応のため</p>
                  <p>匿名化・統計化したうえでの研究・サービス改善のため</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 第三者提供について</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>個人を特定できる形で第三者へ提供することはありません。</p>
                  <p>ただし、あなたまたは第三者の生命・身体の保護が必要な緊急時には、最小限の情報を警察・医療機関等へ提供する場合があります（個人情報保護法23条1項2号）。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 保管・管理について</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>・取得したデータは暗号化して厳重に管理し、アクセス権限を限定します。</p>
                  <p>・利用目的達成後 ［保管期間：1年］ を経過した個票データは速やかに削除します。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Eye className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ あなたの権利</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>ご自身の情報について、開示・訂正・削除・利用停止をいつでも請求できます。</p>
                  <p className="font-jp-medium">お問い合わせ窓口：info@namisapo.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* バックアップ復元セクション */}
        <div className="mb-8">
          <button
            onClick={() => setShowBackupRestore(!showBackupRestore)}
            className="text-blue-600 hover:text-blue-800 font-jp-medium text-sm flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>バックアップから復元する</span>
          </button>
          
          {showBackupRestore && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-jp-bold text-gray-900 mb-3 text-sm">バックアップファイルから復元</h3>
              <p className="text-sm text-gray-700 mb-3">
                以前作成したバックアップファイルからデータを復元できます。
              </p>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-jp-medium
                      file:bg-blue-100 file:text-blue-700
                      hover:file:bg-blue-200
                      cursor-pointer"
                  />
                </div>
                
                <button
                  onClick={handleRestoreBackup}
                  disabled={restoring || !backupFile}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors hover:shadow-md"
                >
                  {restoring ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>復元する</span>
                </button>
                
                {restoreStatus && (
                  <div className={`rounded-lg p-3 text-sm ${
                    restoreStatus.includes('失敗') 
                      ? 'bg-red-50 border border-red-200 text-red-800' 
                      : 'bg-green-50 border border-green-200 text-green-800'
                  }`}>
                    {restoreStatus}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              上記内容をご確認のうえ、同意いただける場合は「同意して開始」をタップしてください。<br />
              同意いただけない場合、本サービスはご利用いただけません。
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="privacy-consent" className="text-sm text-gray-700 leading-relaxed">
                上記のプライバシーポリシーの内容を理解し、個人情報の取り扱いについて同意します。
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!isChecked}
                className={`flex-1 py-3 px-6 rounded-lg font-jp-medium transition-all ${
                  isChecked
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                同意して開始
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors"
              >
                同意しない
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-gray-500 mb-1">
            このアプリケーションは個人情報保護法に準拠して設計されています
          </p>
          <p className="text-xs text-gray-400">
            一般社団法人NAMIDAサポート協会
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsent;