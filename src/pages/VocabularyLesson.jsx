import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MoreVertical, Volume2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MOCK_VOCAB = [
  { _id: "v1", word: "hello", translations: { uz: "salom", ru: "привет", en: "hello" } },
  { _id: "v2", word: "goodbye", translations: { uz: "xayr", ru: "пока", en: "goodbye" } },
  { _id: "v3", word: "please", translations: { uz: "iltimos", ru: "пожалуйста", en: "please" } },
  { _id: "v4", word: "thank you", translations: { uz: "rahmat", ru: "спасибо", en: "thank you" } },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabularyLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [selected, setSelected] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const startTimeRef = useRef(Date.now());
  const nativeLanguage = user?.nativeLanguage || "uz";
  const targetLanguage = user?.targetLanguage || "en";

  useEffect(() => {
    axiosInstance
      .get(`/lessons/${lessonId}`)
      .then((res) => {
        const data = res.data.lesson || res.data;
        const hasVocab = Array.isArray(data.vocabulary) && data.vocabulary.length > 0;
        setLesson(hasVocab ? data : { ...data, vocabulary: MOCK_VOCAB });
      })
      .catch(() => setLesson({ title: "So'z boyligi", vocabulary: MOCK_VOCAB }));
  }, [lessonId]);

  const words = lesson?.vocabulary || [];

  const question = useMemo(() => {
    if (words.length === 0) return null;
    const word = words[qIndex % words.length];
    const correctText = word.translations?.[nativeLanguage] || word.translations?.en || word.word;
    const distractorPool = words.filter((w) => w._id !== word._id);
    const distractors = shuffle(distractorPool)
      .slice(0, Math.min(3, distractorPool.length))
      .map((w) => w.translations?.[nativeLanguage] || w.translations?.en || w.word);
    const prompt = word.translations?.[targetLanguage] || word.translations?.en || word.word;
    return {
      prompt,
      correctText,
      options: shuffle([correctText, ...distractors]),
    };
  }, [words, qIndex, nativeLanguage, targetLanguage]);

  if (!lesson || !question) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-neutral text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  const progressPct = Math.round(
    ((qIndex + (feedback === "correct" ? 1 : 0)) / words.length) * 100
  );

  function handleSelect(option) {
    if (feedback) return;
    setSelected(option);

    if (option === question.correctText) {
      setFeedback("correct");
    } else {
      setMistakeCount((m) => m + 1);
      setFeedback("wrong");
    }

    setTimeout(() => {
      if (qIndex + 1 < words.length) {
        setQIndex((i) => i + 1);
        setFeedback(null);
        setSelected(null);
      } else {
        finishLesson();
      }
    }, 900);
  }

  async function finishLesson() {
    setSubmitting(true);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const accuracy = Math.max(
      0,
      Math.round(((words.length - mistakeCount) / words.length) * 100)
    );

    try {
      const res = await axiosInstance.post(`/lessons/${lessonId}/complete`, {
        accuracy,
        mistakeCount,
        timeSpent,
      });
      const { xpEarned, newStreak, leveledUp } = res.data;
      updateUser({
        xp: (user?.xp || 0) + (xpEarned || 0),
        streak: { ...user?.streak, count: newStreak ?? user?.streak?.count },
      });
      navigate("/lesson-complete", {
        state: { xpEarned, accuracy, mistakeCount, leveledUp, wordsLearned: words.length },
      });
    } catch {
      navigate("/lesson-complete", {
        state: { xpEarned: 15, accuracy, mistakeCount, wordsLearned: words.length },
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-64px)]">
      {/* Top bar: progress + close */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/dashboard")}>
          <X size={22} className="text-neutral" />
        </button>
        <div className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <button>
          <MoreVertical size={20} className="text-neutral" />
        </button>
      </div>

      <div className="self-start tt-pill bg-base-300/50 text-base-content mb-4">
        {lesson.title}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="tt-card mb-6 text-center">
              <button className="text-primary mb-2">
                <Volume2 size={20} className="mx-auto" />
              </button>
              <h2 className="text-2xl font-bold text-base-content">{question.prompt}</h2>
              <p className="text-xs text-neutral mt-1">Tarjimasini tanlang</p>
            </div>

            <div className="space-y-3">
              {question.options.map((opt, i) => {
                const isSelected = selected === opt;
                const isAnswerReveal = feedback === "wrong" && opt === question.correctText;

                let stateClass = "tt-btn-option text-center";
                if (isSelected && feedback === "correct") {
                  stateClass =
                    "tt-btn-option text-center border-secondary bg-green-50 ring-2 ring-secondary/30";
                } else if (isSelected && feedback === "wrong") {
                  stateClass =
                    "tt-btn-option text-center border-error bg-red-50 ring-2 ring-error/20";
                } else if (isAnswerReveal) {
                  stateClass =
                    "tt-btn-option text-center border-secondary bg-green-50 ring-2 ring-secondary/30";
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    disabled={!!feedback || submitting}
                    className={stateClass}
                    animate={
                      isSelected && feedback === "wrong"
                        ? { x: [0, -8, 8, -6, 6, 0] }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                  >
                    <span className="font-semibold text-base-content">{opt}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {feedback === "correct" && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-secondary font-semibold text-sm mb-2"
        >
          +5 XP ✨
        </motion.p>
      )}
      {feedback === "wrong" && (
        <p className="text-center text-error text-sm mb-2">
          To'g'ri javob: {question.correctText}
        </p>
      )}
    </div>
  );
}
