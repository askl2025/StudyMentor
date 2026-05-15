# StudyMentor

AI驱动的大学生自学辅导工具

## 功能特性

- 📄 支持PDF/PPTX文件上传与解析
- 🤖 苏格拉底式AI导师对话
- 📝 智能习题生成与交互
- 🎯 三档引导程度控制（温和/适中/严格）
- ✨ 毛玻璃质感UI设计
- 💾 本地会话存储与导出

## 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- pdfjs-dist + pptx2json
- Claude API / Kimi API

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署

项目可直接部署到Vercel：

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 自动部署完成

## 使用说明

1. 上传课程PPT或PDF文件
2. 配置API Key（Claude或Kimi）
3. 与AI导师对话学习
4. 生成练习题巩固知识
5. 导出学习记录