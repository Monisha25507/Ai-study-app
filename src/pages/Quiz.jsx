import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateQuiz } from '../api/gemini';
import { getPDFs, saveQuizResult } from '../firebase/firestore';
import Header from '../components/Header';
import toast from 'react-hot-toast';
import { BrainCircuit, ChevronRight, RotateCcw, Trophy } from 'lucide-react';

const Quiz = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState('topic'); // 'topic' | 'pdf'
  const [topic, setTopic] = useState('');
  const [pdfs, setPdfs] = useState([]);
  const [selectedPDF, setSelectedPDF] = useState('');
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('setup'); // 'setup' | 'quiz' | 'result'
  const [generating, setGenerating] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    getPDFs(user.uid).then(setPdfs);
  }, []);

  const startQuiz = async () => {
    const subject = mode === 'topic' ? topic : selectedPDF;
    if (!subject.trim()) { toast.error('Please enter a topic or select a PDF'); return; }
    setGenerating(true);
    try {
      const qs = await generateQuiz(subject, numQ);
      setQuestions(qs);
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setPhase('quiz');
    } catch (err) {
      toast.error('Failed to generate quiz. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (option) => {
    if (selected !== null) return;
    setSelected(option);
  };

  const nextQuestion = async () => {
    const newAnswers = [...answers, { question: questions[current].question, selected, correct: questions[current].answer }];
    setAnswers(newAnswers);

    if (current + 1 < questions.length) {
      setAnimate(true);
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setSelected(null);
        setAnimate(false);
      }, 300);
    } else {
      // Save result
      const score = newAnswers.filter((a) => a.selected === a.correct).length;
      await saveQuizResult(user.uid, {
        topic: mode === 'topic' ? topic : selectedPDF,
        score,
        total: questions.length,
        answers: newAnswers,
      });
      setAnswers(newAnswers);
      setPhase('result');
    }
  };

  const reset = () => {
    setPhase('setup');
    setQuestions([]);
    setTopic('');
    setSelectedPDF('');
    setAnswers([]);
    setSelected(null);
    setCurrent(0);
  };

  const score = answers.filter((a) => a.selected === a.correct).length;

  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="page">
        <Header title="Quiz Results" />
        <div className="result-screen">
          <div className="result-trophy"><Trophy size={60} /></div>
          <h2 className="result-score">{score} / {questions.length}</h2>
          <p className="result-pct">{pct}% correct</p>
          <p className="result-msg">
            {pct >= 80 ? '🎉 Excellent work!' : pct >= 60 ? '👍 Good job!' : '📚 Keep studying!'}
          </p>

          <div className="result-breakdown">
            {answers.map((a, i) => (
              <div key={i} className={`result-item ${a.selected === a.correct ? 'correct' : 'wrong'}`}>
                <span className="result-q">{i + 1}. {a.question}</span>
                <span className="result-ans">Your answer: {a.selected}</span>
                {a.selected !== a.correct && <span className="result-correct">Correct: {a.correct}</span>}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={reset}>
            <RotateCcw size={16} /> Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = questions[current];
    return (
      <div className="page">
        <Header title="Quiz" />
        <div className="quiz-container">
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
            </div>
            <span>{current + 1} / {questions.length}</span>
          </div>

          <div className={`quiz-card ${animate ? 'slide-out' : ''}`}>
            <p className="quiz-question">{q.question}</p>
            <div className="quiz-options">
              {q.options.map((opt) => {
                let cls = 'quiz-option';
                if (selected) {
                  if (opt === q.answer) cls += ' correct';
                  else if (opt === selected) cls += ' wrong';
                }
                return (
                  <button key={opt} className={cls} onClick={() => handleAnswer(opt)}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected && (
              <button className="btn btn-primary next-btn" onClick={nextQuestion}>
                {current + 1 < questions.length ? 'Next' : 'See Results'} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title="Quiz Generator" />
      <div className="quiz-setup">
        <div className="glass-card quiz-setup-card">
          <div className="quiz-setup-icon"><BrainCircuit size={40} /></div>
          <h2>Generate a Quiz</h2>
          <p>Test your knowledge with AI-generated questions</p>

          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'topic' ? 'active' : ''}`} onClick={() => setMode('topic')}>
              By Topic
            </button>
            <button className={`mode-btn ${mode === 'pdf' ? 'active' : ''}`} onClick={() => setMode('pdf')}>
              From PDF
            </button>
          </div>

          {mode === 'topic' ? (
            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                placeholder="e.g. Photosynthesis, World War II, Python basics..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Select PDF</label>
              <select value={selectedPDF} onChange={(e) => setSelectedPDF(e.target.value)}>
                <option value="">-- Choose a PDF --</option>
                {pdfs.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Number of Questions: {numQ}</label>
            <input
              type="range"
              min={3}
              max={10}
              value={numQ}
              onChange={(e) => setNumQ(Number(e.target.value))}
              className="range-input"
            />
            <div className="range-labels"><span>3</span><span>10</span></div>
          </div>

          <button className="btn btn-primary btn-full" onClick={startQuiz} disabled={generating}>
            {generating ? <><span className="btn-spinner" /> Generating...</> : <><BrainCircuit size={18} /> Start Quiz</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
