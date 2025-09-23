# BeautifulLips - AI唇部美学设计 💄✨

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.180.0-000000?logo=three.js)](https://threejs.org/)

**为美容医生和患者打造的AI驱动唇部美学设计平台**

</div>

## 🎯 项目简介

BeautifulLips 是一款专为美容医生和患者设计的AI驱动唇部美学设计Web应用。通过先进的人工智能技术，用户可以上传照片预览不同的唇部美容效果，获得专业的美学建议，并进行3D立体预览。

### ✨ 核心功能

- 🤖 **AI智能分析**: 自动检测照片合规性并提取唇部特写
- 🎨 **多样化风格**: 13种预设风格（自然丰唇、M唇塑形、性感厚唇等）
- 📸 **实时预览**: 支持照片上传和实时拍摄
- 🔮 **3D立体预览**: 生成唇部3D模型进行立体展示
- 🎯 **九宫格设计**: 一键生成9种不同风格的设计方案
- 💾 **设计管理**: 保存收藏、模板系统、历史记录
- 👁️ **多视图模式**: 特写和全脸视图切换
- ✂️ **手动调整**: 支持手动裁剪和调整唇部区域
- 📱 **响应式设计**: 完美适配桌面端和移动端

### 🛠️ 技术栈

- **前端框架**: React 19.1.1 + TypeScript 5.8.2
- **构建工具**: Vite 6.2.0
- **3D渲染**: Three.js 0.180.0 + React Three Fiber
- **AI服务**: Google Gemini AI API
- **样式**: CSS Variables + 响应式设计
- **开发环境**: Node.js 21+ + npm 10+

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0+ (推荐 21.7.3+)
- **npm**: 9.0+ (推荐 10.5.0+)
- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+

### 🔧 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/sooogooo/webapp-beautiful-lips.git
   cd webapp-beautiful-lips
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   创建 `.env.local` 文件并添加你的 Gemini API 密钥：
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   > 💡 **获取 Gemini API 密钥**: 
   > 1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
   > 2. 登录你的 Google 账户
   > 3. 创建新的 API 密钥
   > 4. 复制密钥并粘贴到 `.env.local` 文件中

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问: http://localhost:3000

## 📋 使用指南

### 基础操作流程

1. **上传照片**
   - 点击"上传"按钮选择照片文件
   - 或点击"拍摄"使用摄像头实时拍照
   - AI会自动检测照片合规性并提取唇部特写

2. **选择设计风格**
   - 在"设计"面板中选择预设风格
   - 或使用自定义提示词描述期望效果
   - 查看AI推荐的个性化建议

3. **预览效果**
   - 查看设计前后对比
   - 切换特写和全脸视图
   - 使用滑块调整对比度

4. **保存和分享**
   - 收藏喜欢的设计
   - 导出高质量图片
   - 生成3D模型预览

### 高级功能

#### 🎨 风格预设
- **自然丰唇**: 轻微增加双唇体积，效果自然柔和
- **M唇塑形**: 塑造清晰的M形唇峰，增添精致感
- **微笑唇角**: 轻微上扬嘴角，打造甜美表情
- **性感厚唇**: 显著增加双唇饱满度
- **花瓣唇**: 下唇饱满，上唇唇珠突出
- **俄式芭比唇**: 增加唇部垂直高度，精致平坦
- **好莱坞经典唇**: 轮廓分明，色彩饱满
- 更多13种专业风格...

#### 🔮 3D预览功能
- 生成真实感唇部3D模型
- 360度旋转查看效果
- 导出3D模型文件（GLB/OBJ格式）

#### 📐 九宫格设计
- 一键生成9种不同风格方案
- 批量导出所有设计
- 快速对比多种效果

#### 📚 模板系统
- 保存常用设计为模板
- 导入/导出模板配置
- 团队协作模板共享

## 🏗️ 项目结构

```
webapp-beautiful-lips/
├── components/
│   └── icons.tsx           # 图标组件库
├── services/
│   └── geminiService.ts    # Gemini AI 服务集成
├── App.tsx                 # 主应用组件
├── types.ts                # TypeScript 类型定义
├── index.tsx               # 应用入口点
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖和脚本
└── README.md               # 项目文档
```

## 🛠️ 开发指南

### 可用脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 开发环境配置

推荐使用 WSL (Windows Subsystem for Linux) 进行开发：

```bash
# 使用 WSL Ubuntu 22.04
wsl node --version  # v21.7.3+
wsl npm --version   # v10.5.0+
```

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 React Hooks 最佳实践
- 组件采用函数式编程风格
- 使用 CSS Variables 实现主题系统

## 🚀 部署指南

### Vercel 部署 (推荐)

1. **连接 GitHub**
   - 访问 [Vercel](https://vercel.com)
   - 使用 GitHub 账户登录
   - 导入 `webapp-beautiful-lips` 仓库

2. **配置环境变量**
   
   在 Vercel 项目设置中添加：
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **部署配置**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

4. **自动部署**
   
   每次推送到 `main` 分支将自动触发部署

### Netlify 部署

1. **构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **环境变量**
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Docker 部署

```dockerfile
FROM node:21-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
# 构建镜像
docker build -t beautiful-lips .

# 运行容器
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key beautiful-lips
```

## 🔒 安全注意事项

- **API 密钥保护**: 绝不在客户端代码中硬编码 API 密钥
- **环境变量**: 使用 `.env.local` 文件存储敏感信息
- **HTTPS**: 生产环境必须使用 HTTPS 协议
- **图片处理**: 上传的图片仅在客户端处理，不会上传到服务器

## 🐛 故障排除

### 常见问题

**Q: API 调用失败？**
A: 检查 Gemini API 密钥是否正确配置，确保账户有足够的 API 配额。

**Q: 照片上传后显示不合规？**
A: 确保照片包含清晰的人脸和唇部，避免模糊、遮挡或多人照片。

**Q: 3D 模型加载失败？**
A: 检查浏览器是否支持 WebGL，尝试更新浏览器到最新版本。

**Q: 移动端体验异常？**
A: 确保使用现代移动浏览器，iOS Safari 14+ 或 Android Chrome 90+。

### 调试模式

```bash
# 启用详细日志
DEBUG=true npm run dev
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Google Gemini AI](https://ai.google.dev/) - 提供强大的AI图像处理能力
- [Three.js](https://threejs.org/) - 3D图形渲染引擎
- [React](https://reactjs.org/) - 用户界面框架
- [Vite](https://vitejs.dev/) - 快速构建工具

## 📞 联系我们

- **项目仓库**: https://github.com/sooogooo/webapp-beautiful-lips
- **问题反馈**: [GitHub Issues](https://github.com/sooogooo/webapp-beautiful-lips/issues)
- **作者**: sooogooo

---

<div align="center">

**让AI为你的美丽加分！** ✨

</div>
