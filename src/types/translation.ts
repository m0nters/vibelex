import { z } from "zod";
import { AppException } from "./error";

export interface TranslationResult {
  text: string; // the word or sentence to be translated
  translation?: ParsedTranslation; // the parsed translation to specific data structure to display on UI
  loading: boolean; // while the AI is generating the translation, this is true, else false
  error?: AppException; // appear when can't call to the API service, parse fail,...
}

// All the zod schemas here is to check whether the parsed JSON from AI is valid
// according to our defined data structures
export interface PronunciationDetail {
  ipa: string[];
  tts_code: string;
}

export const PronunciationDetailSchema = z.object({
  ipa: z.array(z.string()),
  tts_code: z.string(),
});

export interface PronunciationVariants {
  // currently, only these 2, in the future, you can add more
  UK?: PronunciationDetail;
  US?: PronunciationDetail;
}

export const PronunciationVariantsSchema = z.record(
  z.string(),
  PronunciationDetailSchema,
);

export interface ExampleSentence {
  text: string;
  pronunciation?: string; // For non-Latin languages like Chinese (pinyin), Japanese (romaji)
  translation?: string; // Optional for same-language translations
}

export const ExampleSentenceSchema = z.object({
  text: z.string(),
  pronunciation: z.string().optional(),
  translation: z.string().optional(),
});

export interface SynonymGroup {
  label: string;
  items: string[];
}

export const SynonymGroupSchema = z.object({
  label: z.string(),
  items: z.array(z.string()),
});

export interface IdiomEntry {
  idiom: string;
  meaning: string;
  examples: ExampleSentence[];
}

export const IdiomEntrySchema = z.object({
  idiom: z.string(),
  meaning: z.string(),
  examples: z.array(ExampleSentenceSchema),
});

export interface IdiomGroup {
  label: string;
  items: IdiomEntry[];
}

export const IdiomGroupSchema = z.object({
  label: z.string(),
  items: z.array(IdiomEntrySchema),
});

export interface PhrasalVerbEntry {
  phrasal_verb: string;
  meaning: string;
  examples: ExampleSentence[];
}

export const PhrasalVerbEntrySchema = z.object({
  phrasal_verb: z.string(),
  meaning: z.string(),
  examples: z.array(ExampleSentenceSchema),
});

export interface PhrasalVerbGroup {
  label: string;
  items: PhrasalVerbEntry[];
}

export const PhrasalVerbGroupSchema = z.object({
  label: z.string(),
  items: z.array(PhrasalVerbEntrySchema),
});

export interface MeaningEntry {
  pronunciation: string | PronunciationVariants;
  part_of_speech: string;
  definition: string;
  synonyms?: SynonymGroup;
  idioms?: IdiomGroup;
  phrasal_verbs?: PhrasalVerbGroup;
  examples: ExampleSentence[];
}

export const MeaningEntrySchema = z.object({
  pronunciation: z.union([z.string(), PronunciationVariantsSchema]),
  part_of_speech: z.string(),
  definition: z.string(),
  synonyms: SynonymGroupSchema.optional(),
  idioms: IdiomGroupSchema.optional(),
  phrasal_verbs: PhrasalVerbGroupSchema.optional(),
  examples: z.array(ExampleSentenceSchema),
});

interface BaseTranslation {
  source_language_code: string; // ISO 639-1
  translated_language_code: string; // ISO 639-1
  source_language_main_country_code?: string; // ISO 3166-1 alpha-2
  translated_language_main_country_code?: string; // ISO 3166-1 alpha-2
  source_tts_language_code?: string; // IETF BCP 47
  translated_tts_language_code?: string; // IETF BCP 47
}

export const BaseTranslationSchema = z.object({
  source_language_code: z.string(),
  translated_language_code: z.string(),
  source_language_main_country_code: z.string().optional(),
  translated_language_main_country_code: z.string().optional(),
  source_tts_language_code: z.string().optional(),
  translated_tts_language_code: z.string().optional(),
});

export interface DictionaryEntry extends BaseTranslation {
  word: string;
  verb_forms?: string[];
  meanings: MeaningEntry[];
}

export const DictionaryEntrySchema = BaseTranslationSchema.extend({
  // in the newest version, we make the AI to genereate response that omits the
  // `word` field in order to reduce the output token

  // word: z.string(),
  verb_forms: z.array(z.string()).optional(),
  meanings: z.array(MeaningEntrySchema).min(1),
});

export interface SentenceTranslation extends BaseTranslation {
  text: string;
  translation: string;
}

export const SentenceTranslationSchema = BaseTranslationSchema.extend({
  // in the newest version, we make the AI to genereate response that omits the
  // `text` field in order to reduce the output token

  // text: z.string(),
  translation: z.string(),
});

export type ParsedTranslation = DictionaryEntry | SentenceTranslation;
