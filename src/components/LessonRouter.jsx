import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import DialogLesson from "../pages/DialogLesson";
import SpeedRound from "../pages/SpeedRound";
import VocabularyLesson from "../pages/VocabularyLesson";

/**
 * "/lesson/:lessonId" bitta yo'l — lekin lesson.type'ga qarab
 * DialogLesson, SpeedRound yoki VocabularyLesson ko'rsatiladi. Bu komponent
 * avval darsning turini tekshirib, tegishlisini render qiladi.
 */
export default function LessonRouter() {
  const { lessonId } = useParams();
  const [type, setType] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/lessons/${lessonId}`)
      .then((res) => {
        const lesson = res.data.lesson || res.data;
        setType(lesson.type || "dialog");
      })
      .catch(() => {
        // Backend ishlamasa ham demo to'xtamasin — standart dialog turi bilan davom
        setType("dialog");
        setFailed(true);
      });
  }, [lessonId]);

  if (!type) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-neutral text-sm">
        Yuklanmoqda...
      </div>
    );
  }

  if (type === "speed_round") return <SpeedRound />;
  if (type === "vocabulary" || type === "listening") return <VocabularyLesson />;
  return <DialogLesson />;
}