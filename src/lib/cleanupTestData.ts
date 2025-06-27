import { supabase } from './supabase';

/**
 * Identifies test data patterns in diary entries
 * @param entry - Diary entry to check
 * @returns Boolean indicating if the entry is likely test data
 */
export function isTestData(entry: any): boolean {
  // Check for common test data patterns
  const testPatterns = [
    // Empty or placeholder content
    !entry.event || !entry.realization,
    entry.event.length < 5,
    entry.realization.length < 5,
    
    // Test data keywords
    entry.event.includes('test') || entry.event.includes('テスト'),
    entry.realization.includes('test') || entry.realization.includes('テスト'),
    
    // Bolt-generated content patterns
    entry.event.includes('Lorem ipsum') || entry.event.includes('サンプル'),
    entry.event.includes('example') || entry.event.includes('例'),
    
    // Default values
    (entry.selfEsteemScore === 50 && entry.worthlessnessScore === 50),
    
    // Unrealistic dates (future dates)
    new Date(entry.date) > new Date()
  ];
  
  // If any pattern matches, consider it test data
  return testPatterns.some(pattern => pattern === true);
}

/**
 * Cleans up test data from local storage
 * @returns Number of entries removed
 */
export function cleanupLocalTestData(): number {
  try {
    // Get entries from local storage
    const savedEntries = localStorage.getItem('journalEntries');
    if (!savedEntries) return 0;
    
    const entries = JSON.parse(savedEntries);
    const originalCount = entries.length;
    
    // Filter out test data
    const cleanedEntries = entries.filter((entry: any) => !isTestData(entry));
    
    // Save cleaned entries back to local storage
    localStorage.setItem('journalEntries', JSON.stringify(cleanedEntries));
    
    return originalCount - cleanedEntries.length;
  } catch (error) {
    console.error('Error cleaning up local test data:', error);
    return 0;
  }
}

/**
 * Cleans up test data from Supabase
 * @param userId - User ID to clean up data for
 * @returns Promise with number of entries removed
 */
export async function cleanupSupabaseTestData(userId: string): Promise<number> {
  if (!supabase) return 0;
  
  try {
    // Get all entries for the user
    const { data: entries, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    if (!entries || entries.length === 0) return 0;
    
    // Identify test data entries
    const testEntryIds = entries
      .filter(entry => isTestData(entry))
      .map(entry => entry.id);
    
    if (testEntryIds.length === 0) return 0;
    
    // Delete test entries
    const { error: deleteError } = await supabase
      .from('diary_entries')
      .delete()
      .in('id', testEntryIds);
    
    if (deleteError) throw deleteError;
    
    return testEntryIds.length;
  } catch (error) {
    console.error('Error cleaning up Supabase test data:', error);
    return 0;
  }
}

/**
 * Performs a complete cleanup of test data
 * @param userId - User ID for Supabase cleanup
 * @returns Promise with results of cleanup
 */
export async function performFullCleanup(userId?: string): Promise<{
  localRemoved: number;
  supabaseRemoved: number;
}> {
  // Clean up local storage
  const localRemoved = cleanupLocalTestData();
  
  // Clean up Supabase if connected and userId provided
  let supabaseRemoved = 0;
  if (userId) {
    supabaseRemoved = await cleanupSupabaseTestData(userId);
  }
  
  return {
    localRemoved,
    supabaseRemoved
  };
}