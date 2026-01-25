const isEn = (process.env.EN || '').toLowerCase() === 'true';

export const _ = (zh, en) => isEn ? en : zh;

export const logger = {
  info: (message, ...args) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args),
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};
