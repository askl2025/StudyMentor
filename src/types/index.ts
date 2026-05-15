export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  type: 'choice' | 'short-answer';
  question: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: string;
  explanation?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface UploadedFile {
  name: string;
  type: 'pdf';
  content: string;
  fileData?: ArrayBuffer;
  pageCount?: number;
  title?: string;
}

export type ModelProvider =
  | 'claude'
  | 'openai'
  | 'gemini'
  | 'deepseek'
  | 'kimi'
  | 'glm'
  | 'custom';

export interface CustomModelConfig {
  baseUrl: string;
  modelName: string;
}

export interface TutorSettings {
  apiKey: string;
  provider: ModelProvider;
  customConfig?: CustomModelConfig;
  guidanceLevel: 'gentle' | 'moderate' | 'strict';
}

export interface AppState {
  uploadedFile: UploadedFile | null;
  messages: Message[];
  quizQuestions: QuizQuestion[];
  settings: TutorSettings;
  isLoading: boolean;
  isGeneratingQuiz: boolean;
}

export type AppAction =
  | { type: 'SET_FILE'; payload: UploadedFile | null }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_QUIZ_QUESTIONS'; payload: QuizQuestion[] }
  | { type: 'UPDATE_QUIZ_QUESTION'; payload: { id: string; updates: Partial<QuizQuestion> } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TutorSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GENERATING_QUIZ'; payload: boolean }
  | { type: 'CLEAR_ALL' };