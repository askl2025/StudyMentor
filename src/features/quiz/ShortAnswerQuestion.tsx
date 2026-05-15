import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, HelpCircle, CheckCircle, PenTool, Eye, RefreshCw } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import { useQuiz } from '../../hooks/useQuiz';
import Button from '../../components/ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ShortAnswerQuestionProps {
  question: QuizQuestion;
}

export default function ShortAnswerQuestion({ question }: ShortAnswerQuestionProps) {
  const { submitAnswer, getAnswerReview } = useQuiz();
  const [answer, setAnswer] = useState(question.userAnswer || '');
  const [submitted, setSubmitted] = useState(!!question.userAnswer);
  const [showReview, setShowReview] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [answer]);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    submitAnswer(question.id, answer);
    setSubmitted(true);
  };

  const handleShowReview = async () => {
    setShowReview(true);
    setIsLoadingReview(true);
    await getAnswerReview(question.id);
    setIsLoadingReview(false);
  };

  const handleRetry = () => {
    setSubmitted(false);
    setShowReview(false);
    setAnswer('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的答案... (Ctrl+Enter 提交)"
                className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-white/50 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none min-h-[80px] max-h-[150px]"
                rows={3}
              />
              <div className="absolute bottom-2 right-2 text-xs text-text/40">
                {answer.length > 0 && `${answer.length} 字`}
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={!answer.trim()} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              提交答案
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* 学生答案 */}
            <motion.div
              className="p-4 rounded-xl bg-accent/5 border border-accent/10"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text">你的答案</span>
              </div>
              <p className="text-sm text-text/80 whitespace-pre-wrap leading-relaxed">{question.userAnswer}</p>
            </motion.div>

            {/* 参考答案 */}
            {question.correctAnswer && (
              <motion.div
                className="p-4 rounded-xl bg-correct/5 border border-correct/10"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-correct" />
                  <span className="text-sm font-medium text-text">参考答案</span>
                </div>
                <p className="text-sm text-text/80 whitespace-pre-wrap leading-relaxed">{question.correctAnswer}</p>
              </motion.div>
            )}

            {/* AI点评 */}
            <AnimatePresence>
              {showReview && question.explanation && (
                <motion.div
                  className="p-4 rounded-xl bg-accent/5 border border-accent/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-text">AI点评</span>
                  </div>
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-strong:text-accent">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {question.explanation}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              {!showReview && (
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShowReview}
                    disabled={isLoadingReview}
                    className="w-full"
                  >
                    {isLoadingReview ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        正在生成点评...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        获取AI点评
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
              <motion.div
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新作答
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}