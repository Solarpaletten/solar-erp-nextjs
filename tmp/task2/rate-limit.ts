// lib/rate-limit.ts
// Rate limiting utility for Solar ERP API

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// In-memory store (в production используйте Redis)
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Проверка rate limit
 * @param key - уникальный ключ (например, IP или userId)
 * @param limit - максимум запросов за окно
 * @param windowMs - окно времени в миллисекундах
 */
export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Первый запрос или окно истекло
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { 
      count: 1, 
      resetTime: now + windowMs 
    });
    return { 
      success: true, 
      remaining: limit - 1, 
      reset: now + windowMs 
    };
  }

  // Превышен лимит
  if (record.count >= limit) {
    return { 
      success: false, 
      remaining: 0, 
      reset: record.resetTime 
    };
  }

  // Увеличиваем счётчик
  record.count++;
  return { 
    success: true, 
    remaining: limit - record.count, 
    reset: record.resetTime 
  };
}

/**
 * Rate limit для API роутов
 */
export function apiRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  return rateLimit(`api:${ip}`, limit, windowMs);
}

/**
 * Rate limit для аутентификации
 */
export function authRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 300000 // 5 минут
): RateLimitResult {
  return rateLimit(`auth:${identifier}`, limit, windowMs);
}

/**
 * Сброс rate limit для ключа
 */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

// Очистка устаревших записей каждую минуту
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000);
}
