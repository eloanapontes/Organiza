function write(level, message, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    service: 'organiza-api',
    level,
    message,
    ...context
  }
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry))
}

export const logger = {
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, context) => write('error', message, context)
}
