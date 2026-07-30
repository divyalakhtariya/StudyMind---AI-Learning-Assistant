import { useEffect, useState } from "react";
import "./App.css";

const modes = [
  {
    id: "summary",
    label: "Summary",
    icon: "≡",
    description: "Understand the most important concepts",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: "◈",
    description: "Memorize important concepts",
  },
  {
    id: "guide",
    label: "Preparation Guide",
    icon: "✦",
    description: "Build a structured study roadmap",
  },
  {
    id: "interview",
    label: "Interview Q&A",
    icon: "◇",
    description: "Prepare for technical questions",
  },
  {
    id: "quiz",
    label: "Practice Quiz",
    icon: "✓",
    description: "Test your understanding",
  },
];

const API_BASE_URL = "http://127.0.0.1:8000";

const HISTORY_KEY = "studymind_history";
const THEME_KEY = "studymind_theme";

function App() {
  const [screen, setScreen] = useState("input");

  const [activeMode, setActiveMode] = useState("summary");

  const [activeResult, setActiveResult] = useState("overview");

  const [studyText, setStudyText] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  const [flippedCard, setFlippedCard] = useState(null);

  const [currentCard, setCurrentCard] = useState(0);

  const [openInterview, setOpenInterview] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [quizAnswers, setQuizAnswers] = useState({});

  const [quizFinished, setQuizFinished] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "light";
  });

  const [history, setHistory] = useState(() => {
    try {
      const savedHistory =
        localStorage.getItem(HISTORY_KEY);

      return savedHistory
        ? JSON.parse(savedHistory)
        : [];
    } catch {
      return [];
    }
  });

  const [showHistory, setShowHistory] = useState(false);

  const hasText = studyText.trim().length > 0;

  const hasFile = Boolean(selectedFile);

  const hasContent = hasText || hasFile;

  const flashcards = result?.flashcards || [];

  const interviewQuestions =
    result?.interviewQuestions || [];

  const quizQuestions = result?.quiz || [];

  const preparationGuide =
    result?.preparationGuide || [];

  const summary = result?.summary || "";

  const wordCount = result?.word_count || 0;

  const currentQuizQuestion =
    quizQuestions[currentQuestion];

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );
  }, [history]);

  const toggleTheme = () => {
    setTheme((previousTheme) =>
      previousTheme === "light"
        ? "dark"
        : "light"
    );
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizAnswers({});
    setQuizFinished(false);
  };

  const resetResultsState = () => {
    setFlippedCard(null);
    setCurrentCard(0);
    setOpenInterview(null);
    resetQuiz();
  };

  const saveCurrentStudyToHistory = () => {
    if (!result) {
      return;
    }

    const historyItem = {
      id: Date.now(),
      title:
        result?.source?.filename ||
        "Study Session",
      date: new Date().toLocaleString(),
      result: result,
    };

    setHistory((previousHistory) => [
      historyItem,
      ...previousHistory,
    ]);
  };

  const startNewStudy = () => {
    if (result) {
      saveCurrentStudyToHistory();
    }

    setScreen("input");

    setStudyText("");

    setSelectedFile(null);

    setResult(null);

    setError("");

    setActiveMode("summary");

    setActiveResult("overview");

    setShowHistory(false);

    resetResultsState();
  };

  const openHistoryStudy = (historyItem) => {
    setResult(historyItem.result);

    setScreen("results");

    setActiveResult("overview");

    setShowHistory(false);

    setError("");

    resetResultsState();
  };

  const deleteHistoryItem = (historyId) => {
    setHistory((previousHistory) =>
      previousHistory.filter(
        (item) => item.id !== historyId
      )
    );
  };

  const clearHistory = () => {
    if (history.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all study history?"
    );

    if (confirmed) {
      setHistory([]);
    }
  };

  const handleTextChange = (event) => {
    setStudyText(event.target.value);

    setSelectedFile(null);

    setError("");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      ".pdf",
      ".docx",
      ".txt",
    ];

    const isValidType = validTypes.some(
      (type) =>
        file.name
          .toLowerCase()
          .endsWith(type)
    );

    if (!isValidType) {
      setError(
        "Please upload a PDF, DOCX, or TXT file."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "File size must be less than 10 MB."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);

    setStudyText("");

    setError("");
  };

  const clearInput = () => {
    setStudyText("");

    setSelectedFile(null);

    setError("");

    const fileInput =
      document.getElementById(
        "file-upload"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const generateStudyMaterial = async () => {
    if (!hasContent) {
      setError(
        "Please enter study material or upload a file."
      );

      return;
    }

    setLoading(true);

    setError("");

    resetResultsState();

    try {
      let response;

      if (selectedFile) {
        const formData = new FormData();

        formData.append(
          "file",
          selectedFile
        );

        response = await fetch(
          `${API_BASE_URL}/api/generate-file`,
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/api/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              notes: studyText,
            }),
          }
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to generate study material."
        );
      }

      setResult(data);

      setScreen("results");

      setActiveResult("overview");
    } catch (err) {
      console.error(
        "Generation error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while generating study material."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    return quizQuestions.reduce(
      (score, question, index) =>
        score +
        (quizAnswers[index] ===
        question.correctAnswerIndex
          ? 1
          : 0),
      0
    );
  };

  const selectQuizAnswer = (index) => {
    if (
      selectedAnswer !== null
    ) {
      return;
    }

    setSelectedAnswer(index);

    setQuizAnswers(
      (previous) => ({
        ...previous,
        [currentQuestion]:
          index,
      })
    );
  };

  const nextQuestion = () => {
    if (
      currentQuestion <
      quizQuestions.length - 1
    ) {
      const nextIndex =
        currentQuestion + 1;

      setCurrentQuestion(
        nextIndex
      );

      setSelectedAnswer(
        quizAnswers[nextIndex] ??
          null
      );
    } else {
      setQuizFinished(true);
    }
  };

  const previousQuestion = () => {
    if (
      currentQuestion === 0
    ) {
      return;
    }

    const previousIndex =
      currentQuestion - 1;

    setCurrentQuestion(
      previousIndex
    );

    setSelectedAnswer(
      quizAnswers[
        previousIndex
      ] ?? null
    );
  };

  return (
    <div className="app">
      {screen === "input" ? (
        <>
          <header className="navbar">
            <div className="brand">
              <div className="brand-mark">
                AI
              </div>

              <div>
                <h1>
                  StudyMind
                </h1>

                <span>
                  AI Learning Assistant
                </span>
              </div>
            </div>

            <div className="navbar-actions">
              <button
                className="history-button"
                onClick={() =>
                  setShowHistory(
                    !showHistory
                  )
                }
              >
                📚 History
                {history.length > 0 && (
                  <span className="history-count">
                    {history.length}
                  </span>
                )}
              </button>

              <button
                className="theme-toggle"
                onClick={
                  toggleTheme
                }
                aria-label="Toggle theme"
              >
                {theme ===
                "light"
                  ? "🌙"
                  : "☀️"}
              </button>

              <div className="navbar-status">
                <span className="status-dot" />
                Gemini AI
              </div>
            </div>
          </header>

          {showHistory && (
            <aside className="history-panel">
              <div className="history-header">
                <div>
                  <span className="eyebrow">
                    STUDY HISTORY
                  </span>

                  <h3>
                    Previous Studies
                  </h3>
                </div>

                <button
                  className="close-history"
                  onClick={() =>
                    setShowHistory(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              {history.length ===
              0 ? (
                <div className="empty-history">
                  <div>
                    📚
                  </div>

                  <h4>
                    No study history yet
                  </h4>

                  <p>
                    Your completed studies
                    will appear here when
                    you start a new study.
                  </p>
                </div>
              ) : (
                <>
                  <div className="history-list">
                    {history.map(
                      (item) => (
                        <div
                          className="history-item"
                          key={
                            item.id
                          }
                        >
                          <button
                            className="history-item-main"
                            onClick={() =>
                              openHistoryStudy(
                                item
                              )
                            }
                          >
                            <span className="history-item-icon">
                              📖
                            </span>

                            <span className="history-item-info">
                              <strong>
                                {
                                  item.title
                                }
                              </strong>

                              <small>
                                {
                                  item.date
                                }
                              </small>
                            </span>
                          </button>

                          <button
                            className="delete-history"
                            onClick={() =>
                              deleteHistoryItem(
                                item.id
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    className="clear-history-button"
                    onClick={
                      clearHistory
                    }
                  >
                    Clear All History
                  </button>
                </>
              )}
            </aside>
          )}

          <main className="main-content">
            <section className="hero-section">
              <div className="hero-badge">
                ✦ AI-powered learning workspace
              </div>

              <h2>
                Turn your study material into
                <span>
                  smarter preparation.
                </span>
              </h2>

              <p>
                Paste your notes or upload a
                document. StudyMind analyzes
                your actual content and creates
                a personalized learning
                workspace.
              </p>
            </section>

            <section className="workspace">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    STEP 01
                  </span>

                  <h3>
                    Choose what you want to create
                  </h3>
                </div>
              </div>

              <div className="mode-grid">
                {modes.map(
                  (mode) => (
                    <button
                      key={mode.id}
                      className={`mode-card ${
                        activeMode ===
                        mode.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setActiveMode(
                          mode.id
                        )
                      }
                    >
                      <div className="mode-icon">
                        {mode.icon}
                      </div>

                      <div className="mode-content">
                        <strong>
                          {mode.label}
                        </strong>

                        <span>
                          {
                            mode.description
                          }
                        </span>
                      </div>

                      {activeMode ===
                        mode.id && (
                        <div className="selected-check">
                          ✓
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>

              <div className="input-panel">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      STEP 02
                    </span>

                    <h3>
                      Add your study material
                    </h3>
                  </div>

                  {hasContent && (
                    <button
                      className="clear-all-button"
                      onClick={
                        clearInput
                      }
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="input-method">
                  <div
                    className={`input-area ${
                      hasFile
                        ? "disabled-area"
                        : ""
                    }`}
                  >
                    <textarea
                      value={
                        studyText
                      }
                      onChange={
                        handleTextChange
                      }
                      disabled={
                        hasFile ||
                        loading
                      }
                      placeholder={
                        hasFile
                          ? "Remove the uploaded file to paste notes."
                          : "Paste your notes here..."
                      }
                    />

                    {!hasText &&
                      !hasFile && (
                        <div className="input-placeholder">
                          <div className="input-icon">
                            ✎
                          </div>

                          <h4>
                            Paste your notes here
                          </h4>

                          <p>
                            Add class notes,
                            textbook content,
                            concepts, or any
                            study material.
                          </p>
                        </div>
                      )}

                    {hasFile && (
                      <div className="disabled-message">
                        <div className="disabled-icon">
                          📄
                        </div>

                        <strong>
                          File selected
                        </strong>

                        <span>
                          {
                            selectedFile.name
                          }
                        </span>

                        <button
                          onClick={
                            clearInput
                          }
                        >
                          Remove file and
                          use text
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="input-divider">
                    OR
                  </div>

                  <div
                    className={`upload-area ${
                      hasText
                        ? "disabled-upload"
                        : ""
                    }`}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={
                        handleFileSelect
                      }
                      disabled={
                        hasText ||
                        loading
                      }
                    />

                    <label htmlFor="file-upload">
                      <div className="upload-icon">
                        ↑
                      </div>

                      <strong>
                        {selectedFile
                          ? selectedFile.name
                          : "Upload your study material"}
                      </strong>

                      <span>
                        {hasText
                          ? "Clear your notes to upload a document"
                          : "PDF, DOCX or TXT • Maximum 10 MB"}
                      </span>

                      {!hasText && (
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById(
                                "file-upload"
                              )
                              ?.click()
                          }
                        >
                          Browse files
                        </button>
                      )}
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    ⚠️ {error}
                  </div>
                )}

                <div className="input-footer">
                  <div className="input-info">
                    {hasText
                      ? `${studyText.trim().split(/\s+/).length} words added`
                      : hasFile
                      ? "Document ready to process"
                      : "Add study material to continue"}
                  </div>

                  <button
                    className="generate-button"
                    disabled={
                      !hasContent ||
                      loading
                    }
                    onClick={
                      generateStudyMaterial
                    }
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner" />
                        Generating...
                      </>
                    ) : (
                      <>
                        ✦ Generate Study
                        Material
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </main>

          <footer className="footer">
            StudyMind • AI Learning Assistant
          </footer>
        </>
      ) : (
        <>
          <header className="results-navbar">
            <div className="brand">
              <div className="brand-mark">
                AI
              </div>

              <div>
                <h1>
                  StudyMind
                </h1>

                <span>
                  Your AI-generated study workspace
                </span>
              </div>
            </div>

            <div className="results-actions">
              <button
                className="theme-toggle"
                onClick={
                  toggleTheme
                }
              >
                {theme ===
                "light"
                  ? "🌙"
                  : "☀️"}
              </button>

              <button
                className="history-button"
                onClick={() =>
                  setShowHistory(
                    !showHistory
                  )
                }
              >
                📚 History
                {history.length > 0 && (
                  <span className="history-count">
                    {history.length}
                  </span>
                )}
              </button>

              <button
                onClick={() =>
                  setScreen("input")
                }
              >
                Generate Again
              </button>

              <button
                className="primary-small-button"
                onClick={
                  startNewStudy
                }
              >
                + New Study
              </button>
            </div>
          </header>

          {showHistory && (
            <aside className="history-panel results-history">
              <div className="history-header">
                <div>
                  <span className="eyebrow">
                    STUDY HISTORY
                  </span>

                  <h3>
                    Previous Studies
                  </h3>
                </div>

                <button
                  className="close-history"
                  onClick={() =>
                    setShowHistory(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              {history.length ===
              0 ? (
                <div className="empty-history">
                  <div>
                    📚
                  </div>

                  <h4>
                    No study history yet
                  </h4>

                  <p>
                    Start a new study to
                    build your history.
                  </p>
                </div>
              ) : (
                <>
                  <div className="history-list">
                    {history.map(
                      (item) => (
                        <div
                          className="history-item"
                          key={
                            item.id
                          }
                        >
                          <button
                            className="history-item-main"
                            onClick={() =>
                              openHistoryStudy(
                                item
                              )
                            }
                          >
                            <span className="history-item-icon">
                              📖
                            </span>

                            <span className="history-item-info">
                              <strong>
                                {
                                  item.title
                                }
                              </strong>

                              <small>
                                {
                                  item.date
                                }
                              </small>
                            </span>
                          </button>

                          <button
                            className="delete-history"
                            onClick={() =>
                              deleteHistoryItem(
                                item.id
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    className="clear-history-button"
                    onClick={
                      clearHistory
                    }
                  >
                    Clear All History
                  </button>
                </>
              )}
            </aside>
          )}

          <main className="results-container">
            <section className="results-hero">
              <div>
                <span className="eyebrow">
                  YOUR STUDY RESULTS
                </span>

                <h2>
                  Your learning workspace is ready.
                </h2>

                <p>
                  Your content was analyzed by
                  Gemini AI. Explore your
                  personalized study material
                  below.
                </p>

                {result?.source?.filename && (
                  <div className="source-badge">
                    📄{" "}
                    {
                      result.source
                        .filename
                    }
                  </div>
                )}
              </div>

              <div className="results-stats">
                <div>
                  <strong>
                    {
                      flashcards.length
                    }
                  </strong>

                  <span>
                    Flashcards
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      interviewQuestions.length
                    }
                  </strong>

                  <span>
                    Interview Q&A
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      quizQuestions.length
                    }
                  </strong>

                  <span>
                    Quiz Questions
                  </span>
                </div>
              </div>
            </section>

            <nav className="results-tabs">
              <button
                className={
                  activeResult ===
                  "overview"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveResult(
                    "overview"
                  )
                }
              >
                <span>◉</span>
                Overview
              </button>

              {modes.map(
                (mode) => (
                  <button
                    key={mode.id}
                    className={
                      activeResult ===
                      mode.id
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveResult(
                        mode.id
                      )
                    }
                  >
                    <span>
                      {mode.icon}
                    </span>

                    {mode.label}
                  </button>
                )
              )}
            </nav>

            <section className="results-content">
              {activeResult ===
                "overview" && (
                <div className="overview-page">
                  <div className="content-title">
                    <span className="eyebrow">
                      OVERVIEW
                    </span>

                    <h3>
                      Your complete learning plan
                    </h3>

                    <p>
                      Your study material has
                      been transformed into a
                      complete AI-powered
                      preparation workspace.
                    </p>
                  </div>

                  <div className="overview-grid">
                    <button
                      onClick={() =>
                        setActiveResult(
                          "summary"
                        )
                      }
                    >
                      <span>≡</span>

                      <strong>
                        Detailed Summary
                      </strong>

                      <p>
                        Review the main ideas,
                        concepts, definitions,
                        and important
                        information.
                      </p>

                      <small>
                        Read summary →
                      </small>
                    </button>

                    <button
                      onClick={() =>
                        setActiveResult(
                          "flashcards"
                        )
                      }
                    >
                      <span>◈</span>

                      <strong>
                        {
                          flashcards.length
                        }{" "}
                        Flashcards
                      </strong>

                      <p>
                        Review important
                        concepts with
                        interactive flip
                        cards.
                      </p>

                      <small>
                        Start reviewing →
                      </small>
                    </button>

                    <button
                      onClick={() =>
                        setActiveResult(
                          "guide"
                        )
                      }
                    >
                      <span>✦</span>

                      <strong>
                        Preparation Guide
                      </strong>

                      <p>
                        Follow a structured
                        roadmap based on
                        your actual study
                        material.
                      </p>

                      <small>
                        View guide →
                      </small>
                    </button>

                    <button
                      onClick={() =>
                        setActiveResult(
                          "interview"
                        )
                      }
                    >
                      <span>◇</span>

                      <strong>
                        {
                          interviewQuestions.length
                        }{" "}
                        Interview Questions
                      </strong>

                      <p>
                        Practice detailed
                        subject-specific
                        interview and viva
                        questions.
                      </p>

                      <small>
                        Practice interview →
                      </small>
                    </button>

                    <button
                      onClick={() =>
                        setActiveResult(
                          "quiz"
                        )
                      }
                    >
                      <span>✓</span>

                      <strong>
                        {
                          quizQuestions.length
                        }
                        -Question Quiz
                      </strong>

                      <p>
                        Test your understanding
                        with interactive MCQs
                        and explanations.
                      </p>

                      <small>
                        Start quiz →
                      </small>
                    </button>
                  </div>

                  <div className="summary-card">
                    <div className="content-title">
                      <span className="eyebrow">
                        SOURCE INFORMATION
                      </span>

                      <h3>
                        Study material analyzed
                      </h3>
                    </div>

                    <div className="source-details">
                      <div>
                        <span>
                          Source type
                        </span>

                        <strong>
                          {result?.source
                            ?.type ===
                          "file"
                            ? "Uploaded File"
                            : "Text Input"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Word count
                        </span>

                        <strong>
                          {wordCount}
                        </strong>
                      </div>

                      {result?.source
                        ?.filename && (
                        <div>
                          <span>
                            File name
                          </span>

                          <strong>
                            {
                              result.source
                                .filename
                            }
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeResult ===
                "summary" && (
                <div className="learning-section">
                  <div className="content-title">
                    <span className="eyebrow">
                      AI SUMMARY
                    </span>

                    <h3>
                      Detailed Study Summary
                    </h3>

                    <p>
                      A personalized summary
                      generated from your actual
                      study material.
                    </p>
                  </div>

                  <div className="summary-card detailed-summary">
                    {summary
                      .split("\n")
                      .filter(
                        (line) =>
                          line.trim()
                      )
                      .map(
                        (
                          line,
                          index
                        ) => (
                          <p
                            key={
                              index
                            }
                          >
                            {line}
                          </p>
                        )
                      )}
                  </div>
                </div>
              )}

              {activeResult ===
                "flashcards" && (
                <div className="learning-section">
                  <div className="content-title">
                    <span className="eyebrow">
                      FLASHCARDS
                    </span>

                    <h3>
                      Master the key concepts
                    </h3>

                    <p>
                      Click a card to reveal the
                      detailed answer.
                    </p>
                  </div>

                  {flashcards.length >
                    0 && (
                    <>
                      <div className="card-progress">
                        <div>
                          Card{" "}
                          {currentCard +
                            1}{" "}
                          of{" "}
                          {
                            flashcards.length
                          }
                        </div>

                        <div className="progress-track">
                          <div
                            style={{
                              width: `${
                                ((currentCard +
                                  1) /
                                  flashcards.length) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div
                        className={`flashcard ${
                          flippedCard ===
                          currentCard
                            ? "flipped"
                            : ""
                        }`}
                        onClick={() =>
                          setFlippedCard(
                            flippedCard ===
                              currentCard
                              ? null
                              : currentCard
                          )
                        }
                      >
                        <div className="flashcard-inner">
                          <div className="flashcard-front">
                            <span>
                              QUESTION
                            </span>

                            <h3>
                              {
                                flashcards[
                                  currentCard
                                ].question
                              }
                            </h3>

                            <small>
                              Click to reveal
                              answer
                            </small>
                          </div>

                          <div className="flashcard-back">
                            <span>
                              ANSWER
                            </span>

                            <p>
                              {
                                flashcards[
                                  currentCard
                                ].answer
                              }
                            </p>

                            <small>
                              Click to see question
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="card-navigation">
                        <button
                          disabled={
                            currentCard ===
                            0
                          }
                          onClick={() => {
                            setCurrentCard(
                              (
                                previous
                              ) =>
                                previous -
                                1
                            );

                            setFlippedCard(
                              null
                            );
                          }}
                        >
                          ← Previous
                        </button>

                        <button
                          disabled={
                            currentCard ===
                            flashcards.length -
                              1
                          }
                          onClick={() => {
                            setCurrentCard(
                              (
                                previous
                              ) =>
                                previous +
                                1
                            );

                            setFlippedCard(
                              null
                            );
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeResult ===
                "guide" && (
                <div className="learning-section">
                  <div className="content-title">
                    <span className="eyebrow">
                      PREPARATION GUIDE
                    </span>

                    <h3>
                      Your structured learning roadmap
                    </h3>

                    <p>
                      Follow these AI-generated
                      preparation steps based on
                      your study material.
                    </p>
                  </div>

                  <div className="roadmap">
                    {preparationGuide.map(
                      (
                        item,
                        index
                      ) => (
                        <article
                          className="roadmap-item"
                          key={
                            item.step ||
                            index
                          }
                        >
                          <div className="roadmap-number">
                            {String(
                              item.step ||
                                index +
                                  1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="roadmap-body">
                            <span className="priority">
                              {
                                item.priority
                              }
                            </span>

                            <h4>
                              {item.title}
                            </h4>

                            <p>
                              {
                                item.description
                              }
                            </p>
                          </div>

                          <div className="roadmap-arrow">
                            →
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeResult ===
                "interview" && (
                <div className="learning-section">
                  <div className="content-title">
                    <span className="eyebrow">
                      INTERVIEW PREPARATION
                    </span>

                    <h3>
                      Technical Interview Q&A
                    </h3>

                    <p>
                      Practice subject-specific
                      questions with detailed,
                      interview-ready answers.
                    </p>
                  </div>

                  <div className="interview-list">
                    {interviewQuestions.map(
                      (item) => (
                        <article
                          className={`interview-card ${
                            openInterview ===
                            item.id
                              ? "open"
                              : ""
                          }`}
                          key={
                            item.id
                          }
                        >
                          <button
                            onClick={() =>
                              setOpenInterview(
                                openInterview ===
                                  item.id
                                  ? null
                                  : item.id
                              )
                            }
                          >
                            <div className="question-number">
                              {String(
                                item.id
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div className="question-main">
                              <span
                                className={`difficulty ${item.difficulty.toLowerCase()}`}
                              >
                                {
                                  item.difficulty
                                }
                              </span>

                              <h4>
                                {
                                  item.question
                                }
                              </h4>
                            </div>

                            <div className="expand-icon">
                              {openInterview ===
                              item.id
                                ? "−"
                                : "+"}
                            </div>
                          </button>

                          {openInterview ===
                            item.id && (
                            <div className="answer-content">
                              <p>
                                {
                                  item.answer
                                }
                              </p>

                              <div className="key-points">
                                <strong>
                                  Key points
                                </strong>

                                <ul>
                                  {item.keyPoints.map(
                                    (
                                      point
                                    ) => (
                                      <li
                                        key={
                                          point
                                        }
                                      >
                                        {
                                          point
                                        }
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}
                        </article>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeResult ===
                "quiz" && (
                <div className="quiz-section">
                  {!quizFinished ? (
                    <>
                      <div className="quiz-header">
                        <div>
                          <span className="eyebrow">
                            PRACTICE QUIZ
                          </span>

                          <h3>
                            Test your knowledge
                          </h3>
                        </div>

                        <div className="quiz-count">
                          Question{" "}
                          {currentQuestion +
                            1}{" "}
                          /{" "}
                          {
                            quizQuestions.length
                          }
                        </div>
                      </div>

                      <div className="quiz-progress">
                        <div
                          style={{
                            width: `${
                              ((currentQuestion +
                                1) /
                                quizQuestions.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      {currentQuizQuestion && (
                        <div className="quiz-card">
                          <div className="quiz-meta">
                            <span
                              className={`difficulty ${currentQuizQuestion.difficulty.toLowerCase()}`}
                            >
                              {
                                currentQuizQuestion.difficulty
                              }
                            </span>

                            <span>
                              {currentQuestion +
                                1}{" "}
                              of{" "}
                              {
                                quizQuestions.length
                              }
                            </span>
                          </div>

                          <h3>
                            {
                              currentQuizQuestion.question
                            }
                          </h3>

                          <div className="quiz-options">
                            {currentQuizQuestion.options.map(
                              (
                                option,
                                index
                              ) => {
                                const isSelected =
                                  selectedAnswer ===
                                  index;

                                const isCorrect =
                                  index ===
                                  currentQuizQuestion.correctAnswerIndex;

                                let className =
                                  "quiz-option";

                                if (
                                  selectedAnswer !==
                                  null
                                ) {
                                  if (
                                    isCorrect
                                  ) {
                                    className +=
                                      " correct";
                                  } else if (
                                    isSelected
                                  ) {
                                    className +=
                                      " incorrect";
                                  }
                                } else if (
                                  isSelected
                                ) {
                                  className +=
                                    " selected";
                                }

                                return (
                                  <button
                                    key={
                                      option
                                    }
                                    className={
                                      className
                                    }
                                    onClick={() =>
                                      selectQuizAnswer(
                                        index
                                      )
                                    }
                                  >
                                    <span>
                                      {String.fromCharCode(
                                        65 +
                                          index
                                      )}
                                    </span>

                                    {
                                      option
                                    }

                                    {selectedAnswer !==
                                      null &&
                                      isCorrect && (
                                        <b>
                                          ✓
                                        </b>
                                      )}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          {selectedAnswer !==
                            null && (
                            <div
                              className={`quiz-explanation ${
                                selectedAnswer ===
                                currentQuizQuestion.correctAnswerIndex
                                  ? "correct"
                                  : "incorrect"
                              }`}
                            >
                              <strong>
                                {selectedAnswer ===
                                currentQuizQuestion.correctAnswerIndex
                                  ? "Correct!"
                                  : "Not quite."}
                              </strong>

                              <p>
                                {
                                  currentQuizQuestion.explanation
                                }
                              </p>
                            </div>
                          )}

                          <div className="quiz-navigation">
                            <button
                              onClick={
                                previousQuestion
                              }
                              disabled={
                                currentQuestion ===
                                0
                              }
                            >
                              ← Previous
                            </button>

                            <button
                              className="next-button"
                              onClick={
                                nextQuestion
                              }
                              disabled={
                                selectedAnswer ===
                                null
                              }
                            >
                              {currentQuestion ===
                              quizQuestions.length -
                                1
                                ? "Finish Quiz"
                                : "Next Question →"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="quiz-result">
                      <div className="result-icon">
                        {calculateScore() >=
                        Math.ceil(
                          quizQuestions.length *
                            0.7
                        )
                          ? "🏆"
                          : "✦"}
                      </div>

                      <span className="eyebrow">
                        QUIZ COMPLETE
                      </span>

                      <h3>
                        Great work!
                      </h3>

                      <div className="score-circle">
                        <strong>
                          {calculateScore()}
                        </strong>

                        <span>
                          /{" "}
                          {
                            quizQuestions.length
                          }
                        </span>
                      </div>

                      <p>
                        You answered{" "}
                        <strong>
                          {calculateScore()}
                        </strong>{" "}
                        out of{" "}
                        {
                          quizQuestions.length
                        }{" "}
                        questions correctly.
                      </p>

                      <div className="score-stats">
                        <div>
                          <strong>
                            {
                              calculateScore()
                            }
                          </strong>

                          <span>
                            Correct
                          </span>
                        </div>

                        <div>
                          <strong>
                            {
                              quizQuestions.length -
                              calculateScore()
                            }
                          </strong>

                          <span>
                            Incorrect
                          </span>
                        </div>

                        <div>
                          <strong>
                            {Math.round(
                              (calculateScore() /
                                quizQuestions.length) *
                                100
                            )}
                            %
                          </strong>

                          <span>
                            Score
                          </span>
                        </div>
                      </div>

                      <div className="result-actions">
                        <button
                          onClick={
                            resetQuiz
                          }
                        >
                          Retry Quiz
                        </button>

                        <button
                          className="next-button"
                          onClick={() =>
                            setActiveResult(
                              "overview"
                            )
                          }
                        >
                          Back to Results
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>
        </>
      )}
    </div>
  );
}

export default App;