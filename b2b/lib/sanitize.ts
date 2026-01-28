// Input sanitization to prevent XSS attacks
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize string input by removing all HTML tags
 */
export function sanitize(input: string): string {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: [], // Remove all attributes
  });
}

/**
 * Sanitize string input but allow safe HTML (for rich text content)
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "title"],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === "string") {
      sanitized[key] = sanitize(value) as T[Extract<keyof T, string>];
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitize(item) : item
      ) as T[Extract<keyof T, string>];
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
