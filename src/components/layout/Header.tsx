import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Gauge, ChevronDown, Download, Trash2, FileText, FileJson } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { useExport } from '../../hooks/useExport';
import Button from '../ui/Button';
import SettingsPanel from '../../features/settings/SettingsPanel';

const guidanceLevels = [
  { value: 'gentle' as const, label: '温和', desc: '提供更多提示和帮助', emoji: '😊' },
  { value: 'moderate' as const, label: '适中', desc: '引导思考，适度提示', emoji: '🤔' },
  { value: 'strict' as const, label: '严格', desc: '纯粹苏格拉底式提问', emoji: '🧐' },
];

export default function Header() {
  const { settings, updateSettings } = useSettings();
  const { exportToText, exportToJSON, clearAll, clearMessages, clearQuiz } = useExport();
  const [showSettings, setShowSettings] = useState(false);
  const [showGuidanceMenu, setShowGuidanceMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClearMenu, setShowClearMenu] = useState(false);

  const currentLevel = guidanceLevels.find(l => l.value === settings.guidanceLevel);

  return (
    <>
      <motion.header
        className="glass-effect sticky top-0 z-50 px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-text">StudyMentor</h1>
            <span className="text-sm text-text/70 hidden sm:block">AI驱动的自学辅导工具</span>
          </div>

          <div className="flex items-center gap-3">
            {settings.apiKey && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-correct rounded-full animate-pulse" />
                  <span className="text-sm text-text/70 hidden sm:block">API已连接</span>
                </div>

                {/* 快速切换引导程度 */}
                <div className="relative">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent/10 hover:bg-accent/20 text-text rounded-lg transition-colors"
                    onClick={() => setShowGuidanceMenu(!showGuidanceMenu)}
                  >
                    <Gauge className="w-4 h-4" />
                    <span className="hidden sm:block">{currentLevel?.emoji} {currentLevel?.label}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {showGuidanceMenu && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-accent/20 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {guidanceLevels.map((level) => (
                          <button
                            key={level.value}
                            className={`w-full px-4 py-3 text-left hover:bg-accent/5 transition-colors ${
                              settings.guidanceLevel === level.value ? 'bg-accent/10' : ''
                            }`}
                            onClick={() => {
                              updateSettings({ guidanceLevel: level.value });
                              setShowGuidanceMenu(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span>{level.emoji}</span>
                              <div>
                                <p className="text-sm font-medium text-text">{level.label}</p>
                                <p className="text-xs text-text/60">{level.desc}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* 设置按钮 */}
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-1" />
              <span className="hidden sm:block">设置</span>
            </Button>

            {/* 导出菜单 */}
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowExportMenu(!showExportMenu)}>
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:block">导出</span>
              </Button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-accent/20 overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-accent/5 transition-colors flex items-center gap-2"
                      onClick={() => {
                        exportToText();
                        setShowExportMenu(false);
                      }}
                    >
                      <FileText className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-text">导出为TXT</p>
                        <p className="text-xs text-text/60">纯文本格式</p>
                      </div>
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-accent/5 transition-colors flex items-center gap-2"
                      onClick={() => {
                        exportToJSON();
                        setShowExportMenu(false);
                      }}
                    >
                      <FileJson className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-text">导出为JSON</p>
                        <p className="text-xs text-text/60">结构化数据</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 清除菜单 */}
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowClearMenu(!showClearMenu)}>
                <Trash2 className="w-4 h-4 mr-1" />
                <span className="hidden sm:block">清除</span>
              </Button>

              <AnimatePresence>
                {showClearMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-accent/20 overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-accent/5 transition-colors"
                      onClick={() => {
                        clearMessages();
                        setShowClearMenu(false);
                      }}
                    >
                      <p className="text-sm font-medium text-text">清除对话</p>
                      <p className="text-xs text-text/60">仅清除聊天记录</p>
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-accent/5 transition-colors"
                      onClick={() => {
                        clearQuiz();
                        setShowClearMenu(false);
                      }}
                    >
                      <p className="text-sm font-medium text-text">清除习题</p>
                      <p className="text-xs text-text/60">仅清除练习题</p>
                    </button>
                    <div className="border-t border-accent/10" />
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-error/5 transition-colors"
                      onClick={() => {
                        clearAll();
                        setShowClearMenu(false);
                      }}
                    >
                      <p className="text-sm font-medium text-error">清除所有</p>
                      <p className="text-xs text-text/60">清除所有数据</p>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 点击外部关闭菜单 */}
      {(showGuidanceMenu || showExportMenu || showClearMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowGuidanceMenu(false);
            setShowExportMenu(false);
            setShowClearMenu(false);
          }}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="relative">
              <button
                className="absolute top-4 right-4 text-text/50 hover:text-text z-10"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
              <SettingsPanel />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}