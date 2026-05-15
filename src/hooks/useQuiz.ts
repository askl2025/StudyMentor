import { useCallback } from 'react';
import { useApp } from '../stores/AppContext';
import { generateId } from '../utils';
import { sendMessage } from '../services/api';
import { getQuizGenerationPrompt, getAnswerReviewPrompt } from '../services/prompts';

export function useQuiz() {
  const { state, dispatch } = useApp();

  const generateQuiz = useCallback(async () => {
    if (!state.settings.apiKey) {
      alert('请先配置API Key');
      return;
    }

    if (!state.uploadedFile) {
      alert('请先上传学习材料');
      return;
    }

    dispatch({ type: 'SET_GENERATING_QUIZ', payload: true });

    const prompt = getQuizGenerationPrompt(state.uploadedFile.content);

    await sendMessage(
      [{ id: generateId(), role: 'user', content: prompt, timestamp: Date.now() }],
      state.settings.apiKey,
      state.settings.provider,
      '你是一位专业的出题老师，擅长根据学习材料生成高质量的练习题。请严格按照JSON格式输出。',
      {
        onChunk: () => {},
        onComplete: (response) => {
          try {
            // 尝试提取JSON
            let jsonStr = response;

            // 尝试从markdown代码块中提取
            const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (codeBlockMatch) {
              jsonStr = codeBlockMatch[1];
            } else {
              // 尝试直接匹配JSON对象
              const jsonMatch = response.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                jsonStr = jsonMatch[0];
              }
            }

            const parsed = JSON.parse(jsonStr);

            if (parsed.questions && Array.isArray(parsed.questions)) {
              // 验证和清理题目数据
              const validQuestions = parsed.questions
                .filter((q: any) => q.id && q.type && q.question)
                .map((q: any, index: number) => ({
                  id: q.id || `q${index + 1}`,
                  type: q.type === 'choice' ? 'choice' : 'short-answer',
                  question: q.question,
                  options: q.type === 'choice' ? q.options : undefined,
                  correctAnswer: q.correctAnswer || '',
                  explanation: q.explanation || '',
                }));

              if (validQuestions.length > 0) {
                dispatch({ type: 'SET_QUIZ_QUESTIONS', payload: validQuestions });
              } else {
                alert('生成的题目格式不正确，请重试');
              }
            } else {
              alert('生成的题目格式不正确，请重试');
            }
          } catch (error) {
            console.error('解析习题JSON失败:', error);
            console.log('原始响应:', response);
            alert('习题生成失败，请重试');
          }
          dispatch({ type: 'SET_GENERATING_QUIZ', payload: false });
        },
        onError: (error) => {
          console.error('生成习题失败:', error);
          alert(`习题生成失败: ${error}`);
          dispatch({ type: 'SET_GENERATING_QUIZ', payload: false });
        },
      },
      state.settings.customConfig
    );
  }, [state.settings, state.uploadedFile, dispatch]);

  const submitAnswer = useCallback((questionId: string, answer: string) => {
    dispatch({
      type: 'UPDATE_QUIZ_QUESTION',
      payload: {
        id: questionId,
        updates: { userAnswer: answer },
      },
    });
  }, [dispatch]);

  const checkAnswer = useCallback((questionId: string) => {
    const question = state.quizQuestions.find((q) => q.id === questionId);
    if (!question || !question.userAnswer) return;

    const isCorrect = question.type === 'choice'
      ? question.userAnswer === question.correctAnswer
      : question.userAnswer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();

    dispatch({
      type: 'UPDATE_QUIZ_QUESTION',
      payload: {
        id: questionId,
        updates: { isCorrect },
      },
    });
  }, [state.quizQuestions, dispatch]);

  const getAnswerReview = useCallback(async (questionId: string) => {
    const question = state.quizQuestions.find((q) => q.id === questionId);
    if (!question || !question.userAnswer || !state.settings.apiKey) return;

    const prompt = getAnswerReviewPrompt(
      question.question,
      question.correctAnswer || '',
      question.userAnswer,
      question.explanation || ''
    );

    await sendMessage(
      [{ id: generateId(), role: 'user', content: prompt, timestamp: Date.now() }],
      state.settings.apiKey,
      state.settings.provider,
      '你是一位专业的点评老师，擅长分析学生的答案并提供有针对性的反馈。',
      {
        onChunk: () => {},
        onComplete: (response) => {
          dispatch({
            type: 'UPDATE_QUIZ_QUESTION',
            payload: {
              id: questionId,
              updates: { explanation: response },
            },
          });
        },
        onError: (error) => {
          console.error('获取点评失败:', error);
        },
      },
      state.settings.customConfig
    );
  }, [state.quizQuestions, state.settings, dispatch]);

  return {
    questions: state.quizQuestions,
    isGenerating: state.isGeneratingQuiz,
    generateQuiz,
    submitAnswer,
    checkAnswer,
    getAnswerReview,
  };
}