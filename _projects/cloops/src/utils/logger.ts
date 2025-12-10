/**
 * Simple structured logger for CLoops
 *
 * Provides consistent logging with prefixes and levels.
 * Currently logs to console; can be extended for file logging later.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

let currentLevel: LogLevel = 'info';

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Set the logging level
 */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

/**
 * Check if a level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[currentLevel];
}

/**
 * Format a log message with timestamp and prefix
 */
function formatMessage(level: LogLevel, prefix: string, message: string): string {
  const timestamp = new Date().toISOString().slice(11, 19);
  const levelStr = level.toUpperCase().padEnd(5);
  return `[${timestamp}] [${levelStr}] [${prefix}] ${message}`;
}

/**
 * Create a logger with a specific prefix
 */
export function createLogger(prefix: string) {
  return {
    debug(message: string, data?: unknown): void {
      if (shouldLog('debug')) {
        console.log(formatMessage('debug', prefix, message));
        if (data) console.log(data);
      }
    },

    info(message: string, data?: unknown): void {
      if (shouldLog('info')) {
        console.log(formatMessage('info', prefix, message));
        if (data) console.log(data);
      }
    },

    warn(message: string, data?: unknown): void {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', prefix, message));
        if (data) console.warn(data);
      }
    },

    error(message: string, error?: unknown): void {
      if (shouldLog('error')) {
        console.error(formatMessage('error', prefix, message));
        if (error) {
          if (error instanceof Error) {
            console.error(`  ${error.message}`);
            if (error.stack) {
              console.error(error.stack);
            }
          } else {
            console.error(error);
          }
        }
      }
    },

    step(stepName: string, status: 'start' | 'done' | 'skip'): void {
      const icons = {
        start: '→',
        done: '✓',
        skip: '○',
      };
      const icon = icons[status];
      this.info(`${icon} ${stepName}`);
    },

    progress(current: number, total: number, message: string): void {
      this.info(`[${current}/${total}] ${message}`);
    },
  };
}

// Default logger
export const logger = createLogger('CLoops');

// Service-specific loggers
export const llmLogger = createLogger('LLM');
export const genLogger = createLogger('Gen');
export const storageLogger = createLogger('Storage');
