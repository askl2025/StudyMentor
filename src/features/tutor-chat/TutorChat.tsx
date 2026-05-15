import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, HelpCircle, CheckCircle, RefreshCw, BookOpen } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useApp } from '../../stores/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TutorChat() {
  const { messages, isLoading, isStreaming, sendChatMessage } = useChat();
  const { state } = useApp();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendChatMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: HelpCircle, label: '给我一点提示', prompt: '我有点困惑，能给我一个提示吗？' },
    { icon: Sparkles, label: '直接告诉我答案', prompt: '我想了很久还是不明白，能直接告诉我答案吗？' },
    { icon: CheckCircle, label: '我理解了，继续', prompt: '我理解了这个概念，请继续下一步。' },
    { icon: RefreshCw, label: '换个方式解释', prompt: '能换个方式解释一下吗？我没能理解。' },
  ];

  const isLastMessageStreaming = isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <Card variant="glass" className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent" />
          AI导师
        </h2>
        {state.uploadedFile && (
          <span className="text-xs text-text/60 bg-accent/10 px-2 py-1 rounded flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {state.uploadedFile.title}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin mb-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bot className="w-6 h-6 text-accent" />
            </motion.div>
            <h3 className="text-base font-medium text-text mb-1">你好！我是你的AI导师</h3>
            <p className="text-text/60 text-sm max-w-xs">
              {state.uploadedFile
                ? '我已经阅读了你的学习材料，有什么问题都可以问我。我会引导你思考，而不是直接告诉你答案。'
                : '请先上传学习材料，然后我们开始学习。'}
            </p>
            {state.uploadedFile && (
              <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-xs">
                {quickActions.slice(0, 2).map((action) => (
                  <button
                    key={action.label}
                    className="flex items-center gap-2 px-3 py-2 text-xs bg-accent/5 hover:bg-accent/10 text-text rounded-lg transition-colors"
                    onClick={() => sendChatMessage(action.prompt)}
                  >
                    <action.icon className="w-4 h-4 text-accent" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-white/80 text-text border border-accent/10'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:rounded">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      {isLastMessageStreaming && index === messages.length - 1 && (
                        <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5" />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isLoading && !isStreaming && messages[messages.length - 1]?.role === 'user' && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-white/80 rounded-2xl px-4 py-3 border border-accent/10">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent/5 hover:bg-accent/10 text-text rounded-full transition-colors"
              onClick={() => sendChatMessage(action.prompt)}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={state.uploadedFile ? '输入你的问题...' : '请先上传学习材料...'}
          className="flex-1 px-4 py-3 rounded-xl border border-accent/20 bg-white/50 text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none min-h-[48px] max-h-[120px]"
          rows={1}
          disabled={!state.uploadedFile || isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || !state.uploadedFile || isLoading}
          className="px-4 self-end"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
}