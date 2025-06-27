import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw, Wrench, Heart, CheckCircle, Info, Shield, LogIn } from 'lucide-react';

interface MaintenanceConfig {
  isEnabled: boolean;
  message: string;
  endTime?: string;
  type: 'scheduled' | 'emergency' | 'completed';
  progress?: number;
  estimatedDuration?: string;
  affectedFeatures?: string[];
  contactInfo?: string;
}

interface MaintenanceModeProps {
  config: MaintenanceConfig;
  isCounselor?: boolean;
  onRetry?: () => void;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ config, isCounselor = false, onRetry }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showCounselorLogin, setShowCounselorLogin] = useState(false);
  const [counselorCredentials, setCounselorCredentials] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));

      if (config.endTime) {
        const endTime = new Date(config.endTime);
        const diff = endTime.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          if (hours > 0) {
            setTimeRemaining(`${hours}時間${minutes}分${seconds}秒`);
          } else if (minutes > 0) {
            setTimeRemaining(`${minutes}分${seconds}秒`);
          } else {
            setTimeRemaining(`${seconds}秒`);
          }
        } else {
          setTimeRemaining('まもなく復旧予定');
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [config.endTime]);

  const getMaintenanceIcon = () => {
    switch (config.type) {
      case 'emergency':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      default:
        return <Wrench className="w-12 h-12 text-blue-500" />;
    }
  };

  const getMaintenanceColor = () => {
    switch (config.type) {
      case 'emergency':
        return {
          bg: 'from-red-50 to-pink-100',
          border: 'border-red-200',
          text: 'text-red-800',
          accent: 'bg-red-500'
        };
      case 'completed':
        return {
          bg: 'from-green-50 to-emerald-100',
          border: 'border-green-200',
          text: 'text-green-800',
          accent: 'bg-green-500'
        };
      default:
        return {
          bg: 'from-blue-50 to-indigo-100',
          border: 'border-blue-200',
          text: 'text-blue-800',
          accent: 'bg-blue-500'
        };
    }
  };

  // カウンセラーアカウント情報
  const counselorAccounts = [
    { name: '心理カウンセラー仁', email: 'jin@namisapo.com' },
    { name: '心理カウンセラーAOI', email: 'aoi@namisapo.com' },
    { name: '心理カウンセラーあさみ', email: 'asami@namisapo.com' },
    { name: '心理カウンセラーSHU', email: 'shu@namisapo.com' },
    { name: '心理カウンセラーゆーちゃ', email: 'yucha@namisapo.com' },
    { name: '心理カウンセラーSammy', email: 'sammy@namisapo.com' }
  ];

  // カウンセラーログイン処理
  const handleCounselorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    
    const { email, password } = counselorCredentials;
    
    // パスワードチェック
    if (password !== 'counselor123') {
      setLoginError('パスワードが正しくありません。');
      setLoggingIn(false);
      return;
    }
    
    // メールアドレスチェック
    const counselor = counselorAccounts.find(c => c.email === email);
    if (!counselor) {
      setLoginError('登録されていないメールアドレスです。');
      setLoggingIn(false);
      return;
    }
    
    // ログイン成功
    localStorage.setItem('current_counselor', counselor.name);
    
    // 少し待ってからリロード
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // カウンセラーログインモーダル
  const renderCounselorLoginModal = () => {
    if (!showCounselorLogin) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-jp-bold text-gray-900 mb-2">
              カウンセラーログイン
            </h2>
            <p className="text-gray-600 font-jp-normal text-sm">
              メンテナンスモードをバイパスするには<br />カウンセラー認証が必要です
            </p>
          </div>

          <form onSubmit={handleCounselorLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={counselorCredentials.email}
                onChange={(e) => setCounselorCredentials({...counselorCredentials, email: e.target.value})}
                placeholder="カウンセラー用メールアドレスを入力"
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-jp-normal text-gray-800 placeholder-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={counselorCredentials.password}
                onChange={(e) => setCounselorCredentials({...counselorCredentials, password: e.target.value})}
                placeholder="パスワードを入力"
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-jp-normal text-gray-800 placeholder-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-600 font-jp-normal">{loginError}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={loggingIn}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-jp-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm flex items-center justify-center"
              >
                {loggingIn ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    ログイン
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCounselorLogin(false)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-jp-medium transition-all duration-200 hover:shadow-md text-sm"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const colors = getMaintenanceColor();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-hidden">
        {/* 装飾的な背景要素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>

        <div className="text-center relative z-10">
          {/* アイコン */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            {getMaintenanceIcon()}
          </div>

          {/* タイトル */}
          <h1 className="text-3xl font-jp-bold text-gray-900 mb-4">
            {config.type === 'emergency' ? '緊急メンテナンス中' :
             config.type === 'completed' ? 'メンテナンス完了' :
             'メンテナンス中'}
          </h1>

          {/* メッセージ */}
          <div className={`bg-gray-50 rounded-lg p-6 mb-6 border ${colors.border}`}>
            <p className="text-gray-800 font-jp-normal leading-relaxed text-lg">
              {config.message}
            </p>
          </div>

          {/* 進捗バー（進捗が設定されている場合） */}
          {config.progress !== undefined && config.type !== 'completed' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-jp-medium text-gray-700">進捗状況</span>
                <span className="text-sm font-jp-bold text-gray-900">{config.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 ${colors.accent} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${config.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 時間情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-jp-medium text-gray-700">現在時刻</span>
              </div>
              <p className="text-xl font-jp-bold text-gray-900">{currentTime}</p>
            </div>

            {config.endTime && config.type !== 'completed' && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-jp-medium text-gray-700">復旧予定まで</span>
                </div>
                <p className="text-xl font-jp-bold text-blue-600">{timeRemaining}</p>
              </div>
            )}

            {config.estimatedDuration && (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm md:col-span-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-jp-medium text-gray-700">予想所要時間</span>
                </div>
                <p className="text-lg font-jp-bold text-gray-900">{config.estimatedDuration}</p>
              </div>
            )}
          </div>

          {/* 影響を受ける機能 */}
          {config.affectedFeatures && config.affectedFeatures.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
              <h3 className="font-jp-bold text-yellow-900 mb-3">影響を受ける機能</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {config.affectedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-800 font-jp-normal">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* データ保護メッセージ */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
            <div className="flex items-start space-x-3">
              <Heart className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-jp-bold text-green-900 mb-2">データの安全性について</h3>
                <div className="space-y-1 text-sm text-green-800 font-jp-normal">
                  <p>• あなたの日記データは安全に保護されています</p>
                  <p>• ローカルに保存されたデータは失われません</p>
                  <p>• メンテナンス完了後、すべての機能が正常に復旧します</p>
                </div>
              </div>
            </div>
          </div>

          {/* 代替手段の提案 */}
          {config.type !== 'completed' && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <h3 className="font-jp-bold text-blue-900 mb-3">メンテナンス中の代替手段</h3>
              <div className="text-sm text-blue-800 font-jp-normal space-y-2">
                <p>📝 物理的なノートに感情日記を記録してください</p>
                <p>💾 メンテナンス完了後、デジタル版に転記できます</p>
                <p>🔄 自動同期機能により、データの整合性を保ちます</p>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {config.type === 'completed' ? (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>アプリを再開</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>状態を確認</span>
                  </button>
                  
                  <button
                    onClick={() => setShowCounselorLogin(true)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>カウンセラーログイン</span>
                  </button>
                </div>
                
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    再試行
                  </button>
                )}
              </>
            )}
          </div>

          {/* 連絡先情報 */}
          {config.contactInfo && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-jp-normal">
                お急ぎの場合は: {config.contactInfo}
              </p>
            </div>
          )}

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-jp-normal">
              一般社団法人NAMIDAサポート協会 | かんじょうにっき
            </p>
            <p className="text-xs text-gray-400 font-jp-normal mt-1">
              ご不便をおかけして申し訳ございません
            </p>
          </div>
        </div>
      </div>
      
      {/* カウンセラーログインモーダル */}
      {renderCounselorLoginModal()}
    </div>
  );
};

export default MaintenanceMode;