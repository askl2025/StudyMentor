import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Bot, Gauge, Lightbulb, MessageCircle, Brain } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SettingsPanel() {
  const { settings, updateSettings, loadStoredSettings } = useSettings();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [provider, setProvider] = useState(settings.provider);
  const [guidanceLevel, setGuidanceLevel] = useState(settings.guidanceLevel);

  useEffect(() => {
    loadStoredSettings();
  }, []);

  useEffect(() => {
    setApiKey(settings.apiKey);
    setProvider(settings.provider);
    setGuidanceLevel(settings.guidanceLevel);
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      apiKey,
      provider,
      guidanceLevel,
    });
  };

  const guidanceLevels = [
    {
      value: 'gentle' as const,
      label: '温和模式',
      desc: '提供更多提示和帮助，适合初学者',
      icon: Lightbulb,
      emoji: '😊',
      features: [
        '给出相关概念的定义',
        '提供接近直接的提示',
        '在困惑时给予更多帮助',
        '使用例子和类比帮助理解',
      ],
      example: '学生：这个公式怎么用？\n导师：这个公式是用于计算...，你可以这样理解...',
    },
    {
      value: 'moderate' as const,
      label: '适中模式',
      desc: '引导思考，适度提示，适合大多数学习场景',
      icon: MessageCircle,
      emoji: '🤔',
      features: [
        '给出思考方向和框架',
        '不给具体步骤',
        '通过提问引导思考',
        '适时给予提示',
      ],
      example: '学生：这个公式怎么用？\n导师：你觉得这个公式适用于什么情况？先想想它的使用条件。',
    },
    {
      value: 'strict' as const,
      label: '严格模式',
      desc: '纯粹苏格拉底式提问，适合深入理解',
      icon: Brain,
      emoji: '🧐',
      features: [
        '只进行苏格拉底式反问',
        '不提供任何增量信息',
        '要求学生自己思考',
        '通过连续提问引导',
      ],
      example: '学生：这个公式怎么用？\n导师：你为什么想知道这个公式？你遇到了什么问题？',
    },
  ];

  return (
    <div className="max-w-lg mx-auto py-8">
      <Card variant="glass">
        <div className="text-center mb-6">
          <motion.div
            className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Settings className="w-8 h-8 text-accent" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text mb-2">欢迎使用 StudyMentor</h2>
          <p className="text-text/60">配置你的AI导师，开始高效学习</p>
        </div>

        <div className="space-y-6">
          {/* AI模型选择 */}
          <div>
            <label className="block text-sm font-medium text-text mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI模型选择
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`p-4 rounded-xl border text-left transition-all ${
                  provider === 'claude'
                    ? 'border-accent bg-accent/10 shadow-sm'
                    : 'border-accent/20 bg-white/50 hover:border-accent/40'
                }`}
                onClick={() => setProvider('claude')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${provider === 'claude' ? 'bg-accent' : 'bg-accent/30'}`} />
                  <p className="font-medium text-text">Claude</p>
                </div>
                <p className="text-xs text-text/60">推荐，逻辑推理最强</p>
              </button>
              <button
                className={`p-4 rounded-xl border text-left transition-all ${
                  provider === 'kimi'
                    ? 'border-accent bg-accent/10 shadow-sm'
                    : 'border-accent/20 bg-white/50 hover:border-accent/40'
                }`}
                onClick={() => setProvider('kimi')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${provider === 'kimi' ? 'bg-accent' : 'bg-accent/30'}`} />
                  <p className="font-medium text-text">Kimi</p>
                </div>
                <p className="text-xs text-text/60">国产首选，长文本优秀</p>
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
            />
            <p className="mt-1.5 text-xs text-text/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-correct rounded-full" />
              密钥仅存储在本地浏览器，不会上传到任何服务器
            </p>
          </div>

          {/* 引导程度 */}
          <div>
            <label className="block text-sm font-medium text-text mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              引导程度
            </label>
            <div className="space-y-3">
              {guidanceLevels.map((level) => {
                return (
                  <button
                    key={level.value}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      guidanceLevel === level.value
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : 'border-accent/20 bg-white/50 hover:border-accent/40'
                    }`}
                    onClick={() => setGuidanceLevel(level.value)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{level.emoji}</span>
                      <div>
                        <p className="font-medium text-text">{level.label}</p>
                        <p className="text-xs text-text/60">{level.desc}</p>
                      </div>
                    </div>
                    {guidanceLevel === level.value && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-accent/20"
                      >
                        <p className="text-xs text-text/70 mb-2">特点：</p>
                        <ul className="text-xs text-text/60 space-y-1">
                          {level.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="w-1 h-1 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 p-2 bg-accent/5 rounded-lg">
                          <p className="text-xs text-text/50 mb-1">对话示例：</p>
                          <p className="text-xs text-text/70 whitespace-pre-line">{level.example}</p>
                        </div>
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg" disabled={!apiKey.trim()}>
            保存设置并开始学习
          </Button>
        </div>
      </Card>
    </div>
  );
}