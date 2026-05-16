import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(-1);
  };
  return (
    <button
      onClick={handleClick}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-indigo-600 transition-all duration-200 hover:bg-indigo-100 active:scale-90 active:bg-indigo-200 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:active:bg-indigo-900/50 ${className}`}
    >
      <ChevronLeft className="h-6 w-6" />
    </button>
  );
}
