<div align="center">

# KnowNote

**Transform your documents into an intelligent, conversational knowledge base**

[![GitHub release](https://img.shields.io/github/v/release/MrSibe/KnowNote)](https://github.com/MrSibe/KnowNote/releases)
[![GitHub stars](https://img.shields.io/github/stars/MrSibe/KnowNote)](https://github.com/MrSibe/KnowNote/stargazers)
[![License](https://img.shields.io/github/license/MrSibe/KnowNote)](https://github.com/MrSibe/KnowNote/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/MrSibe/KnowNote)](https://github.com/MrSibe/KnowNote/issues)

[简体中文](README.md) | [English](README_EN.md)

</div>

---

## About KnowNote

KnowNote is a **local-first** knowledge management tool inspired by Google NotebookLM. It transforms your PDFs, Word documents, PowerPoint presentations, and web pages into a queryable, citable, and traceable personal knowledge base.

Rather than treating files as static storage, KnowNote helps you build a structured, searchable, and conversational knowledge system. By combining document parsing, vector search, and Retrieval-Augmented Generation (RAG), KnowNote helps you understand, connect, and reuse information—not just store it.

### Core Advantages

- 🔒 **Local-First** - All data stored locally, complete privacy and security
- 🤖 **Custom LLM** - Support for OpenAI, Claude, local models, and more
- ⚡ **Lightweight & Fast** - Electron desktop app with quick startup and smooth response

---

## Preview

<div align="center">
  <img src="./.github/images/screenshot-main.png" alt="KnowNote Main Interface" width="800">
  <p><i>Three-column layout: Knowledge Library | Note Display | AI Q&A</i></p>
</div>

---

## Key Features

### 📚 Document Management

- **Multi-format Support**: PDF, Word (.docx), PowerPoint (.pptx), Web links
- **Smart Parsing**: Automatically extract document structure and key content
- **Structured Storage**: Fast and reliable SQLite local database

### 🤖 AI-Powered Q&A

- **RAG Technology**: Retrieval-Augmented Generation for more accurate AI responses
- **Multi-LLM Support**: Choose from OpenAI, Claude, local models, and more
- **Source Traceability**: Every answer traces back to the specific location in the original document

### 🔒 Local-First

- **Privacy Protection**: All data stored locally, complete control over your knowledge assets
- **Offline Capable**: Core features work without internet (AI chat requires API configuration)
- **Data Security**: No worries about data leaks or third-party access

### 🔍 Vector Search

- **Semantic Search**: Efficient vector retrieval using sqlite-vec
- **Smart Matching**: Quickly locate the most relevant document content
- **Precise Positioning**: Find the information you need in vast knowledge

### ⚡ Lightweight & Fast

- **Desktop App**: Built with Electron for native experience
- **Quick Response**: Optimized performance with smooth interaction
- **Cross-Platform**: Windows, macOS, and Linux support

---

## Roadmap

### ✅ Completed

- **AI LLM Conversation** - Integration with major LLM services
- **Note Generation** - Intelligent structured note generation
- **RAG Document Retrieval** - Vector-based semantic search
- **Multi-format Document Import**
  - PDF document parsing
  - Word documents (.docx)
  - PowerPoint presentations (.pptx)
  - Web content extraction

### 🚧 In Development

- **Quiz Generation** - Automatically generate test questions from documents
- **PPT Auto-Generation** - One-click presentation creation from notes

### 📋 Planned

More features are in the pipeline! Feel free to suggest ideas in [Issues](https://github.com/MrSibe/KnowNote/issues)!

---

## Quick Start

### User Installation

Download the latest version from [GitHub Releases](https://github.com/MrSibe/KnowNote/releases):

- **Windows**: `KnowNote-Setup-{version}.exe`
- **macOS**: `KnowNote-{version}.dmg` or `KnowNote-{version}-arm64.dmg` (Apple Silicon)
- **Linux**: `KnowNote-{version}.AppImage` or `.deb` package

### Developer Quick Start

**Prerequisites**

- Node.js 18+
- pnpm (recommended) or npm

**Installation & Run**

```bash
# Clone the repository
git clone https://github.com/MrSibe/KnowNote.git
cd KnowNote

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## Tech Stack

KnowNote is built with modern technologies to ensure performance and maintainability:

| Technology       | Purpose                                      |
| ---------------- | -------------------------------------------- |
| **Electron**     | Cross-platform desktop application framework |
| **React 19**     | Frontend UI framework                        |
| **TypeScript**   | Type-safe development experience             |
| **TailwindCSS**  | Atomic CSS framework                         |
| **Vite**         | Fast build tool                              |
| **SQLite**       | Lightweight local database                   |
| **sqlite-vec**   | Vector search extension                      |
| **Drizzle ORM**  | Type-safe database ORM                       |
| **pdfjs-dist**   | PDF document parsing                         |
| **mammoth**      | Word document parsing                        |
| **officeparser** | Office document parsing                      |
| **Tiptap**       | Rich text editor                             |

---

## Development Guide

<details>
<summary><b>📦 Build Application</b></summary>

```bash
# Build for Windows
pnpm build:win

# Build for macOS
pnpm build:mac

# Build for Linux
pnpm build:linux
```

Build artifacts will be output to the `dist/` directory.

</details>

<details>
<summary><b>🗄️ Database Management</b></summary>

KnowNote uses Drizzle ORM for database management:

```bash
# Generate migration files
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Push schema changes directly (dev environment)
pnpm db:push

# Open Drizzle Studio (visual database management)
pnpm db:studio
```

</details>

<details>
<summary><b>🔧 Code Quality</b></summary>

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm typecheck
```

</details>

---

## Project Structure

```plaintext
KnowNote/
├── src/
│   ├── main/              # Electron main process
│   │   ├── db/            # Database configuration and schema
│   │   ├── services/      # Core business logic (document parsing, RAG, etc.)
│   │   └── providers/     # LLM provider management
│   ├── renderer/          # React renderer process (frontend UI)
│   ├── preload/           # Electron preload scripts
│   └── shared/            # Shared code and type definitions
├── resources/             # Application resources (icons, etc.)
├── build/                 # Build configuration
└── out/                   # Build output
```

---

## Contributing

We welcome all forms of contributions! Whether it's reporting bugs, suggesting new features, or submitting code directly.

### How to Contribute

1. **Report Issues**: Submit bug reports or feature suggestions on the [Issues](https://github.com/MrSibe/KnowNote/issues) page
2. **Submit Code**:
   - Fork this repository
   - Create your feature branch (`git checkout -b feature/AmazingFeature`)
   - Commit your changes (`git commit -m 'Add some AmazingFeature'`)
   - Push to the branch (`git push origin feature/AmazingFeature`)
   - Open a Pull Request

### Support the Project

If you find KnowNote helpful, please consider:

- Give the project a ⭐ Star
- Share it with others who might need it
- Provide feedback and suggestions in [Issues](https://github.com/MrSibe/KnowNote/issues)

---

## License

This project is licensed under the [GPL-3.0 License](LICENSE).

---

## Acknowledgments

Thanks to the following open source projects and technologies:

- [Google NotebookLM](https://notebooklm.google/) - Source of inspiration
- [Electron](https://www.electronjs.org/) - Cross-platform desktop application framework
- [React](https://react.dev/) - UI framework
- [SQLite](https://www.sqlite.org/) & [sqlite-vec](https://github.com/asg017/sqlite-vec) - Data storage and vector retrieval

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/MrSibe">@MrSibe</a></p>
  <p>If this project helps you, please give it a ⭐ Star!</p>
</div>
