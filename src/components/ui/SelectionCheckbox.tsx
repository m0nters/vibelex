import { Check } from "lucide-react";
import React from "react";

interface SelectionCheckboxProps {
  isSelected: boolean;
  onClick?: (event: React.MouseEvent) => void;
  size?: "sm" | "md";
  className?: string;
  title?: string;
}

export function SelectionCheckbox({
  isSelected,
  onClick,
  size = "md",
  className = "",
  title,
}: SelectionCheckboxProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  const checkSizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
  };

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-center rounded-full border-2 transition-colors duration-300 ${
        isSelected
          ? "border-indigo-500 bg-indigo-500"
          : "border-indigo-400 bg-white hover:border-indigo-500 hover:bg-indigo-50 dark:border-slate-500 dark:bg-slate-800 dark:hover:border-indigo-400 dark:hover:bg-slate-700"
      } ${sizeClasses[size]} ${className}`}
      title={title}
    >
      {isSelected && (
        <Check className={`text-white ${checkSizeClasses[size]}`} />
      )}
    </div>
  );
}
