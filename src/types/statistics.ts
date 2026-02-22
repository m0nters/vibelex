export interface LanguageData {
  [key: string]: string | number;
  name: string;
  value: number;
  percentage: string;
  code: string;
}

export type TabType = "source" | "target";
