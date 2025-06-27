import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// データ同期ユーティリティ
export const syncService = {
  // ローカルストレージからSupabaseへデータを移行
  async migrateLocalData(userId: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      // ローカルストレージから日記データを取得
      const localEntries = localStorage.getItem('journalEntries');
      if (!localEntries) return true;
      
      const entries = JSON.parse(localEntries);
      if (entries.length === 0) return true;
      
      // バッチ処理で効率的に保存（本番環境対応）
      const batchSize = 50; // 一度に50件ずつ処理
      
      for (const entry of entries) {
        try {
          // 既存エントリーの重複チェック
          const { data: existing } = await supabase
            .from('diary_entries')
            .select('id')
            .eq('user_id', userId)
            .eq('date', entry.date)
            .eq('emotion', entry.emotion)
            .single();
          
          if (!existing) {
            await this.createDiaryEntry({
              user_id: userId,
              date: entry.date,
              emotion: entry.emotion,
              event: entry.event,
              realization: entry.realization,
              self_esteem_score: entry.selfEsteemScore || 50,
              worthlessness_score: entry.worthlessnessScore || 50
            });
          }
        } catch (entryError) {
          console.warn('エントリー移行スキップ:', entry.id, entryError);
          // 個別エラーは警告として処理し、全体の処理は継続
        }
      }
      
      console.log('ローカルデータの移行が完了しました');
      return true;
    } catch (error) {
      console.error('データ移行エラー:', error);
      return false;
    }
  },

  // Supabaseからローカルストレージにデータを同期
  async syncToLocal(userId: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      // サービスロールキーを使用してデータを取得
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase設定が不足しています');
      }
      
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      
      const { data: entries, error } = await supabaseAdmin
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      if (!entries || entries.length === 0) {
        console.log('同期するデータがありません');
        return true;
      }
      
      // ローカルストレージ形式に変換
      const localFormat = entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        emotion: entry.emotion,
        event: entry.event,
        realization: entry.realization,
        selfEsteemScore: entry.self_esteem_score,
        worthlessnessScore: entry.worthlessness_score,
        counselor_memo: entry.counselor_memo,
        is_visible_to_user: entry.is_visible_to_user,
        counselor_name: entry.counselor_name
      }));
      
      localStorage.setItem('journalEntries', JSON.stringify(localFormat));
      console.log('Supabaseからローカルへの同期が完了しました');
      return true;
    } catch (error) {
      console.error('同期エラー:', error);
      return false;
    }
  },
  
  // 管理者モード: 特定のユーザーのデータを削除
  async deleteUserData(userId: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      // 日記エントリーを削除
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('ユーザーデータ削除エラー:', error);
      return false;
    }
  },

  // 同意履歴をSupabaseに同期
  async syncConsentHistories(): Promise<boolean> {
    try {
      // ローカルストレージから同意履歴を取得
      const localHistories = localStorage.getItem('consent_histories');
      if (!localHistories) return true;
      
      const histories = JSON.parse(localHistories);
      if (histories.length === 0) return true;
      
      // サービスロールキーを使用してデータを保存
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase設定が不足しています');
      }
      
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      
      // Supabaseに保存
      for (const history of histories) {
        try {
          // 既存の記録をチェック
          const { data: existing, error: checkError } = await supabaseAdmin
            .from('consent_histories')
            .select('id')
            .eq('line_username', history.line_username)
            .eq('consent_date', history.consent_date)
            .maybeSingle();
            
          if (checkError) {
            console.warn('同意履歴チェックエラー:', checkError);
            continue;
          }
          
          if (!existing) {
            const { error: insertError } = await supabaseAdmin
              .from('consent_histories')
              .insert([{
                line_username: history.line_username,
                consent_given: history.consent_given,
                consent_date: history.consent_date,
                ip_address: history.ip_address || 'unknown',
                user_agent: history.user_agent || navigator.userAgent
              }]);
              
            if (insertError) {
              console.warn('同意履歴保存エラー:', insertError);
            }
          }
        } catch (historyError) {
          console.warn('同意履歴処理エラー:', historyError);
          // 個別エラーは警告として処理し、全体の処理は継続
        }
      }
      
      console.log('同意履歴の同期が完了しました');
      return true;
    } catch (error) {
      console.error('同意履歴同期エラー:', error);
      return false;
    }
  },

  // Supabaseから同意履歴をローカルに同期
  async syncConsentHistoriesToLocal(): Promise<boolean> {
    try {
      // サービスロールキーを使用してデータを取得
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase設定が不足しています');
      }
      
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      
      const { data: histories, error } = await supabaseAdmin
        .from('consent_histories')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (!histories || histories.length === 0) {
        console.log('同期する同意履歴がありません');
        return true;
      }
      
      // ローカルストレージ形式に変換
      const localFormat = histories.map(history => ({
        id: history.id,
        line_username: history.line_username,
        consent_given: history.consent_given,
        consent_date: history.consent_date,
        ip_address: history.ip_address,
        user_agent: history.user_agent
      }));
      
      localStorage.setItem('consent_histories', JSON.stringify(localFormat));
      console.log('同意履歴のローカル同期が完了しました');
      return true;
    } catch (error) {
      console.error('同意履歴ローカル同期エラー:', error);
      return false;
    }
  },

  // 本番環境用：大量データの効率的な同期
  async bulkMigrateLocalData(userId: string, progressCallback?: (progress: number) => void): Promise<boolean> {
    try {
      const localEntries = localStorage.getItem('journalEntries');
      if (!localEntries) return true;
      
      const entries = JSON.parse(localEntries);
      if (entries.length === 0) return true;
      
      // サービスロールキーを使用してデータを保存
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase設定が不足しています');
      }
      
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      
      // バッチ処理で効率的に保存（本番環境対応）
      const batchSize = 20; // 一度に20件ずつ処理
      const totalBatches = Math.ceil(entries.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = entries.slice(i * batchSize, (i + 1) * batchSize);
        
        const insertData = batch.map((entry: any) => ({
          user_id: userId,
          date: entry.date,
          emotion: entry.emotion,
          event: entry.event,
          realization: entry.realization,
          self_esteem_score: entry.selfEsteemScore || 50,
          worthlessness_score: entry.worthlessnessScore || 50
        }));
        
        const { error } = await supabaseAdmin
          .from('diary_entries')
          .upsert(insertData, { 
            onConflict: 'user_id,date,emotion',
            ignoreDuplicates: true 
          });
        
        if (error) {
          console.warn('バッチ処理エラー:', error);
        }
        
        // 進捗報告
        if (progressCallback) {
          const progress = Math.round(((i + 1) / totalBatches) * 100);
          progressCallback(progress);
        }
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('大量データの移行が完了しました');
      return true;
    } catch (error) {
      console.error('大量データ移行エラー:', error);
      return false;
    }
  },
  
  // 日記エントリーを作成
  async createDiaryEntry(entry: any): Promise<any> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .insert([entry])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('日記作成エラー:', error);
      return null;
    }
  }
};

export default syncService;