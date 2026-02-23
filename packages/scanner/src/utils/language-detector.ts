import path from "path";
import {
  LANGUAGE_EXTENSIONS,
  SupportedLanguage,
} from "../types";

export function detectLanguage(filePath: string): SupportedLanguage | null {
  const ext = path.extname(filePath).toLowerCase();
  for (const [lang, exts] of Object.entries(LANGUAGE_EXTENSIONS)) {
    if (exts.includes(ext)) {
      return lang as SupportedLanguage;
    }
  }
  return null;
}

export function isApiFile(filePath: string, content: string): boolean {
  const lower = filePath.toLowerCase();
  const apiPatterns = [
    /route/i,
    /controller/i,
    /handler/i,
    /endpoint/i,
    /api/i,
    /server/i,
    /app\.(js|ts|py|go|rb|php|java)$/i,
    /index\.(js|ts|py|go|rb|php|java)$/i,
  ];
  if (apiPatterns.some((p) => p.test(lower))) return true;

  const contentPatterns = [
    /express\(\)/,
    /fastify\(/,
    /koa\(\)/,
    /hapi\./,
    /flask\(/,
    /FastAPI\(/,
    /Django/,
    /gin\./,
    /echo\./,
    /fiber\./,
    /http\.HandleFunc/,
    /\@RestController/,
    /\@GetMapping/,
    /\@PostMapping/,
    /Route::get/,
    /Route::post/,
    /get\s*['"]\/.*['"]/,
    /post\s*['"]\/.*['"]/,
    /app\.(get|post|put|delete|patch)\s*\(/,
    /router\.(get|post|put|delete|patch)\s*\(/,
  ];
  return contentPatterns.some((p) => p.test(content));
}

export function getLanguageLabel(lang: SupportedLanguage): string {
  const labels: Record<SupportedLanguage, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    go: "Go",
    java: "Java",
    php: "PHP",
    ruby: "Ruby",
  };
  return labels[lang] ?? lang;
}
