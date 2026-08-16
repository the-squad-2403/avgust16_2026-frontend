import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { io } from "socket.io-client";
import { Swords, Trophy, RotateCcw } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

// VITE_API_URL odatda ".../api" bilan tugaydi — socket uchun asosiy manzil kerak
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const MOCK_FRIENDS = [
  { _id: "f1", name: "AlexTheGreat", xp: 1450, league: "gold" },
  { _id: "f2", name: "Sardor B.", xp: 980, league: "silver" },
];

export default function Duel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [phase, setPhase] = useState("lobby"); // lobby | countdown | battle | result
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [search, setSearch] = useState("");
  const [duel, setDuel] = useState(null);
  const [countdown, setCountdown] = useState(3);

  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myAnswered, setMyAnswered] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentAnswered, setOpponentAnswered] = useState(0);
  const [winnerId, setWinnerId] = useState(null);

  const socketRef = useRef(null);

  // ---- LOBBY: do'stlar ro'yxatini yuklash ----
  useEffect(() => {
    if (phase !== "lobby") return;
    axiosInstance
      .get(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`)
      .then((res) => {
        const list = res.data.users || res.data;
        if (Array.isArray(list) && list.length > 0) setFriends(list);
      })
      .catch(() => {
        // mock bilan qolaveradi
      });
  }, [phase, search]);

  async function handleChallenge(opponent) {
    try {
      const res = await axiosInstance.post("/duel/challenge", {
        opponentId: opponent._id,
      });
      const newDuel = res.data.duel || res.data;
      setDuel({ ...newDuel, opponentName: opponent.name });
      setQuestions(newDuel.questionSet || buildFallbackQuestions());
      startCountdown();
    } catch {
      // Demo davom etsin — mock duel bilan
      setDuel({ _id: "mock-duel", opponentName: opponent.name });
      setQuestions(buildFallbackQuestions());
      startCountdown();
    }
  }

  function buildFallbackQuestions() {
    return [
      { word: "Kutubxona", correct: "Library", options: ["Library", "Bookstore", "School"] },
      { word: "Aeroport", correct: "Airport", options: ["Hotel", "Airport", "Station"] },
      { word: "Restoran", correct: "Restaurant", options: ["Restaurant", "Museum", "Park"] },
    ];
  }

  function startCountdown() {
    setPhase("countdown");
    setCountdown(3);
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      startBattle();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // ---- BATTLE: Socket.IO ulanish ----
  function startBattle() {
    setPhase("battle");
    setQIndex(0);
    setMyScore(0);
    setMyAnswered(0);
    setOpponentScore(0);
    setOpponentAnswered(0);

    const socket = io(`${SOCKET_URL}/duel`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join-duel", { duelId: duel._id, userId: user?._id });

    // Eslatma: aniq event payload shakli backend implementatsiyasiga qarab
    // moslashtirilishi kerak bo'lishi mumkin — bu yerda mantiqiy taxmin qilingan.
    socket.on("score-update", (payload) => {
      if (payload.userId && payload.userId !== user?._id) {
        setOpponentScore(payload.score ?? 0);
        setOpponentAnswered(payload.answered ?? 0);
      }
    });

    socket.on("duel-finished", (payload) => {
      setWinnerId(payload.winnerId);
      setPhase("result");
      if (payload.winnerId === user?._id) {
        confetti({ particleCount: 140, spread: 100, origin: { y: 0.3 } });
      }
    });
  }

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  function handleAnswer(option) {
    const question = questions[qIndex];
    const isCorrect = option === (question.correct || question.correctAnswer);

    const nextScore = isCorrect ? myScore + 1 : myScore;
    const nextAnswered = myAnswered + 1;
    setMyScore(nextScore);
    setMyAnswered(nextAnswered);

    socketRef.current?.emit("submit-answer", {
      duelId: duel._id,
      userId: user?._id,
      isCorrect,
      score: nextScore,
      answered: nextAnswered,
    });

    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
    }
    // Barcha savollar tugagach — 'duel-finished' hodisasini kutamiz (server ikkala
    // o'yinchi tugaganda yuboradi). Agar server bu hodisani yubormasa, demo uchun
    // fallback: 2.5s dan keyin natijani lokal aniqlaymiz.
    if (nextAnswered >= questions.length) {
      setTimeout(() => {
        setPhase((p) => {
          if (p !== "battle") return p; // socket allaqachon tugatgan
          const iWon = nextScore >= opponentScore;
          setWinnerId(iWon ? user?._id : "opponent");
          if (iWon) confetti({ particleCount: 100, spread: 80, origin: { y: 0.3 } });
          return "result";
        });
      }, 2500);
    }
  }

  function handleRematch() {
    socketRef.current?.disconnect();
    setPhase("lobby");
    setDuel(null);
    setWinnerId(null);
  }

  // ---------------- RENDER ----------------

  if (phase === "lobby") {
    return (
      <div className="max-w-sm mx-auto">
        <h1 className="text-xl font-bold text-base-content mb-1">Duel</h1>
        <p className="text-sm text-neutral mb-4">Do'stingizni tanlang va bahslashing</p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism bo'yicha qidirish..."
          className="w-full bg-base-200 border border-base-300 rounded-2xl px-4 py-3 text-sm mb-4
                     focus:outline-none focus:border-primary"
        />

        <div className="space-y-3">
          {friends.map((f) => (
            <div key={f._id} className="tt-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {f.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-base-content text-sm">{f.name}</p>
                  <p className="text-xs text-neutral">{f.xp} XP · {f.league}</p>
                </div>
              </div>
              <button
                onClick={() => handleChallenge(f)}
                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Swords size={14} /> Challenge
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.p
            key={countdown}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            className="text-7xl font-bold text-primary"
          >
            {countdown === 0 ? "Start!" : countdown}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  if (phase === "battle") {
    const question = questions[qIndex];
    return (
      <div className="max-w-sm mx-auto">
        {/* Split-screen progress */}
        <div className="flex items-center gap-3 mb-8">
          <PlayerProgress label="Siz" pct={(myAnswered / questions.length) * 100} color="bg-primary" />
          <span className="text-neutral text-xs font-bold">VS</span>
          <PlayerProgress
            label={duel?.opponentName || "Raqib"}
            pct={(opponentAnswered / questions.length) * 100}
            color="bg-accent"
            align="right"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-base-content mb-6">{question?.word}</h2>
            <div className="space-y-3">
              {question?.options?.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} className="tt-btn-option text-center">
                  <span className="font-semibold">{opt}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {myAnswered >= questions.length && (
          <p className="text-center text-neutral text-sm mt-6">Raqib kutilmoqda...</p>
        )}
      </div>
    );
  }

  // ---- RESULT ----
  const iWon = winnerId === user?._id;
  return (
    <div className="flex flex-col items-center text-center max-w-sm mx-auto pt-10">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${
          iWon ? "bg-secondary" : "bg-base-300"
        }`}
      >
        <Trophy size={36} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: iWon ? "#10B981" : "#6B7280" }}>
        {iWon ? "G'alaba! 🏆" : "Mag'lubiyat"}
      </h1>
      <p className="text-neutral text-sm mb-8">
        {iWon ? "Ajoyib! Siz g'alaba qozondingiz." : "Keyingi safar omad kulib boqadi."}
      </p>

      <div className="flex gap-4 mb-8">
        <div className="tt-card flex-1">
          <p className="text-xs text-neutral font-semibold mb-1">SIZ</p>
          <p className="text-2xl font-bold text-primary">{myScore}</p>
        </div>
        <div className="tt-card flex-1">
          <p className="text-xs text-neutral font-semibold mb-1">RAQIB</p>
          <p className="text-2xl font-bold text-accent">{opponentScore}</p>
        </div>
      </div>

      <button onClick={handleRematch} className="tt-btn-primary flex items-center justify-center gap-2">
        <RotateCcw size={16} /> Rematch
      </button>
      <button onClick={() => navigate("/dashboard")} className="text-primary text-sm font-semibold mt-4">
        Bosh sahifaga
      </button>
    </div>
  );
}

function PlayerProgress({ label, pct, color, align = "left" }) {
  return (
    <div className="flex-1">
      <p className={`text-xs font-semibold text-neutral mb-1 ${align === "right" ? "text-right" : ""}`}>
        {label}
      </p>
      <div className="h-2 bg-base-300 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}