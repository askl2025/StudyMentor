import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, Send, Eye } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import { useQuiz } from '../../hooks/useQuiz';
import Button from '../../components/ui/Button';

interface ChoiceQuestionProps {
  question: QuizQuestion;
}

export default function ChoiceQuestion({ question }: ChoiceQuestionProps) {
  const { submitAnswer, checkAnswer, getAnswerReview } = useQuiz();
  const [selected, setSelected] = useState<string | null>(question.userAnswer || null);
  const [submitted, setSubmitted] = useState(question.isCorrect !== undefined);
  const [showExplanation, setShowExplanation] = useState(!!question.explanation);

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
    submitAnswer(question.id, option);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    checkAnswer(question.id);
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
    getAnswerReview(question.id);
  };

  const optionKeys = ['A', 'B', 'C', 'D'];

  return (
    <div className="mt-4 space-y-3">
      {/* 选项列表 */}
      <div className="space-y-2">
        {question.options && optionKeys.map((key) => {
          const value = question.options?.[key as keyof typeof question.options];
          if (!value) return null;

          const isSelected = selected === key;
          const isCorrect = key === question.correctAnswer;
          const showResult = submitted;

          // 确定样式
          let optionStyle = 'border-accent/10 bg-white/50 hover:border-accent/30 hover:bg-accent/5';
          let iconStyle = 'bg-accent/10 text-accent';
          let iconContent = key;

          if (showResult) {
            if (isCorrect) {
              optionStyle = 'border-correct bg-correct/10';
              iconStyle = 'bg-correct text-white';
              iconContent = '✓';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'border-error bg-error/10';
              iconStyle = 'bg-error text-white';
              iconContent = '✗';
            } else {
              optionStyle = 'border-accent/10 bg-white/30 opacity-60';
            }
          } else if (isSelected) {
            optionStyle = 'border-accent bg-accent/10 shadow-sm';
            iconStyle = 'bg-accent text-white';
          }

          return (
            <motion.button
              key={key}
              className={`w-full text-left p-3 rounded-xl border ${optionStyle} transition-all duration-200 flex items-center gap-3`}
              onClick={() => handleSelect(key)}
              whileHover={!submitted ? { scale: 1.01, y: -1 } : undefined}
              whileTap={!submitted ? { scale: 0.99 } : undefined}
              layout
            >
              <motion.span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${iconStyle} flex-shrink-0`}
                animate={showResult && isCorrect ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {showResult && isCorrect ? (
                  <Check className="w-4 h-4" />
                ) : showResult && isSelected && !isCorrect ? (
                  <X className="w-4 h-4" />
                ) : (
                  iconContent
                )}
              </motion.span>
              <span className="text-sm text-text">{value}</span>
            </motion.button>
          );
        })}
      </div>

      {/* 提交按钮 */}
      {!submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!selected}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            提交答案
          </Button>
        </motion.div>
      )}

      {/* 结果反馈 */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* 正确/错误提示 */}
            <motion.div
              className={`p-4 rounded-xl ${question.isCorrect
                ? 'bg-correct/10 border border-correct/20'
                : 'bg-error/10 border border-error/20'
              }`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${question.isCorrect ? 'bg-correct/20' : 'bg-error/20'
                  }`}
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {question.isCorrect ? (
                    <Check className="w-5 h-5 text-correct" />
                  ) : (
                    <X className="w-5 h-5 text-error" />
                  )}
                </motion.div>
                <div>
                  <p className={`font-semibold ${question.isCorrect ? 'text-correct' : 'text-error'}`}>
                    {question.isCorrect ? '回答正确！' : '回答错误'}
                  </p>
                  {!question.isCorrect && (
                    <p className="text-sm text-text/70 mt-1">
                      正确答案是: <span className="font-medium text-correct">{question.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 解析 */}
            {showExplanation && question.explanation && (
              <motion.div
                className="p-4 rounded-xl bg-accent/5 border border-accent/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-text">解析</span>
                </div>
                <p className="text-sm text-text/70 leading-relaxed">{question.explanation}</p>
              </motion.div>
            )}

            {/* 查看解析按钮 */}
            {!question.isCorrect && !showExplanation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowExplanation}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  查看详细解析
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}