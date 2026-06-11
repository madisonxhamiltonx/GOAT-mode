import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState(null);

  const [mode, setMode] = useState("setup");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);

  const allQuestions = questions
    ? [...questions.behavioral, ...questions.technical]
    : [];

    const averageScore =
  scores.length > 0
    ? (
        scores.reduce((a, b) => a + b, 0) /
        scores.length
      ).toFixed(1)
    : 0;

  const generateQuestions = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3001/generate-questions",
        {
          jobDescription,
        }
      );

      setQuestions(response.data);
      setMode("interview");
      setCurrentIndex(0);
      setAnswer("");
      setFeedback(null);
    } catch (err) {
      console.error(err);
      alert("Error generating questions");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    try {
      const question = allQuestions[currentIndex];

      const response = await axios.post(
        "http://localhost:3001/evaluate-answer",
        {
          question,
          answer,
        }
      );

      setFeedback(response.data);

setScores((prev) => [
  ...prev,
  response.data.score
]);
    } catch (err) {
      console.error(err);
      alert("Error evaluating answer");
    }
  };

  const nextQuestion = () => {
    setAnswer("");
    setFeedback(null);

    if (currentIndex + 1 >= allQuestions.length) {
      setMode("done");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">GOAT Mode</h1>

        <p className="subtitle">
          Because winging it is baaad.        </p>

        {/* SETUP SCREEN */}
        {mode === "setup" && (
          <>
            <textarea
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here..."
            />

            <button
              className="primary-btn"
              onClick={generateQuestions}
              disabled={!jobDescription || loading}
            >
              {loading ? "Generating..." : "Generate Questions"}
            </button>
          </>
        )}

        {/* INTERVIEW SCREEN */}
        {mode === "interview" && allQuestions.length > 0 && (
          <>
            <div className="progress">
              Question {currentIndex + 1} of {allQuestions.length}
            </div>

            <div className="question-card">
              <h3>Interview Question</h3>
              <p>{allQuestions[currentIndex]}</p>
            </div>

            <textarea
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
            />

            <button
              className="primary-btn"
              onClick={submitAnswer}
              disabled={!answer}
            >
              Submit Answer
            </button>

            {feedback && (
              <div className="feedback-card">
                <div className="goat-comment">
  🐐 {feedback.goatComment}
</div>
                <div className="score">
                  Score: {feedback.score}/10
                </div>

                <h4>Areas to Improve</h4>
                <ul>
                  {feedback.weaknesses.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </ul>

                <h4>Suggested Answer</h4>
                <p>{feedback.improvedAnswer}</p>

                <button
                  className="primary-btn"
                  onClick={nextQuestion}
                >
                  Next Question
                </button>
              </div>
            )}
          </>
        )}

        {/* COMPLETE SCREEN */}
        {mode === "done" && (
  <div className="complete">
    <h2>Interview Complete</h2>

    <div className="final-score">
      {averageScore}/10
    </div>

    <p>Average Interview Score</p>

    <div className="results-card">
      <h3>Performance Summary</h3>

      {averageScore >= 8 && (
        <p>
          Excellent performance. Your answers
          demonstrated strong communication and
          technical understanding.
        </p>
      )}

      {averageScore >= 6 && averageScore < 8 && (
        <p>
          Solid performance. With more detailed
          examples and stronger structure, your
          answers can become even more compelling.
        </p>
      )}

      {averageScore < 6 && (
        <p>
          Keep practicing. Focus on providing
          specific examples and explaining your
          thought process clearly.
        </p>
      )}
    </div>

    <button
      className="primary-btn"
      onClick={() => {
        setMode("setup");
        setQuestions(null);
        setJobDescription("");
        setCurrentIndex(0);
        setAnswer("");
        setFeedback(null);
        setScores([]);
      }}
    >
      Start New Interview
    </button>
  </div>
)}
      </div>
    </div>
  );
}

export default App;