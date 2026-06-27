# DocuForge AI - Complete README for GitHub

---

# 📄 DocuForge AI

### AI-Powered Template-Based Document Generation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB.svg)](https://reactjs.org/)
[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933.svg)](https://nodejs.org/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6F00.svg)](https://ollama.ai/)

---

## 🎯 Overview

**DocuForge AI** is an open-source, template-first, AI-powered document generation tool designed to automate professional and academic document creation while preserving your original template format.

The system allows users to upload any DOCX template, automatically generates complete content for each section using local AI models, and inserts the content back into the template while preserving all formatting, styles, headings, tables, and page layout.

**🔑 Key Concept:** Upload a template → AI generates content → Insert into template → Download formatted document

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 📄 **Template Upload** | Upload any DOCX template with your formatting |
| 🔍 **Smart Parsing** | Automatically detects sections, headings, styles, and structure |
| 🤖 **AI Generation** | Local AI (Ollama) generates content for each section |
| 🎨 **Formatting Preservation** | Maintains your template's original style and layout |
| ✏️ **Rich Text Editor** | Edit content with bold, italic, headings, and alignment |
| 🔄 **Section Regeneration** | Regenerate individual sections without redoing everything |
| 📥 **Download Options** | Export as DOCX or PDF with full formatting |
| 🔒 **Privacy First** | No account required, session-based, no data stored |

### Advanced Features
- **Custom Section Selection** - Choose which sections to generate
- **Drag-and-Drop Reordering** - Arrange sections in your preferred order
- **AI Status Monitoring** - Shows if AI is available or using fallback
- **Real-time Progress** - Visual progress bar during generation
- **Mobile Responsive** - Works on all devices

---

## 🚀 How It Works
<img width="393" height="872" alt="image" src="https://github.com/user-attachments/assets/9e593b6a-a6e0-48aa-b694-2c7c77d4d4be" />

---

## 📋 Features in Detail

### 1. Template Upload & Parsing
- Upload any DOCX template
- Auto-detects: sections, headings, styles, tables, placeholders
- Extracts: font family, size, spacing, margins, alignment
- Shows template analysis summary

### 2. AI Content Generation
- Uses local Ollama (Llama 3.2, TinyLlama, etc.)
- Section-wise content generation
- Supports: Abstract, Introduction, Objectives, Methodology, Conclusion
- Custom sections: Security, Quality, Risk, Architecture, Testing
- Hybrid generation (AI + Fallback) for reliability

### 3. Rich Text Editor
- Bold, Italic, Underline
- Text alignment (Left, Center, Right, Justify)
- Headings (H1, H2, H3)
- Links and formatting
- Inline editing and saving

### 4. Document Composition
- Preserves original template formatting
- Maintains: fonts, styles, spacing, margins
- Keeps: headers, footers, page numbers
- Inserts AI content at correct section positions

### 5. Export Options
- Download as DOCX (fully formatted)
- Download as PDF (print-ready)
- Preserves all template styling

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | UI Framework |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **TipTap** | Rich Text Editor |
| **React Beautiful DnD** | Drag & Drop |
| **React Router** | Navigation |
| **Vite** | Build Tool |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | API Framework |
| **TypeScript** | Type Safety |
| **Ollama** | Local AI Model |
| **Mammoth.js** | DOCX Parsing |
| **Docx.js** | DOCX Generation |
| **Multer** | File Upload |
| **UUID** | Session Management |

### AI Models
- **Llama 3.2** (Primary)
- **TinyLlama** (Lightweight)
- **Phi** (Fast)
- **Mistral** (Alternative)

---

## 🎨 Screenshots

### Home Page
*Clean landing page with drag-drop upload functionality*
<img width="1762" height="905" alt="image" src="https://github.com/user-attachments/assets/10f4f1fa-41bd-4158-953d-1a32d3a0c152" />

### Dashboard - Template Analysis
*Shows parsed template structure, sections, and formatting details*
<img width="1607" height="882" alt="image" src="https://github.com/user-attachments/assets/d264ffc0-e501-4017-a4b8-cd8a381dc58c" />

### Document Setup Form
*Fill in document details and content information*
<img width="1601" height="917" alt="image" src="https://github.com/user-attachments/assets/f0cc221c-7df1-40d7-b20f-ce23312be842" />


### Section Selection with Drag & Drop
*Choose and reorder sections for your document*
<img width="1508" height="882" alt="image" src="https://github.com/user-attachments/assets/5a085873-9870-4fff-85f0-04db39a4ce07" />


### Document Preview
*View generated document with rich text editing*
<img width="1892" height="892" alt="image" src="https://github.com/user-attachments/assets/0901fc80-463a-4813-8b15-7206cb14cdb1" />

---

## 📦 Output Examples

### Generated Report
*AI-generated content inserted into your template*

<img width="1258" height="720" alt="image" src="https://github.com/user-attachments/assets/e555b684-b34e-41f5-a556-288551edb4eb" />

---

## 🧪 Sample Output

### Abstract Generation Example

**Input:**
```
Document Title: "AI-Powered Document Generation"
Abstract Points: "Template-based document generation, preserving formatting"
```

**Output:**
```
This document presents DocuForge AI, a template-based document generation platform 
that leverages artificial intelligence to automate professional document creation. 
The system allows users to upload any DOCX template and automatically generates 
complete reports while preserving original formatting, styles, headings, and page 
layout. Using local AI models (Ollama), the platform ensures privacy and offline 
functionality. The results demonstrate that AI-powered template-based generation 
significantly reduces document preparation time while maintaining quality and 
consistency.
```

---

## 🏆 Key Benefits

| Benefit | Description |
|---------|-------------|
| ⏱️ **Save Time** | Generate complete documents in minutes, not hours |
| 🎨 **Preserve Formatting** | Keep your institution's/organization's template style |
| 🔒 **Privacy First** | No cloud AI, no data storage, no account needed |
| 💰 **Cost Effective** | Free and open-source, no paid API keys |
| 📚 **Academic Ready** | Perfect for reports, theses, and research papers |
| 🏢 **Professional** | Ideal for office documents and proposals |
| 🎯 **Customizable** | Choose sections, reorder, edit content |
| 🌐 **Accessible** | Works on all devices, no installation needed |

---

## 🧠 AI Models Supported

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **Llama 3.2** | 3B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High-quality content |
| **TinyLlama** | 1.1B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Fast generation |
| **Phi** | 1.5B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Balanced performance |
| **Mistral** | 7B | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Best quality |

---

## 📊 Document Types Supported

- ✅ **Project Reports** - Final year, semester projects
- ✅ **Internship Reports** - Training and internship documentation
- ✅ **Office Reports** - Business and organizational documents
- ✅ **Certificates** - Completion, participation, appreciation
- ✅ **Thesis/Dissertation** - Academic research papers
- ✅ **Proposals** - Project proposals, business plans
- ✅ **Assignments** - Academic assignments and homework
- ✅ **Letters** - Formal letters and communications
- ✅ **Technical Documents** - System architecture, security, quality

---

## 🔐 Privacy & Security

| Feature | Description |
|---------|-------------|
| 🔒 **No Account Required** | No registration, no personal data stored |
| 🗑️ **Session-Based** | Data automatically deleted after session expires |
| 🤖 **Local AI** | No external API calls, data stays on your device |
| 📄 **No Data Storage** | Files are temporary and auto-deleted |
| 🔐 **Secure Uploads** | File validation and sanitization |

---

## 📱 Mobile Support

The application is fully responsive and works on:
- 📱 **Mobile Phones** (iPhone, Android)
- 📟 **Tablets** (iPad, Android Tablets)
- 💻 **Laptops** (MacBook, Windows Laptops)
- 🖥️ **Desktops** (All screen sizes)

---

## 🎯 Use Cases

### For Students
- Final year project reports
- Internship reports
- Seminar reports
- Assignment submissions
- Synopsis documents

### For Professionals
- Office reports
- Business proposals
- Project documentation
- Formal letters
- Training manuals

### For Institutions
- Certificate generation
- Standardized reports
- Official documentation
- Research papers
- Curriculum documents

---

## 🌟 Future Enhancements

- [ ] **PDF Input Support** - Upload PDF templates
- [ ] **Multi-Language Support** - Generate in multiple languages
- [ ] **Citation Management** - Auto-generate citations and references
- [ ] **Collaborative Editing** - Real-time team collaboration
- [ ] **Template Library** - Save and reuse templates
- [ ] **Batch Generation** - Generate multiple documents at once
- [ ] **Advanced AI Models** - Fine-tuned academic models
- [ ] **Cloud Sync** - Sync across devices (optional)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Creator

**Yash Nagapure**
- 🎓 B.E. Computer Science, AISSMS IOIT, Pune
- 💻 Full Stack Developer & AI Enthusiast
- 🔗 [GitHub](https://github.com/yashn555)
- 📧 yashnagapure35@gmail.com

---

## 🙏 Acknowledgments

- **Ollama** - For providing excellent local AI models
- **React.js** - For the amazing UI framework
- **Tailwind CSS** - For beautiful styling
- **TypeScript** - For type safety
- **All Open Source Libraries** - For making this possible

---

## 📊 Project Statistics

[![GitHub stars](https://img.shields.io/github/stars/yashn555/docuforge-ai)](https://github.com/yashn555/docuforge-ai/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yashn555/docuforge-ai)](https://github.com/yashn555/docuforge-ai/network)
[![GitHub issues](https://img.shields.io/github/issues/yashn555/docuforge-ai)](https://github.com/yashn555/docuforge-ai/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/yashn555/docuforge-ai)](https://github.com/yashn555/docuforge-ai/pulls)

---

**Made with ❤️ for students and professionals worldwide**



---

**DocuForge AI - Making Document Generation Simple** 🚀
