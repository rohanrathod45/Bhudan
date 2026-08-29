/* Minimal structured logger. */
const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function ts() {
  return new Date().toISOString();
}

function log(level, ...args) {
  const threshold = levels[process.env.LOG_LEVEL || 'info'] ?? levels.info;
  if (levels[level] <= threshold) {
    const line = `[${ts()}] ${level.toUpperCase()} ${args.join(' ')}`;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }
}

module.exports = {
  error: (...a) => log('error', ...a),
  warn: (...a) => log('warn', ...a),
  info: (...a) => log('info', ...a),
  debug: (...a) => log('debug', ...a),
};