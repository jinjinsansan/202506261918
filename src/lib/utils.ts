import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a localized format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "1月1日 (月)")
 */
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${month}月${day}日 (${dayOfWeek})`;
}

/**
 * Get emotion color classes for styling
 * @param emotion - Emotion name
 * @returns Object with color classes for background, border, and text
 */
export function getEmotionColor(emotion: string) {
  const colorMap: { [key: string]: string } = {
    '恐怖': 'bg-purple-100 text-purple-800 border-purple-200',
    '悲しみ': 'bg-blue-100 text-blue-800 border-blue-200',
    '怒り': 'bg-red-100 text-red-800 border-red-200',
    '悔しい': 'bg-green-100 text-green-800 border-green-200',
    '無価値感': 'bg-gray-100 text-gray-800 border-gray-300',
    '罪悪感': 'bg-orange-100 text-orange-800 border-orange-200',
    '寂しさ': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    '恥ずかしさ': 'bg-pink-100 text-pink-800 border-pink-200'
  };
  return colorMap[emotion] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get emotion emoji for sharing
 * @param emotion - Emotion name
 * @returns Emoji corresponding to the emotion
 */
export function getEmotionEmoji(emotion: string): string {
  const emojiMap: { [key: string]: string } = {
    '恐怖': '😨',
    '悲しみ': '😢',
    '怒り': '😠',
    '悔しい': '😣',
    '無価値感': '😔',
    '罪悪感': '😓',
    '寂しさ': '🥺',
    '恥ずかしさ': '😳'
  };
  return emojiMap[emotion] || '📝';
}

/**
 * Highlight search text in content
 * @param text - Original text
 * @param searchTerm - Search term to highlight
 * @returns React elements with highlighted text
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  // Use a simple string replacement instead of JSX
  const regex = new RegExp(searchTerm, 'gi');
  return text.replace(regex, match => `**${match}**`);
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Get Japanese date
 * @returns Current date in Japan timezone
 */
export function getJapaneseDate(): Date {
  // Japan timezone (UTC+9)
  const now = new Date();
  // Japan timezone offset in milliseconds
  const japanOffset = 9 * 60 * 60 * 1000;
  // UTC time + Japan offset
  const japanTime = new Date(now.getTime() + japanOffset);
  return japanTime;
}