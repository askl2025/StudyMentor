import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Bot, Gauge, Link, Cpu } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import type { ModelProvider, CustomModelConfig } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const providers: { value: ModelProvider; label: string; desc: string; badge?: string }[] = [
  { value: 'claude', label: 'Claude', desc: 'Anthropic，逻辑推理最强', badge: '推荐' },
  { value: 'openai', label: 'OpenAI', desc: 'GPT-4o 系列，综合能力强' },
  { value: 'gemini', label: 'Gemini', desc: 'Google，免费额度大', badge: '免费' },
  { value: 'deepseek', label: 'DeepSeek', desc: '国产开源，性价比高', badge: '便宜' },
  { value: 'kimi', label: 'Kimi', desc: 'Moonshot，长文本优秀' },
  { value: 'glm', label: 'GLM', desc: '智谱AI，中文优化' },
  { value: 'custom', label: '自定义', desc: '兼容 OpenAI 格式的第三方服务' },
];

const guidanceLevels = [
  {
    value: 'gentle' as const,
    label: '温和模式',
    desc: '提供更多提示和帮助，适合初学者',
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

const apiKeyPlaceholders: Record<string, string> = {
  claude: 'sk-ant-api03-...',
  openai: 'sk-proj-...',
  gemini: 'AIza...',
  deepseek: 'sk-...',
  kimi: 'sk-...',
  glm: '...',
  custom: '你的 API Key',
};

export default function SettingsPanel() {
  const { settings, updateSettings, loadStoredSettings } = useSettings();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [provider, setProvider] = useState<ModelProvider>(settings.provider);
  const [guidanceLevel, setGuidanceLevel] = useState(settings.guidanceLevel);
  const [customConfig, setCustomConfig] = useState<CustomModelConfig>(
    settings.customConfig || { baseUrl: '', modelName: '' }
  );

  useEffect(() => {
    loadStoredSettings();
  }, []);

  useEffect(() => {
    setApiKey(settings.apiKey);
    setProvider(settings.provider);
    setGuidanceLevel(settings.guidanceLevel);
    if (settings.customConfig) setCustomConfig(settings.customConfig);
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      apiKey,
      provider,
      guidanceLevel,
      customConfig: provider === 'custom' ? customConfig : undefined,
    });
  };

  const isCustomValid = provider === 'custom'
    ? apiKey.trim() && customConfig.baseUrl.trim() && customConfig.modelName.trim()
    : apiKey.trim();

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
            <div className="grid grid-cols-2 gap-2">
              {providers.map((p) => (
                <button
                  key={p.value}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === p.value
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-accent/20 bg-white/50 hover:border-accent/40'
                  }`}
                  onClick={() => setProvider(p.value)}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${provider === p.value ? 'bg-accent' : 'bg-accent/30'}`} />
                    <p className="font-medium text-sm text-text">{p.label}</p>
                    {p.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text/60 pl-[18px]">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义模型配置 */}
          {provider === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 p-4 rounded-xl bg-accent/5 border border-accent/10"
            >
              <p className="text-xs text-text/70 mb-2">
                支持所有兼容 OpenAI 格式的 API，如 Ollama、vLLM、第三方转发等
              </p>
              <div>
                <label className="block text-xs font-medium text-text mb-1.5 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5" />
                  API 地址 (Base URL)
                </label>
                <Input
                  value={customConfig.baseUrl}
                  onChange={(e) => setCustomConfig({ ...customConfig, baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                />
                <p className="mt-1 text-[10px] text-text/40">
                  自动补全 /chat/completions，也可填写完整地址
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  模型名称 (Model)
                </label>
                <Input
                  value={customConfig.modelName}
                  onChange={(e) => setCustomConfig({ ...customConfig, modelName: e.target.value })}
                  placeholder="gpt-4o / llama3 / qwen-turbo"
                />
              </div>
            </motion.div>
          )}

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
              placeholder={apiKeyPlaceholders[provider] || 'sk-...'}
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
            <div className="space-y-2">
              {guidanceLevels.map((level) => (
                <button
                  key={level.value}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    guidanceLevel === level.value
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-accent/20 bg-white/50 hover:border-accent/40'
                  }`}
                  onClick={() => setGuidanceLevel(level.value)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{level.emoji}</span>
                    <div>
                      <p className="font-medium text-sm text-text">{level.label}</p>
                      <p className="text-xs text-text/60">{level.desc}</p>
                    </div>
                  </div>
                  {guidanceLevel === level.value && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-accent/20"
                    >
                      <ul className="text-xs text-text/60 space-y-1 mb-2">
                        {level.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1 h-1 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="p-2 bg-accent/5 rounded-lg">
                        <p className="text-[10px] text-text/50 mb-1">示例：</p>
                        <p className="text-xs text-text/70 whitespace-pre-line">{level.example}</p>
                      </div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg" disabled={!isCustomValid}>
            保存设置并开始学习
          </Button>
        </div>
      </Card>
    </div>
  );
}