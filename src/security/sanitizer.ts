export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}

export interface SanitizeOptions {
  maxLength?: number;
  stripHtml?: boolean;
  blockPatterns?: boolean;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /you\s+are\s+now/gi,
  /act\s+as/gi,
  /system\s+prompt/gi,
  /disregard/gi,
];

const HTML_TAG_REGEX = /<[^>]*>/;
const HTML_TAG_GLOBAL_REGEX = /<[^>]*>/g;

const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  maxLength: 10000,
  stripHtml: true,
  blockPatterns: true,
};

export function sanitizeInput(
  input: string,
  options?: SanitizeOptions,
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result = input;

  if (opts.stripHtml) {
    result = result.replace(HTML_TAG_GLOBAL_REGEX, "");
  }

  if (opts.blockPatterns) {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(result)) {
        throw new InputValidationError(
          `Input contains potentially harmful pattern: ${pattern.source}`,
        );
      }
    }

    if (opts.stripHtml) {
      if (HTML_TAG_REGEX.test(result)) {
        throw new InputValidationError(
          "Input contains embedded XML/HTML tags after stripping",
        );
      }
    }
  }

  if (result.length > opts.maxLength) {
    result = result.slice(0, opts.maxLength);
  }

  return result;
}
