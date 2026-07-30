# 🧠 StudyMind – AI Learning Assistant

StudyMind is an AI-powered learning assistant that transforms study material into a personalized and interactive learning workspace.

Users can paste their study notes or upload a PDF, DOCX, or TXT document. StudyMind analyzes the provided content and generates useful learning resources such as detailed summaries, interactive flashcards, preparation guides, technical interview questions, and practice quizzes.

The goal of StudyMind is to make studying more structured, interactive, and efficient by converting lengthy study material into easy-to-use learning resources.

---
## 🎯 Project Objective

The main objective of StudyMind is to simplify the learning process using Generative AI.

Students often have large amounts of study material but may not have enough time to manually create summaries, flashcards, interview questions, and quizzes.

StudyMind addresses this problem by transforming a student's own study material into structured and interactive learning resources.

This allows students to:

- Understand important concepts faster.
- Revise topics using flashcards.
- Follow a structured preparation roadmap.
- Prepare for technical interviews.
- Test their knowledge through quizzes.
- Revisit previous study sessions.

---

## ✨ Features

### 📚 AI-Powered Study Material Generation

- Paste study notes directly into the application.
- Upload PDF, DOCX, or TXT documents.
- Automatically analyze the provided study material.
- Generate personalized learning resources based on the actual content.

---

### 📝 Detailed Summary

Generate a structured AI-powered summary containing the important concepts, definitions, and key information from the provided study material.

---

### 🃏 Interactive Flashcards

- Automatically generate flashcards from study material.
- Flip cards to reveal answers.
- Navigate between multiple flashcards.
- Track flashcard progress.
- Review important concepts interactively.

---

### 🗺️ Preparation Guide

Get a structured learning roadmap generated from your actual study material.

The preparation guide helps learners organize their study process and focus on important topics in a structured order.

---

### 💼 Interview Q&A

Practice technical interview and viva questions generated from the provided study content.

Each question includes:

- Difficulty level
- Detailed answer
- Important key points

This helps students prepare for technical interviews using their own study material.

---

### 🧠 Practice Quiz

Test your understanding with an interactive multiple-choice quiz.

Features include:

- Multiple-choice questions
- Difficulty levels
- Instant answer validation
- Correct and incorrect answer feedback
- Answer explanations
- Previous and next question navigation
- Final score calculation
- Correct and incorrect statistics
- Quiz retry functionality

---

### 📖 Study History

Previous study sessions can be accessed through the history feature.

Users can revisit previously generated study material without losing their earlier learning sessions.

---

### 🎨 Light and Dark Mode

StudyMind provides two modern themes designed around a Purple and Lavender color palette.

#### ☀️ Light Mode

- Soft Lavender background
- White cards
- Purple primary actions
- Clean dark text
- Comfortable reading experience

#### 🌙 Dark Mode

- Deep Purple background
- Dark Purple cards
- Lavender primary actions
- Light text
- Comfortable low-light study experience

The interface is designed to provide a clean and modern learning experience in both themes.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Python
- FastAPI
- REST API

### AI

- Google Gemini AI

### Document Processing

- PDF
- DOCX
- TXT

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Python Virtual Environment

---

## 🏗️ Project Architecture

```text
StudyMind
│
├── backend
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── ...
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   ├── utils
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## 🔄 How StudyMind Works

```text
              User
                │
                ▼
     ┌──────────────────────┐
     │  Enter Study Material │
     │    or Upload File     │
     └──────────┬───────────┘
                │
                ▼
       React Frontend
                │
                ▼
        FastAPI Backend
                │
                ▼
          Gemini AI
                │
                ▼
     AI Content Generation
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
    Summary  Flashcards  Guide
       │        │        │
       └────────┼────────┘
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
 Interview Q&A       Practice Quiz
       │                 │
       └────────┬────────┘
                │
                ▼
      Interactive Study
         Workspace
```

## 🔮 Future Improvements

Future versions of StudyMind may include:

- User authentication and personalized accounts
- Cloud-based study history
- Database-backed persistent storage
- Export study material as PDF
- Downloadable flashcards
- Spaced repetition system
- Advanced study progress analytics
- More AI-powered quiz modes
- Voice-based learning
- Multiple AI model support
- Mobile application
- Personalized AI study recommendations
---

## 📌 Project Highlights

- 🤖 AI-powered learning resource generation
- 📄 Supports multiple document formats
- 📝 Automatic summary generation
- 🃏 Interactive flashcards
- 🗺️ Structured preparation roadmap
- 💼 Technical interview preparation
- 🧠 Interactive practice quizzes
- 📖 Study session history
- 🎨 Modern Purple + Lavender UI
- ☀️ Light Mode
- 🌙 Dark Mode
- ⚡ React + FastAPI architecture

---

## 👩‍💻 Author

**Divya Lakhtariya**

BE – Artificial Intelligence & Data Science

---

## ⭐ Acknowledgements

This project was built using:

- React.js
- Vite
- FastAPI
- Python
- Google Gemini AI
- JavaScript
- Git & GitHub

---

## 📄 License

This project is created for educational and portfolio purposes.
