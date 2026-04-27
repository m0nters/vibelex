import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PrivilegePageWarning() {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-start space-x-2">
      <div className="flex h-4 w-4 items-center justify-center">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
      </div>
      <p className="text-xs text-orange-700">
        {t("errors:privilegePageDescription")}
      </p>
    </div>
  );
}
