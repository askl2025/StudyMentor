import { useCallback } from 'react';
import { useApp } from '../stores/AppContext';
import type { TutorSettings } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useSettings() {
  const { state, dispatch } = useApp();
  const [storedSettings, setStoredSettings] = useLocalStorage<TutorSettings>(
    'studymmentor-settings',
    state.settings
  );

  const updateSettings = useCallback((updates: Partial<TutorSettings>) => {
    const newSettings = { ...state.settings, ...updates };
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
    setStoredSettings(newSettings);
  }, [state.settings, dispatch, setStoredSettings]);

  const loadStoredSettings = useCallback(() => {
    if (storedSettings) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: storedSettings });
    }
  }, [storedSettings, dispatch]);

  const clearSettings = useCallback(() => {
    const defaultSettings: TutorSettings = {
      apiKey: '',
      provider: 'claude',
      guidanceLevel: 'moderate',
    };
    dispatch({ type: 'UPDATE_SETTINGS', payload: defaultSettings });
    setStoredSettings(defaultSettings);
  }, [dispatch, setStoredSettings]);

  return {
    settings: state.settings,
    updateSettings,
    loadStoredSettings,
    clearSettings,
  };
}