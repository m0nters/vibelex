export function MainScreenBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="animate-blob-slow absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-linear-to-br from-indigo-300 to-purple-300 opacity-50 transition-colors duration-300 dark:from-indigo-700 dark:to-purple-700 dark:opacity-30"></div>
      <div className="animate-blob-slow animation-delay-2000 absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-linear-to-tr from-purple-300 to-indigo-300 opacity-30 transition-colors duration-300 dark:from-purple-700 dark:to-indigo-700 dark:opacity-20"></div>
    </div>
  );
}
