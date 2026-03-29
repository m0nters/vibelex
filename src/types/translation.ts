import { z } from "zod";
import { AppException } from "./error";

export interface TranslationResult {
  text: string; // the word or sentence to be translated
  translation?: ParsedTranslation; // the parsed translation to specific data structure to display on UI
  loading: boolean; // while the AI is generating the translation, this is true, else false
  error?: AppException; // appear when can't call to the API service, parse fail,...
}

// ==================== Zod Schemas (Source of Truth) ====================

export const PronunciationDetailSchema = z.object({
  ipa: z.array(z.string()),
  tts_code: z.string(),
});

export const PronunciationVariantsSchema = z.record(
  z.string(),
  PronunciationDetailSchema,
);

export const ExampleSentenceSchema = z.object({
  text: z.string(),
  pronunciation: z.string().optional(), // For non-Latin languages like Chinese (pinyin), Japanese (romaji)
  translation: z.string().optional(), // Optional for same-language translations
});

export const SynonymGroupSchema = z.object({
  label: z.string(),
  items: z.array(z.string()),
});

export const IdiomEntrySchema = z.object({
  idiom: z.string(),
  meaning: z.string(),
  examples: z.array(ExampleSentenceSchema),
});

export const IdiomGroupSchema = z.object({
  label: z.string(),
  items: z.array(IdiomEntrySchema),
});

export const PhrasalVerbEntrySchema = z.object({
  phrasal_verb: z.string(),
  meaning: z.string(),
  examples: z.array(ExampleSentenceSchema),
});

export const PhrasalVerbGroupSchema = z.object({
  label: z.string(),
  items: z.array(PhrasalVerbEntrySchema),
});

export const MeaningEntrySchema = z.object({
  pronunciation: z.union([z.string(), PronunciationVariantsSchema]),
  part_of_speech: z.string(),
  definition: z.string(),
  note: z.string().optional(), // For morphological transformations explanation (e.g., "số nhiều của **shelf**")
  synonyms: SynonymGroupSchema.optional(),
  idioms: IdiomGroupSchema.optional(),
  phrasal_verbs: PhrasalVerbGroupSchema.optional(),
  examples: z.array(ExampleSentenceSchema),
});

export const BaseTranslationSchema = z.object({
  source_language_code: z.string(), // ISO 639-1
  translated_language_code: z.string(), // ISO 639-1
  source_language_main_country_code: z.string().optional(), // ISO 3166-1 alpha-2
  translated_language_main_country_code: z.string().optional(), // ISO 3166-1 alpha-2
  source_tts_language_code: z.string().optional(), // IETF BCP 47
  translated_tts_language_code: z.string().optional(), // IETF BCP 47
});

export const VerbFormSchema = z.object({
  label: z.string(), // Category name in the translated language (e.g., "Thì quá khứ đơn", "Past tense")
  form: z.string(), // The actual verb form (e.g., "ran", "running")
});

export const DictionaryEntrySchema = BaseTranslationSchema.extend({
  word: z.string(), // the word to be translated in its normalized form
  verb_forms: z.array(VerbFormSchema).optional(),
  meanings: z.array(MeaningEntrySchema).min(1),
});

export const SentenceTranslationSchema = BaseTranslationSchema.extend({
  text: z.string().optional(), // injected post-parse by the hook, not from the API
  translation: z.string(),
});

// ==================== Inferred Types ====================

export type PronunciationDetail = z.infer<typeof PronunciationDetailSchema>;
export type PronunciationVariants = z.infer<typeof PronunciationVariantsSchema>;
export type ExampleSentence = z.infer<typeof ExampleSentenceSchema>;
export type SynonymGroup = z.infer<typeof SynonymGroupSchema>;
export type IdiomEntry = z.infer<typeof IdiomEntrySchema>;
export type IdiomGroup = z.infer<typeof IdiomGroupSchema>;
export type PhrasalVerbEntry = z.infer<typeof PhrasalVerbEntrySchema>;
export type PhrasalVerbGroup = z.infer<typeof PhrasalVerbGroupSchema>;
export type MeaningEntry = z.infer<typeof MeaningEntrySchema>;
export type VerbForm = z.infer<typeof VerbFormSchema>;
export type DictionaryEntry = z.infer<typeof DictionaryEntrySchema>;
export type SentenceTranslation = z.infer<typeof SentenceTranslationSchema>;

export type ParsedTranslation = DictionaryEntry | SentenceTranslation;
