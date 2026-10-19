type LogLevel = 'INFO' | 'STEP' | 'WARN' | 'ERROR'

const write = (level: LogLevel, message: string): void => {
  const worker = process.env.TEST_PARALLEL_INDEX ?? 'main'
  const time = new Date().toISOString().slice(11, 23)
  const print = level === 'WARN' || level === 'ERROR' ? console.error : console.log
  print(`${time} [w${worker}] ${`[${level}]`.padEnd(7)} ${message}`)
}

export const logger = {
  info: (message: string) => write('INFO', message),
  step: (message: string) => write('STEP', message),
  warn: (message: string) => write('WARN', message),
  error: (message: string) => write('ERROR', message),
}

export type Logger = typeof logger
