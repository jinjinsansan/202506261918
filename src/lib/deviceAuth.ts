// Device authentication utilities

// Define the SecurityQuestion type directly in this file
export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

// Define error types
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_LOCKED = 'account_locked',
  DEVICE_MISMATCH = 'device_mismatch',
  INVALID_PIN = 'invalid_pin',
  GENERAL_ERROR = 'general_error'
}

export class AuthError extends Error {
  type: AuthErrorType;
  code: number;
  
  constructor(type: AuthErrorType, message: string) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
    this.code = this.getCodeFromType(type);
  }
  
  private getCodeFromType(type: AuthErrorType): number {
    switch (type) {
      case AuthErrorType.INVALID_CREDENTIALS: return 1001;
      case AuthErrorType.ACCOUNT_LOCKED: return 1002;
      case AuthErrorType.DEVICE_MISMATCH: return 1003;
      case AuthErrorType.INVALID_PIN: return 1004;
      case AuthErrorType.GENERAL_ERROR: return 1000;
      default: return 1000;
    }
  }
}

export const STORAGE_KEYS = {
  DEVICE_ID: 'device_id',
  DEVICE_REGISTERED: 'device_registered',
  SECURITY_QUESTIONS: 'security_questions',
  FAILED_ATTEMPTS: 'failed_attempts',
  LOCKOUT_TIME: 'lockout_time',
  USER_CREDENTIALS: 'user_credentials',
  ACCOUNT_LOCKED: 'account_locked',
  AUTH_SESSION: 'auth_session'
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Security questions list
export const SECURITY_QUESTIONS = [
  { id: 'birthplace', question: '生まれた場所は？', placeholder: '例: 東京' },
  { id: 'firstpet', question: '最初のペットの名前は？', placeholder: '例: ポチ' },
  { id: 'childhood', question: '子供の頃の親友の名前は？', placeholder: '例: 田中さん' },
  { id: 'school', question: '最初に通った学校の名前は？', placeholder: '例: ○○小学校' },
  { id: 'color', question: '好きな色は？', placeholder: '例: 青' },
  { id: 'food', question: '好きな食べ物は？', placeholder: '例: ラーメン' },
  { id: 'movie', question: '好きな映画は？', placeholder: '例: スターウォーズ' },
  { id: 'book', question: '好きな本は？', placeholder: '例: ハリーポッター' }
];

// User credentials interface
interface UserCredentials {
  lineUsername: string;
  pinCodeHash: string;
  salt: string;
  deviceId: string;
  createdAt: string;
}

// Auth session interface
interface AuthSession {
  lineUsername: string;
  deviceId: string;
  lastActivity: string;
}

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

// Generate a device fingerprint for authentication
export function generateDeviceFingerprint() {
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const language = navigator.language;
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  
  // Create a simple hash of the combined values
  const deviceId = btoa(userAgent.substring(0, 20) + screenInfo + platform).replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
  
  return {
    id: deviceId,
    screen: screenInfo,
    language,
    platform,
    userAgent: userAgent.substring(0, 50)
  };
}

// Save device fingerprint to local storage
export function saveDeviceFingerprint(fingerprint: any) {
  localStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
}

// Get saved device fingerprint
export function getDeviceFingerprint() {
  const saved = localStorage.getItem('device_fingerprint');
  return saved ? JSON.parse(saved) : null;
}

// Compare device fingerprints
export function compareDeviceFingerprints(current: any, saved: any) {
  // Simple comparison - in a real app, you'd use a more sophisticated approach
  return current.id === saved.id;
}

// Generate a random salt
export function generateSalt(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return salt;
}

// Hash PIN code with salt
export async function hashPinCode(pinCode: string, salt: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pinCode + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Save user credentials
export async function saveUserCredentials(lineUsername: string, pinCode: string, deviceId: string) {
  const salt = generateSalt();
  const pinCodeHash = await hashPinCode(pinCode, salt);
  
  const credentials: UserCredentials = {
    lineUsername,
    pinCodeHash,
    salt,
    deviceId,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(credentials));
  return credentials;
}

// Get user credentials
export function getUserCredentials(): UserCredentials | null {
  const saved = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
  return saved ? JSON.parse(saved) : null;
}

// Create auth session
export function createAuthSession(data: { lineUsername: string, deviceId: string, pinCode?: string }) {
  const session: AuthSession = {
    lineUsername: data.lineUsername,
    deviceId: data.deviceId,
    lastActivity: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  return session;
}

// Get auth session
export function getAuthSession(): AuthSession | null {
  const saved = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (!saved) return null;
  
  const session = JSON.parse(saved);
  // Update last activity
  session.lastActivity = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  
  return session;
}

// Clear auth session (logout)
export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getAuthSession();
}

// Get current user
export function getCurrentUser() {
  const session = getAuthSession();
  if (!session) return null;
  
  return {
    lineUsername: session.lineUsername,
    deviceId: session.deviceId
  };
}

// Logout user
export function logoutUser() {
  clearAuthSession();
}

// Get login attempts for a specific user
export function getLoginAttempts(username: string) {
  const key = `${STORAGE_KEYS.FAILED_ATTEMPTS}_${username}`;
  const attempts = localStorage.getItem(key);
  return attempts ? parseInt(attempts, 10) : 0;
}

// Increment login attempts for a specific user
export function incrementLoginAttempts(username: string) {
  const key = `${STORAGE_KEYS.FAILED_ATTEMPTS}_${username}`;
  const currentAttempts = getLoginAttempts(username);
  const newAttempts = currentAttempts + 1;
  localStorage.setItem(key, newAttempts.toString());
  return newAttempts;
}

// Reset login attempts for a specific user
export function resetLoginAttempts(username: string) {
  const key = `${STORAGE_KEYS.FAILED_ATTEMPTS}_${username}`;
  localStorage.removeItem(key);
}

// Check if account is locked
export function isAccountLocked(username: string) {
  const key = `${STORAGE_KEYS.ACCOUNT_LOCKED}_${username}`;
  const lockTime = localStorage.getItem(key);
  if (!lockTime) return false;
  
  const lockExpiry = parseInt(lockTime, 10);
  return Date.now() < lockExpiry;
}

// Lock account
export function lockAccount(username: string) {
  const key = `${STORAGE_KEYS.ACCOUNT_LOCKED}_${username}`;
  const lockExpiry = Date.now() + LOCKOUT_DURATION;
  localStorage.setItem(key, lockExpiry.toString());
}

// Log security event
export function logSecurityEvent(type: string, username: string, details: string) {
  const event = {
    id: Date.now().toString(),
    type,
    username,
    timestamp: new Date().toISOString(),
    details
  };
  
  // Get existing events
  const eventsJson = localStorage.getItem('security_events');
  const events = eventsJson ? JSON.parse(eventsJson) : [];
  
  // Add new event and save
  events.push(event);
  localStorage.setItem('security_events', JSON.stringify(events));
  
  return event;
}