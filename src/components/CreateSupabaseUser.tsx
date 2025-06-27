import React, { useState } from 'react';
import { RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { userService } from '../lib/supabase';

interface CreateSupabaseUserProps {
  onUserCreated?: () => void;
}

const CreateSupabaseUser: React.FC<CreateSupabaseUserProps> = ({ onUserCreated }) => {
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateUser = async () => {
    const lineUsername = localStorage.getItem('line-username');
    if (!lineUsername) {
      setError('ユーザー名が設定されていません。');
      return;
    }

    try {
      setCreating(true);
      setStatus('Supabaseユーザーを作成中...');
      setError(null);
      setSuccess(false);
      
      // ユーザー作成
      const user = await userService.createUser(lineUsername);
      
      if (user) {
        setStatus('Supabaseユーザーが作成されました！');
        setSuccess(true);
        
        if (onUserCreated) {
          onUserCreated();
        }
        
        // 2秒後に自動的にページをリロード
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('ユーザー作成に失敗しました。');
      }
    } catch (error) {
      console.error('Supabaseユーザー作成エラー:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          setError('このユーザー名は既に登録されています。');
        } else {
          setError(`エラー: ${error.message}`);
        }
      } else {
        setError('不明なエラーが発生しました。');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="font-jp-bold text-gray-900">Supabaseユーザー作成</h3>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">
        Supabaseユーザーを作成すると、データをクラウドに同期できるようになります。
      </p>
      
      {error && (
        <div className="bg-red-50 rounded-lg p-3 border border-red-200 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-4 animate-pulse">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">{status}</p>
          </div>
        </div>
      )}
      
      <button
        onClick={handleCreateUser}
        disabled={creating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
      >
        {creating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>作成中...</span>
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            <span>Supabaseユーザーを作成する</span>
          </>
        )}
      </button>
      
      <p className="text-xs text-gray-500 mt-3">
        ※ ユーザー作成後、自動的にページがリロードされます
      </p>
    </div>
  );
};

export default CreateSupabaseUser;