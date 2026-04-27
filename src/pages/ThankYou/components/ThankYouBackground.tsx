export function ThankYouBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="animate-blob absolute -top-4 -left-4 h-72 w-72 rounded-full bg-indigo-200 opacity-50 mix-blend-multiply blur-xl filter"></div>
      <div className="animate-blob animation-delay-1000 absolute -top-4 -right-4 h-72 w-72 rounded-full bg-purple-200 opacity-50 mix-blend-multiply blur-xl filter"></div>
      <div className="animate-blob animation-delay-2000 absolute -bottom-12 left-30 h-72 w-72 rounded-full bg-blue-200 opacity-50 mix-blend-multiply blur-xl filter"></div>
    </div>
  );
}
