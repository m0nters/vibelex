import { RotateCcw } from "lucide-react";

interface PopupErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function PopupErrorState({ message, onRetry }: PopupErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center text-sm text-red-500"
      key="error"
    >
      <p className="whitespace-pre-line">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 cursor-pointer rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
