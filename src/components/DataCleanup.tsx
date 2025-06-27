import React, { useState } from 'react';
import { Trash2, RefreshCw, CheckCircle, AlertTriangle, Database, Info } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { performFullCleanup } from '../lib/cleanupTestData';

const DataCleanup: React.FC = () => {
  const { isConnected, currentUser } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [results, setResults] = useState<{
    localRemoved: number;
    supabaseRemoved: number;
  } | null>(null);

  // Handle cleanup process
  const handleCleanup = async () => {
    if (!window.confirm('テストデータを削除しますか？この操作は元に戻せません。')) {
      return;
    }
    
    setLoading(true);
    setStatus('テストデータを検出して削除しています...');
    setResults(null);
    
    try {
      const results = await performFullCleanup(
        isConnected && currentUser ? currentUser.id : undefined
      );
      
      setResults(results);
      
      if (results.localRemoved === 0 && results.supabaseRemoved === 0) {
        setStatus('テストデータは見つかりませんでした。');
      } else {
        setStatus(`テストデータの削除が完了しました！`);
      }
    } catch (error) {
      console.error('データクリーンアップエラー:', error);
      setStatus('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Trash2 className="w-8 h-8 text-red-600" />
        <h2 className="text-xl font-jp-bold text-gray-900">テストデータのクリーンアップ</h2>
      </div>

      {/* 説明セクション */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 font-jp-normal">
            <p className="font-jp-medium mb-2">テストデータのクリーンアップについて</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>このツールは自動生成されたテストデータを検出して削除します</li>
              <li>実際のユーザーデータは保持されます</li>
              <li>ローカルストレージとSupabaseの両方からクリーンアップします</li>
              <li>この操作は元に戻せないため、必要に応じてバックアップを作成してください</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 接続状態表示 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <div>
            <p className="text-sm font-jp-medium text-gray-700">Supabase接続</p>
            <p className="text-xs text-gray-500">{isConnected ? '接続済み' : 'ローカルモード'}</p>
          </div>
        </div>
      </div>

      {/* クリーンアップボタン */}
      <div className="space-y-4">
        <button
          onClick={handleCleanup}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors w-full"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
          <span>テストデータを削除</span>
        </button>
      </div>

      {/* 結果表示 */}
      {results && (
        <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-jp-bold text-green-900">クリーンアップ結果</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2 mb-1">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-jp-medium text-gray-700">ローカルストレージ</span>
              </div>
              <p className="text-xl font-jp-bold text-blue-600">{results.localRemoved}件削除</p>
            </div>
            
            {isConnected && (
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-jp-medium text-gray-700">Supabase</span>
                </div>
                <p className="text-xl font-jp-bold text-purple-600">{results.supabaseRemoved}件削除</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ステータス表示 */}
      {status && !results && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2">
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            ) : status.includes('エラー') ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <Info className="w-5 h-5 text-blue-600" />
            )}
            <span className="font-jp-medium text-blue-800">{status}</span>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800 font-jp-normal">
            <p className="font-jp-medium mb-2">重要な注意事項</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>削除されたデータは復元できません</li>
              <li>実際のユーザーデータは保持されますが、念のためバックアップを作成することをお勧めします</li>
              <li>クリーンアップ後はページを再読み込みして変更を確認してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCleanup;