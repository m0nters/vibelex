import { SiFacebook, SiGithub } from "react-icons/si";

export function ThankYouActions() {
  const handleGithub = () => {
    window.open("https://github.com/m0nters/", "_blank");
  };

  const handleFacebook = () => {
    window.open("https://www.facebook.com/100092245352348", "_blank");
  };

  // const handlePatreon = () => {
  //   window.open("https://patreon.com/m0nters", "_blank");
  // };

  return (
    <div className="flex flex-col justify-center gap-4 sm:flex-row">
      <button
        onClick={handleGithub}
        className="group flex transform cursor-pointer items-center justify-center gap-3 rounded-2xl border border-gray-700 bg-[#15191f] px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-gray-500 hover:shadow-lg"
      >
        <SiGithub className="h-5 w-5" />
        GitHub
      </button>
      <button
        onClick={handleFacebook}
        className="group flex transform cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#0866FF] px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#0056b3] hover:shadow-lg"
      >
        <SiFacebook className="h-5 w-5" />
        Facebook
      </button>

      {/* <button
        onClick={handlePatreon}
        className="group flex transform cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3 font-medium text-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-gray-200 hover:shadow-lg dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <SiPatreon className="h-5 w-5 text-black" />
        Patreon
      </button> */}
    </div>
  );
}
