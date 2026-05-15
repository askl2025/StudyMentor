import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  uploadedFile: null,
  messages: [],
  quizQuestions: [],
  settings: {
    apiKey: '',
    provider: 'claude',
    guidanceLevel: 'moderate',
  },
  isLoading: false,
  isGeneratingQuiz: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, uploadedFile: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_QUIZ_QUESTIONS':
      return { ...state, quizQuestions: action.payload };
    case 'UPDATE_QUIZ_QUESTION':
      return {
        ...state,
        quizQuestions: state.quizQuestions.map((q) =>
          q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
        ),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_GENERATING_QUIZ':
      return { ...state, isGeneratingQuiz: action.payload };
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}