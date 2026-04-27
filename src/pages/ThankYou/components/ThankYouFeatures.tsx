import { CheckCircle, Globe, Shield, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ThankYouFeatures() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: t("thankYou:features.aiTranslation.title"),
      description: t("thankYou:features.aiTranslation.description"),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t("thankYou:features.multiLanguage.title"),
      description: t("thankYou:features.multiLanguage.description"),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t("thankYou:features.professional.title"),
      description: t("thankYou:features.professional.description"),
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: t("thankYou:features.everywhere.title"),
      description: t("thankYou:features.everywhere.description"),
    },
  ];

  return (
    <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
      <h2 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-800">
        <Zap className="h-6 w-6 text-indigo-500" />
        {t("thankYou:featuresTitle")}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50"
          >
            <div className="mb-3 flex justify-center">
              <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                {feature.icon}
              </div>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
