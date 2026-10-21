import 'dotenv/config' // loads .env from the cwd; shell/CI values take precedence
import { z } from 'zod'
import { ENV_PROFILES, ENVIRONMENTS } from '@@e2e-tests/config/test-environments'

const missingPassword =
  'Missing TEST_ACCOUNT_PASSWORD. Set it in .env for local runs, or as a CI secret for pipelines.'

const schema = z.object({
  ENVIRONMENT: z.string().trim().toLowerCase().pipe(z.enum(ENVIRONMENTS)).default('qa'),
  BASE_URL: z.url().optional(),
  API_URL: z.url().optional(),
  TEST_ACCOUNT_PASSWORD: z.string({ error: missingPassword }).min(1, missingPassword),
})

const result = schema.safeParse(process.env)
if (!result.success) {
  throw new Error(`Invalid test environment config:\n${z.prettifyError(result.error)}`)
}
const env = result.data
const profile = ENV_PROFILES[env.ENVIRONMENT]

function requireUrl(name: 'BASE_URL' | 'API_URL', value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name} for ENVIRONMENT="${env.ENVIRONMENT}". Set it in the shell/CI.`)
  }
  return value
}

export const ENVIRONMENT = env.ENVIRONMENT
/** Shared password for all test accounts. Never hardcode it in test data. */
export const TEST_ACCOUNT_PASSWORD = env.TEST_ACCOUNT_PASSWORD
export const BASE_URL = requireUrl('BASE_URL', env.BASE_URL ?? profile.baseUrl)
export const API_URL = requireUrl('API_URL', env.API_URL ?? profile.apiUrl)
