import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Try Chrome extension clipboard API first (for extension context)
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.id
      ) {
        // Create a temporary textarea element for fallback copy
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        textarea.style.top = "-999999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } else {
        // Fallback to standard clipboard API
        await navigator.clipboard.writeText(text);
      }

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`rounded-md p-1.5 text-gray-600 transition-colors duration-300 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 ${!isCopied ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700" : "cursor-not-allowed"} ${className}`}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
