// Device authentication utilities
import { SecurityQuestion } from '../types/auth';

const STORAGE_KEYS = {
  DEVICE_ID: 'device_id',
  DEVICE_REGISTERED: 'device_registered',
  SECURITY_QUESTIONS: 'security_questions',
  FAILED_ATTEMPTS: 'failed_attempts',
  LOCKOUT_TIME: 'lockout_time'
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export function generateDeviceId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `device_${timestamp}_${random}`;
}

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}

export function isDeviceRegistered(): boolean {
  return localStorage.getItem(STORAGE_KEYS.DEVICE_REGISTERED) === 'true';
}

export function registerDevice(): void {
  localStorage.setItem(STORAGE_KEYS.DEVICE_REGISTERED, 'true');
}

export function unregisterDevice(): void {
  localStorage.removeItem(STORAGE_KEYS.DEVICE_REGISTERED);
  localStorage.removeItem(STORAGE_KEYS.SECURITY_QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
}

export function saveSecurityQuestions(questions: SecurityQuestion[]): void {
  try {
    // Encode answers for security
    const encodedQuestions = questions.map(q => {
      // Use TextEncoder to handle non-Latin1 characters
      const encoder = new TextEncoder();
      const data = encoder.encode(q.answer.toLowerCase().trim());
      // Convert to base64 using a safe approach
      const base64 = btoa(
        Array.from(data)
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      
      return {
        id: q.id,
        question: q.question,
        answer: base64
      };
    });
    
    localStorage.setItem(STORAGE_KEYS.SECURITY_QUESTIONS, JSON.stringify(encodedQuestions));
    
    // Clear any previous failed attempts
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
  } catch (error) {
    console.error('秘密の質問保存エラー:', error);
    throw new Error('秘密の質問の保存に失敗しました');
  }
}

export function getSecurityQuestions(): SecurityQuestion[] {
  try {
    const savedQuestions = localStorage.getItem(STORAGE_KEYS.SECURITY_QUESTIONS);
    if (!savedQuestions) return [];
    
    // Parse the saved questions
    const questions = JSON.parse(savedQuestions);
    
    // Ensure we return the expected format
    return questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      answer: q.answer
    }));
  } catch (error) {
    console.error('秘密の質問取得エラー:', error);
    return [];
  }
}

export function verifySecurityAnswer(questionId: string, answer: string): boolean {
  try {
    const questions = getSecurityQuestions();
    const question = questions.find((q: SecurityQuestion) => q.id === questionId);
    
    if (!question) return false;
    
    // Use the same encoding method as in saveSecurityQuestions
    const encoder = new TextEncoder();
    const data = encoder.encode(answer.toLowerCase().trim());
    const encodedAnswer = btoa(
      Array.from(data)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    return encodedAnswer === question.answer;
  } catch (error) {
    console.error('秘密の質問検証エラー:', error);
    return false;
  }
}

export function getFailedAttempts(): number {
  const attempts = localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS);
  return attempts ? parseInt(attempts, 10) : 0;
}

export function incrementFailedAttempts(): void {
  const currentAttempts = getFailedAttempts();
  const newAttempts = currentAttempts + 1;
  localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, newAttempts.toString());
  
  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockoutTime = Date.now() + LOCKOUT_DURATION;
    localStorage.setItem(STORAGE_KEYS.LOCKOUT_TIME, lockoutTime.toString());
  }
}

export function clearFailedAttempts(): void {
  localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
}

export function isDeviceLocked(): boolean {
  const lockoutTime = localStorage.getItem(STORAGE_KEYS.LOCKOUT_TIME);
  if (!lockoutTime) return false;
  
  const lockoutTimestamp = parseInt(lockoutTime, 10);
  const now = Date.now();
  
  if (now >= lockoutTimestamp) {
    // Lockout period has expired
    clearFailedAttempts();
    return false;
  }
  
  return true;
}

export function getLockoutTimeRemaining(): number {
  const lockoutTime = localStorage.getItem(STORAGE_KEYS.LOCKOUT_TIME);
  if (!lockoutTime) return 0;
  
  const lockoutTimestamp = parseInt(lockoutTime, 10);
  const now = Date.now();
  
  return Math.max(0, lockoutTimestamp - now);
}

export function getRemainingAttempts(): number {
  return Math.max(0, MAX_FAILED_ATTEMPTS - getFailedAttempts());
}