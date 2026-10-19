import 'dotenv/config' // loads .env from the cwd; shell/CI values take precedence
import { ENV_PROFILES, ENVIRONMENTS, type Environment } from '@@e2e-tests/config/test-environments'

function parseEnvironment(): Environment {
  const raw = (process.env.ENVIRONMENT ?? 'qa').trim().toLowerCase()
  if (!(ENVIRONMENTS as readonly string[]).includes(raw)) {
    throw new Error(
      `Invalid ENVIRONMENT "${process.env.ENVIRONMENT}". Expected one of: ${ENVIRONMENTS.join(', ')}`,
    )
  }
  return raw as Environment
}

function resolveUrl(envVar: 'BASE_URL' | 'API_URL', profileValue: string | undefined): string {
  const fromEnv = process.env[envVar]?.trim()
  if (fromEnv) return fromEnv
  if (profileValue) return profileValue
  throw new Error(
    `Missing ${envVar} for ENVIRONMENT="${ENVIRONMENT}". Set ${envVar} in the shell/CI or add defaults in e2e-tests/config/test-environments.ts.`,
  )
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env for local runs, or as a CI secret for pipelines.`,
    )
  }
  return value
}

/** Shared password for all test accounts. Never hardcode it in test data. */
export const TEST_ACCOUNT_PASSWORD = requireEnv('TEST_ACCOUNT_PASSWORD')

export const ENVIRONMENT = parseEnvironment()

const profile = ENV_PROFILES[ENVIRONMENT]

export const BASE_URL = resolveUrl('BASE_URL', profile.baseUrl)
export const API_URL = resolveUrl('API_URL', profile.apiUrl)
