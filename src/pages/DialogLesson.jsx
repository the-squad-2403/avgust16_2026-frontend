import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MoreVertical, Volume2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MOCK_LESSON = {
  _id: "m2",
  title: "At the airport check-in counter ✈️",
  content: [
    {
      speakerLine: "Salom! Passportingizni ko'rsata olasizmi?",
      translations: { en: "Hello! Can you show your passport?" },
      replyOptions: [
        { text: "Mana marhamat", isCorrect: true },
        { text: "Menda passport yo'q", isCorrect: false },
      ],
    },
  ],
};

export default function DialogLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    axiosInstance
      .get(`/lessons/${lessonId}`)
      .then((res) => setLesson(res.data.lesson || res.data))
      .catch(() => setLesson(MOCK_LESSON));
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-neutral text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  // Backend "dialog" darslarida content = { scenario, scenes: [...] } shaklida
  // keladi — lekin mock/eski darslarda content to'g'ridan-to'g'ri massiv bo'lishi
  // mumkin, shuning uchun ikkalasini ham qo'llab-quvvatlaymiz.
  const scenes = lesson.content?.scenes || lesson.content || [];
  const scene = scenes[sceneIndex];
  const progressPct = Math.round(((sceneIndex + (feedback === "correct" ? 1 : 0)) / scenes.length) * 100);
  const translation = scene?.translations?.[user?.nativeLanguage] || scene?.translations?.en;

  async function handleSelect(option, i) {
    if (feedback) return; // javob berilgan, kutish
    setSelectedIndex(i);

    if (option.isCorrect) {
      setFeedback("correct");
      setTimeout(() => {
        if (sceneIndex + 1 < scenes.length) {
          setSceneIndex((s) => s + 1);
          setFeedback(null);
          setSelectedIndex(null);
        } else {
          finishLesson();
        }
      }, 900);
    } else {
      setMistakeCount((m) => m + 1);
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        setSelectedIndex(null);
      }, 900);
    }
  }

  async function finishLesson() {
    setSubmitting(true);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const accuracy = Math.max(
      0,
      Math.round(((scenes.length - mistakeCount) / scenes.length) * 100)
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
        state: { xpEarned, accuracy, mistakeCount, leveledUp, wordsLearned: scenes.length },
      });
    } catch {
      // Backend ishlamasa ham demo to'xtab qolmasin — mock natija bilan davom etamiz
      navigate("/lesson-complete", {
        state: { xpEarned: 25, accuracy, mistakeCount, wordsLearned: scenes.length },
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

      {/* Scenario chip */}
      <div className="self-start tt-pill bg-base-300/50 text-base-content mb-4">
        {lesson.title}
      </div>

      {/* Character illustration */}
      <div className="w-full h-40 rounded-3xl bg-gradient-to-br from-blue-100 to-secondary/20 flex items-center justify-center text-6xl mb-4">
        🦊
      </div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="tt-card mb-4"
        >
          <div className="flex items-start gap-2">
            <button className="mt-1 text-primary shrink-0">
              <Volume2 size={18} />
            </button>
            <div>
              <p className="font-semibold text-base-content">
                {scene?.speakerLine}
              </p>
              {translation && (
                <p className="text-sm text-neutral mt-1">{translation}</p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex-1" />

      {/* Reply options */}
      <div className="space-y-3 pb-2">
        {scene?.replyOptions?.map((option, i) => {
          const isSelected = selectedIndex === i;
          let stateClass = "tt-btn-option";
          if (isSelected && feedback === "correct") {
            stateClass =
              "tt-btn-option border-secondary bg-green-50 ring-2 ring-secondary/30";
          } else if (isSelected && feedback === "wrong") {
            stateClass =
              "tt-btn-option border-error bg-red-50 ring-2 ring-error/20";
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(option, i)}
              disabled={!!feedback || submitting}
              className={stateClass}
              animate={
                isSelected && feedback === "wrong"
                  ? { x: [0, -8, 8, -6, 6, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              <p className="font-semibold text-base-content">{option.text}</p>
            </motion.button>
          );
        })}
      </div>

      {feedback === "correct" && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-secondary font-semibold text-sm mb-2"
        >
          +10 XP ✨
        </motion.p>
      )}
      {feedback === "wrong" && (
        <p className="text-center text-error text-sm mb-2">
          Boshqa variantni sinab ko'ring
        </p>
      )}
    </div>
  );
}