# KnowNote

**KnowNote 是一个本地优先的知识笔记工具，把你的 PDF、文档和网页转化为可提问、可引用、可追溯的个人知识库。**

Instead of treating PDFs, notes, and links as static files, KnowNote turns them into a structured, searchable, and questionable knowledge base. By combining document parsing, vector search, and retrieval-augmented generation (RAG), KnowNote helps you understand, connect, and reuse information — not just store it.

## 核心特性

- **本地优先**: 所有数据存储在本地，完全掌控你的知识资产
- **多格式支持**: PDF、Markdown、Word 文档、PowerPoint、网页链接
- **智能问答**: 基于 RAG 技术，可以向你的文档提问并获得引用来源
- **向量检索**: 使用 sqlite-vec 进行高效的语义搜索
- **可追溯**: 每个答案都能追溯到原始文档的具体位置

## 技术栈

- **前端**: React + TypeScript + TailwindCSS
- **桌面框架**: Electron
- **数据库**: SQLite + sqlite-vec (向量检索)
- **ORM**: Drizzle ORM
- **文档解析**: pdfjs-dist, mammoth, officeparser
- **构建工具**: Vite + electron-vite

## 开发环境设置

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建应用

```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

## 数据库管理

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 推送 schema 变更
pnpm db:push

# 打开 Drizzle Studio
pnpm db:studio
```

## 项目结构

```plaintext
knownote/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── db/         # 数据库配置和 schema
│   │   ├── services/   # 核心业务逻辑
│   │   └── providers/  # LLM 提供商管理
│   ├── renderer/       # React 渲染进程
│   └── shared/         # 共享代码
├── build/              # 构建资源
└── out/                # 编译输出
```

## 推荐 IDE 配置

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## License

GPL-3.0
