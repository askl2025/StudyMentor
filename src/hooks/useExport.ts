import { useCallback } from 'react';
import { useApp } from '../stores/AppContext';

export function useExport() {
  const { state, dispatch } = useApp();

  const exportToText = useCallback(() => {
    let content = 'StudyMentor 学习记录\n';
    content += '='.repeat(50) + '\n\n';

    if (state.uploadedFile) {
      content += `学习材料: ${state.uploadedFile.name}\n`;
      content += `类型: ${state.uploadedFile.type.toUpperCase()}\n`;
      if (state.uploadedFile.pageCount) {
        content += `页数: ${state.uploadedFile.pageCount}\n`;
      }
      content += '\n';
    }

    if (state.messages.length > 0) {
      content += '对话记录\n';
      content += '-'.repeat(30) + '\n\n';

      state.messages.forEach((message) => {
        const role = message.role === 'user' ? '学生' : 'AI导师';
        const time = new Date(message.timestamp).toLocaleString('zh-CN');
        content += `[${time}] ${role}:\n`;
        content += message.content + '\n\n';
      });
    }

    if (state.quizQuestions.length > 0) {
      content += '练习题记录\n';
      content += '-'.repeat(30) + '\n\n';

      state.quizQuestions.forEach((question, index) => {
        content += `题目 ${index + 1}: ${question.question}\n`;

        if (question.type === 'choice' && question.options) {
          content += '选项:\n';
          Object.entries(question.options).forEach(([key, value]) => {
            content += `  ${key}. ${value}\n`;
          });
        }

        if (question.userAnswer) {
          content += `学生答案: ${question.userAnswer}\n`;
        }

        if (question.correctAnswer) {
          content += `正确答案: ${question.correctAnswer}\n`;
        }

        if (question.isCorrect !== undefined) {
          content += `结果: ${question.isCorrect ? '正确 ✓' : '错误 ✗'}\n`;
        }

        if (question.explanation) {
          content += `解析: ${question.explanation}\n`;
        }

        content += '\n';
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymmentor-record-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  const exportToJSON = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      settings: state.settings,
      uploadedFile: state.uploadedFile ? {
        name: state.uploadedFile.name,
        type: state.uploadedFile.type,
        pageCount: state.uploadedFile.pageCount,
        title: state.uploadedFile.title,
      } : null,
      messages: state.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
      quizQuestions: state.quizQuestions.map(q => ({
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect,
        explanation: q.explanation,
      })),
      statistics: {
        totalQuestions: state.quizQuestions.length,
        answeredQuestions: state.quizQuestions.filter(q => q.isCorrect !== undefined).length,
        correctAnswers: state.quizQuestions.filter(q => q.isCorrect === true).length,
        totalMessages: state.messages.length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymmentor-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  const clearAll = useCallback(() => {
    if (confirm('确定要清除所有记录吗？此操作不可撤销。')) {
      dispatch({ type: 'CLEAR_ALL' });
    }
  }, [dispatch]);

  const clearMessages = useCallback(() => {
    if (confirm('确定要清除对话记录吗？')) {
      dispatch({ type: 'SET_MESSAGES', payload: [] });
    }
  }, [dispatch]);

  const clearQuiz = useCallback(() => {
    if (confirm('确定要清除习题记录吗？')) {
      dispatch({ type: 'SET_QUIZ_QUESTIONS', payload: [] });
    }
  }, [dispatch]);

  return {
    exportToText,
    exportToJSON,
    clearAll,
    clearMessages,
    clearQuiz,
  };
}