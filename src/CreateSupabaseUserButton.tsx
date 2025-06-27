import React, { useState } from 'react';
import { RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { userService, supabase } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface CreateSupabaseUserButtonProps {
  onUserCreated?: () => void;
  className?: string;
}

const CreateSupabaseUserButton: React.FC<CreateSupabaseUserButtonProps> = ({ 
  onUserCreated,
  className = ""
}) => {
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createUserDirectly = async (lineUsername: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase設定が不足しています');
    }
    
    // サービスロール用のクライアントを作成
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // まず既存ユーザーをチェック
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('line_username', lineUsername)
      .maybeSingle();
      
    if (existingUser) {
      console.log('ユーザーは既に存在します:', existingUser);
      return existingUser;
    }
    
    // 新規ユーザー作成
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ 
        line_username: lineUsername,
        created_at: new Date().toISOString()
      }])
      .select()
      .maybeSingle();
      
    if (error) {
      console.error('直接ユーザー作成エラー:', error);
      throw error;
    }
    
    return data;
  };

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
      let user;
      try {
        // まずuserServiceを使用
        user = await userService.createUser(lineUsername);
      } catch (serviceError) {
        console.error('userService経由の作成に失敗、直接作成を試みます:', serviceError);
        try {
          // 直接作成を試みる
          user = await createUserDirectly(lineUsername);
        } catch (directError) {
          console.error('直接作成にも失敗:', directError);
          throw directError;
        }
      }
      
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
    <div className={`bg-white rounded-lg p-4 border border-blue-200 shadow-md ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="font-jp-bold text-gray-900">Supabaseユーザー作成</h3>
        <span className="text-xs text-red-600 font-jp-bold">（直接作成）</span>
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

export default CreateSupabaseUserButton;