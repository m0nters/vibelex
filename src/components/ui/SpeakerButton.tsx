import { ttsService } from "@/services";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RxSpeakerLoud } from "react-icons/rx";

export function SpeakerButton({
  word,
  ttsCode,
  className = "",
  hoverBackgroundColor = "hover:bg-gray-200",
  hoverTextColor = "hover:text-gray-700",
  speakingBackgroundColor = "bg-blue-100 ",
  speakingTextColor = "text-blue-600",
}: {
  word: string;
  ttsCode: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  speakingBackgroundColor?: string;
  speakingTextColor?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const isSpeakingSlow = useRef(false);

  useEffect(() => {
    return () => ttsService.stop();
  }, []);

  const handleSpeak = async () => {
    if (isPlaying) {
      // If currently playing, stop the speech
      ttsService.stop();
      setIsPlaying(false);
    } else {
      // If not playing, start speech
      try {
        await ttsService.speak({
          text: word,
          ttsCode,
          isSlow: isSpeakingSlow.current,
          onStart: () => setIsPlaying(true),
          onEnd: () => setIsPlaying(false),
          onError: (error) => {
            console.error("TTS error:", error);
            setIsPlaying(false);
          },
        });
        isSpeakingSlow.current = !isSpeakingSlow.current;
      } catch (error) {
        console.error("TTS error:", error);
        setIsPlaying(false);
      }
    }
  };

  return (
    <button
      onClick={handleSpeak}
      className={`rounded-full p-2 transition-colors ${
        isPlaying
          ? `cursor-pointer ${speakingBackgroundColor} ${speakingTextColor}`
          : `cursor-pointer text-gray-500 ${hoverBackgroundColor} ${hoverTextColor}`
      } ${className}`}
      title={isPlaying ? t("common:stop") : t("common:speak")}
    >
      <RxSpeakerLoud size={12} />
    </button>
  );
}
