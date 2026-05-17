import { RotateCcw } from "lucide-react";

interface PopupErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function PopupErrorState({ message, onRetry }: PopupErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center text-sm text-red-500 transition-colors duration-300 dark:text-red-400"
      key="error"
    >
      <p className="whitespace-pre-line">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 cursor-pointer rounded-full p-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
