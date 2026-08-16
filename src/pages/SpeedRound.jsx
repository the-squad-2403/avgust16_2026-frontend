import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const ROUND_SECONDS = 30;

const MOCK_QUESTIONS = [
  { word: "Kutubxona", options: ["Library", "Bookstore", "School"], correct: "Library" },
  { word: "Aeroport", options: ["Hotel", "Airport", "Station"], correct: "Airport" },
  { word: "Passport", options: ["Ticket", "Passport", "Bag"], correct: "Passport" },
  { word: "Restoran", options: ["Restaurant", "Museum", "Park"], correct: "Restaurant" },
  { word: "Mehmonxona", options: ["Hospital", "Hotel", "Office"], correct: "Hotel" },
];

export default function SpeedRound() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [flash, setFlash] = useState(null); // "correct" | "wrong"

  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    axiosInstance
      .get(`/lessons/${lessonId}`)
      .then((res) => {
        const lesson = res.data.lesson || res.data;
        if (Array.isArray(lesson.content) && lesson.content.length > 0) {
          setQuestions(lesson.content);
        }
      })
      .catch(() => {
        // mock bilan qolaveradi
      });
  }, [lessonId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      finish();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    axiosInstance
      .post(`/lessons/${lessonId}/complete`, {
        accuracy,
        mistakeCount: wrongCount,
        timeSpent,
      })
      .then((res) => {
        const { xpEarned, newStreak, leveledUp } = res.data;
        updateUser({
          xp: (user?.xp || 0) + (xpEarned || 0),
          streak: { ...user?.streak, count: newStreak ?? user?.streak?.count },
        });
        navigate("/lesson-complete", {
          state: { xpEarned, accuracy, mistakeCount: wrongCount, leveledUp, wordsLearned: correctCount },
        });
      })
      .catch(() => {
        navigate("/lesson-complete", {
          state: { xpEarned: correctCount * 10, accuracy, mistakeCount: wrongCount, wordsLearned: correctCount },
        });
      });
  }

  function handleAnswer(option) {
    if (flash) return;
    const question = questions[qIndex % questions.length];
    const isCorrect = option === (question.correct || question.correctAnswer);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setCombo((c) => c + 1);
      setFlash("correct");
    } else {
      setWrongCount((c) => c + 1);
      setCombo(0);
      setFlash("wrong");
    }

    setTimeout(() => {
      setFlash(null);
      setQIndex((i) => i + 1);
    }, 350);
  }

  const question = questions[qIndex % questions.length];
  const timerPct = (timeLeft / ROUND_SECONDS) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-64px)] max-w-sm mx-auto">
      {/* Taymer */}
      <div className="h-2.5 bg-base-300 rounded-full overflow-hidden mb-6">
        <motion.div
          className={`h-full rounded-full ${timeLeft <= 10 ? "bg-error" : "bg-primary"}`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      {/* Combo counter */}
      <div className="flex justify-end mb-4">
        <div
          className={`tt-pill transition-transform ${
            combo >= 3 ? "bg-orange-100 text-accent scale-110" : "bg-base-300/50 text-neutral"
          }`}
        >
          <Flame size={14} strokeWidth={2.5} />
          {combo}x combo
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full text-center"
          >
            <p className="text-xs font-semibold text-neutral tracking-wide mb-2">
              TARJIMA QILING
            </p>
            <h2 className="text-3xl font-bold text-base-content mb-8">
              {question?.word}
            </h2>

            <div className="space-y-3">
              {question?.options?.map((opt, i) => {
                const isCorrectOpt = opt === (question.correct || question.correctAnswer);
                let cls = "tt-btn-option text-center";
                if (flash && isCorrectOpt) {
                  cls =
                    "tt-btn-option text-center border-secondary bg-green-50 ring-2 ring-secondary/30";
                } else if (flash === "wrong" && !isCorrectOpt) {
                  cls = "tt-btn-option text-center opacity-40";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!flash}
                    className={cls}
                  >
                    <span className="font-semibold">{opt}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-neutral text-sm mb-2">
        {timeLeft} soniya qoldi
      </p>
    </div>
  );
}