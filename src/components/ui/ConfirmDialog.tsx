import { renderMarkdownText } from "@/utils";
import { AlertTriangle, X } from "lucide-react";
import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/30",
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:hover:bg-red-500",
        };
      case "warning":
        return {
          icon: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
          confirmButton: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 dark:hover:bg-amber-500",
        };
      case "info":
        return {
          icon: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:hover:bg-blue-500",
        };
    }
  };

  const styles = getVariantStyles();

  // `overflow-hidden` at the most outer div acts like a scroll lock when the modal opens
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 backdrop-blur-sm"
      onClick={handleOverlayClick}
      style={{
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        className="animate-scale-in relative mx-4 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}
        >
          <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-slate-300">
          {title}
        </h3>

        {/* Message */}
        <p className="mb-6 text-center text-sm leading-relaxed text-gray-600 dark:text-slate-300">
          {renderMarkdownText(message)}
        </p>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
