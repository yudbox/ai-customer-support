/**
 * Intake Agent (Agent 1)
 *
 * Задача: Разобрать сырой email на структурированные данные
 * Технологии: TypeScript regex, без AI
 *
 * Что делает:
 * 1. Валидация input (email valid, subject/body не пустые)
 * 2. Извлечение order number (regex: #12345 или order 12345)
 * 3. Извлечение tracking number (UPS формат: 1Z...)
 * 4. Извлечение keywords
 * 5. Sanitization (удаление HTML, trim)
 * 6. Метаданные (timestamp, длина сообщения)
 */

import type { CustomerTicketInput, IntakeOutput } from "../../types";

// ===========================
// REGEX PATTERNS
// ===========================

/**
 * Order Number Patterns (реальный формат: ORD-2026-000323):
 * - ORD-2026-000323 (полный формат)
 * - ORD-2026-323 (без ведущих нулей)
 * - 000323 (только номер)
 * - order ORD-2026-323
 * - #ORD-2026-323
 */
const ORDER_NUMBER_REGEX =
  /(?:ORD-\d{4}-\d{1,6})|(?:order[:\s#]*ORD-\d{4}-\d{1,6})|(?:#ORD-\d{4}-\d{1,6})|(?:\b\d{6}\b)/i;

/**
 * Tracking Number Patterns (реальные форматы из данных):
 * - UPS: 1Z7THYSHGU5PSW (1Z + 12-14 alphanumeric)
 * - FedEx: TBARYOKFAVXX4EJ, FXQBKOIXCHZFWK (TB, FX prefix + alphanumeric)
 * - USPS: USGHZNVVODCCPS (US prefix)
 * - DHL: DHGQ37THEQUZQM (DH prefix)
 *
 * Универсальный паттерн: 10-20 символов, буквы+цифры
 */
const TRACKING_PATTERNS = {
  UPS: /\b1Z[0-9A-Z]{12,14}\b/i,
  FEDEX: /\b(?:TB|FX)[0-9A-Z]{10,16}\b/i,
  USPS: /\bUS[0-9A-Z]{10,18}\b/i,
  DHL: /\bDH[0-9A-Z]{10,18}\b/i,
  GENERIC: /\b[A-Z0-9]{12,20}\b/i, // fallback для других форматов
};

/**
 * Keywords для определения urgency/intent
 */
const URGENCY_KEYWORDS = [
  "urgent",
  "immediately",
  "asap",
  "emergency",
  "critical",
  "angry",
  "unacceptable",
  "disappointed",
  "frustrated",
  "waiting",
  "delayed",
  "late",
  "never",
  "still",
  "weeks",
  "days",
];

const ISSUE_KEYWORDS = {
  refund: ["refund", "money back", "return", "cancel order"],
  delivery: ["where is", "not arrived", "not delivered", "tracking", "delayed"],
  damaged: ["damaged", "broken", "defective", "wrong item"],
  payment: ["charged", "payment", "billing", "credit card"],
  question: ["how to", "help", "question", "wondering"],
};

// ===========================
// VALIDATION
// ===========================

/**
 * Простая email валидация
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидация входных данных
 */
function validateInput(input: CustomerTicketInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Email обязателен и валиден
  if (!input.email || !input.email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(input.email)) {
    errors.push("Invalid email format");
  }

  // Subject обязателен
  if (!input.subject || !input.subject.trim()) {
    errors.push("Subject is required");
  } else if (input.subject.length > 200) {
    errors.push("Subject too long (max 200 characters)");
  }

  // Body обязателен
  if (!input.body || !input.body.trim()) {
    errors.push("Message body is required");
  } else if (input.body.length < 10) {
    errors.push("Message too short (min 10 characters)");
  } else if (input.body.length > 5000) {
    errors.push("Message too long (max 5000 characters)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ===========================
// EXTRACTION
// ===========================

/**
 * Извлечь order number из текста
 */
function extractOrderNumber(text: string): string | undefined {
  const match = text.match(ORDER_NUMBER_REGEX);
  if (match) {
    // Возвращаем полное совпадение
    const orderNum = match[0];

    // Нормализуем формат: если только цифры, добавляем префикс
    if (/^\d{6}$/.test(orderNum)) {
      return `ORD-2026-${orderNum}`;
    }

    return orderNum;
  }
  return undefined;
}

/**
 * Извлечь tracking number из текста
 */
function extractTrackingNumber(text: string): string | undefined {
  // Проверяем все форматы в порядке специфичности
  for (const [carrier, pattern] of Object.entries(TRACKING_PATTERNS)) {
    const match = text.match(pattern);
    if (match) {
      // Возвращаем первое совпадение (кроме GENERIC)
      if (carrier !== "GENERIC") {
        return match[0];
      }
    }
  }

  // Если ничего не нашли, пробуем GENERIC паттерн
  const genericMatch = text.match(TRACKING_PATTERNS.GENERIC);
  if (genericMatch) {
    return genericMatch[0];
  }

  return undefined;
}

/**
 * Извлечь keywords из текста
 */
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundKeywords = new Set<string>();

  // Urgency keywords
  URGENCY_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      foundKeywords.add(keyword);
    }
  });

  // Issue keywords
  Object.entries(ISSUE_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        foundKeywords.add(keyword);
        foundKeywords.add(category); // добавляем и категорию
      }
    });
  });

  return Array.from(foundKeywords);
}

// ===========================
// SANITIZATION
// ===========================

/**
 * Удалить HTML теги и лишние пробелы
 */
function sanitizeText(text: string): string {
  return (
    text
      // Удаляем HTML теги
      .replace(/<[^>]*>/g, "")
      // Удаляем множественные пробелы
      .replace(/\s+/g, " ")
      // Trim
      .trim()
  );
}

// ===========================
// MAIN AGENT
// ===========================

/**
 * Intake Agent - главная функция
 */
export async function intakeAgent(
  input: CustomerTicketInput,
): Promise<IntakeOutput> {
  // 1. Валидация
  const validation = validateInput(input);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  // 2. Sanitization
  const cleanEmail = sanitizeText(input.email).toLowerCase();
  const cleanSubject = sanitizeText(input.subject);
  const cleanBody = sanitizeText(input.body);

  // 3. Извлечение данных
  const fullText = `${cleanSubject} ${cleanBody}`;
  const orderNumber = extractOrderNumber(fullText);
  const trackingNumber = extractTrackingNumber(fullText);
  const keywords = extractKeywords(fullText);

  // 4. Метаданные
  const messageLength = cleanSubject.length + cleanBody.length;
  const hasAttachments = Boolean(
    input.attachments && input.attachments.length > 0,
  );

  // 5. Output
  const output: IntakeOutput = {
    customer_email: cleanEmail,
    subject: cleanSubject,
    body: cleanBody,
    extracted_order_number: orderNumber,
    extracted_tracking_number: trackingNumber,
    keywords,
    message_length: messageLength,
    has_attachments: hasAttachments,
    parsed_at: new Date().toISOString(),
  };

  return output;
}

// ===========================
// EXPORTS
// ===========================

export {
  extractOrderNumber,
  extractTrackingNumber,
  extractKeywords,
  sanitizeText,
  isValidEmail,
  validateInput,
};
