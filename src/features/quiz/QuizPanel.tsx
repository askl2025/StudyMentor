import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, FileText, RotateCcw, CheckCircle, XCircle, HelpCircle, ListChecks, PenTool } from 'lucide-react';
import { useApp } from '../../stores/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ChoiceQuestion from './ChoiceQuestion';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import { useQuiz } from '../../hooks/useQuiz';

export default function QuizPanel() {
  const { state, dispatch } = useApp();
  const { questions, isGenerating, generateQuiz } = useQuiz();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleChangeFile = () => {
    if (confirm('确定要更换学习材料吗？当前的对话和习题记录将被清除。')) {
      dispatch({ type: 'CLEAR_ALL' });
    }
  };

  const answeredCount = questions.filter(q => q.isCorrect !== undefined).length;
  const correctCount = questions.filter(q => q.isCorrect === true).length;
  const choiceCount = questions.filter(q => q.type === 'choice').length;
  const shortAnswerCount = questions.filter(q => q.type === 'short-answer').length;

  return (
    <Card variant="glass" className="h-full flex flex-col p-4 min-h-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            练习题
          </h2>
          {state.uploadedFile && (
            <span className="text-xs text-text/60 bg-accent/10 px-2 py-1 rounded flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {state.uploadedFile.title}
            </span>
          )}
        </div>
        <button
          className="text-xs text-text/60 hover:text-accent transition-colors flex items-center gap-1"
          onClick={handleChangeFile}
        >
          <RotateCcw className="w-3 h-3" />
          更换文件
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 space-y-4">
        {questions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <motion.div
              className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3"
              whileHover={{ scale: 1.1 }}
            >
              <BookOpen className="w-6 h-6 text-accent" />
            </motion.div>
            <h3 className="text-base font-medium text-text mb-1">开始练习</h3>
            <p className="text-text/60 text-xs mb-4 max-w-xs">
              AI根据学习材料生成针对性练习题
            </p>
            <Button onClick={generateQuiz} isLoading={isGenerating} size="sm">
              <ListChecks className="w-4 h-4 mr-1" />
              生成练习题
            </Button>
          </div>
        ) : (
          <>
            {/* 统计信息 */}
            <div className="bg-accent/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium text-text">共 {questions.length} 题</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text/60">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      选择 {choiceCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3 h-3" />
                      简答 {shortAnswerCount}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={generateQuiz} isLoading={isGenerating}>
                  <RotateCcw className="w-3 h-3 mr-1" />
                  重新生成
                </Button>
              </div>

              {answeredCount > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-text/60">
                    已答 {answeredCount}/{questions.length}
                  </span>
                  {correctCount > 0 && (
                    <span className="text-xs text-correct flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      正确 {correctCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 题目列表 */}
            <AnimatePresence>
              {questions.map((q, index) => {
                const isExpanded = expandedId === q.id;
                const isAnswered = q.isCorrect !== undefined;
                const isCorrect = q.isCorrect === true;

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`bg-white/60 rounded-xl border overflow-hidden transition-colors ${
                      isAnswered
                        ? isCorrect ? 'border-correct/30' : 'border-error/30'
                        : 'border-accent/10'
                    }`}>
                      <button
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/5 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                            isAnswered
                              ? isCorrect ? 'bg-correct/20 text-correct' : 'bg-error/20 text-error'
                              : 'bg-accent/10 text-accent'
                          }`}>
                            {isAnswered ? (
                              isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </span>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                              q.type === 'choice'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {q.type === 'choice' ? '选择' : '简答'}
                            </span>
                            <span className="text-sm text-text text-left truncate">{q.question}</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-text/40 flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text/40 flex-shrink-0 ml-2" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-accent/10">
                              {q.type === 'choice' ? (
                                <ChoiceQuestion question={q} />
                              ) : (
                                <ShortAnswerQuestion question={q} />
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}
      </div>
    </Card>
  );
}