import { useState, useCallback } from 'react';
import { useApp } from '../stores/AppContext';
import type { Message } from '../types';
import { generateId } from '../utils';
import { sendMessage } from '../services/api';
import { getTutorSystemPrompt } from '../services/prompts';

export function useChat() {
  const { state, dispatch } = useApp();
  const [isStreaming, setIsStreaming] = useState(false);

  const sendChatMessage = useCallback(async (content: string) => {
    if (!state.settings.apiKey) {
      alert('请先配置API Key');
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    setIsStreaming(true);

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

    const systemPrompt = getTutorSystemPrompt(
      state.settings,
      state.uploadedFile?.content
    );

    await sendMessage(
      [...state.messages, userMessage],
      state.settings.apiKey,
      state.settings.provider,
      systemPrompt,
      {
        onChunk: (chunk) => {
          assistantMessage.content += chunk;
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: assistantMessage.id, updates: { content: assistantMessage.content } },
          });
        },
        onComplete: (fullResponse) => {
          assistantMessage.content = fullResponse;
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: assistantMessage.id, updates: { content: fullResponse } },
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          setIsStreaming(false);
        },
        onError: (error) => {
          assistantMessage.content = `抱歉，发生了错误: ${error}`;
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: assistantMessage.id, updates: { content: assistantMessage.content } },
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          setIsStreaming(false);
        },
      },
      state.settings.customConfig
    );
  }, [state.settings, state.uploadedFile, state.messages, dispatch]);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'SET_MESSAGES', payload: [] });
  }, [dispatch]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isStreaming,
    sendChatMessage,
    clearMessages,
  };
}