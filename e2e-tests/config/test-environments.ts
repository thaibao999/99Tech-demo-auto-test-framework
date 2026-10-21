/** Valid values for ENVIRONMENT (shell / CI). */
export const ENVIRONMENTS = ['dev', 'qa', 'staging', 'production'] as const
export type Environment = (typeof ENVIRONMENTS)[number]

export type EnvProperties = {
  baseUrl?: string
  apiUrl?: string
}

/**
 * Default URLs per environment. Edit this file when onboarding new hosts.
 * Secrets and production URLs should still come from CI via BASE_URL / API_URL.
 */
export const ENV_PROFILES: Record<Environment, EnvProperties> = {
  dev: {
    baseUrl: 'https://dev.example.com',
    apiUrl: 'https://api.dev.example.com',
  },
  qa: {
    baseUrl: 'https://www.demoblaze.com',
    apiUrl: 'https://api.demoblaze.com',
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    apiUrl: 'https://api.staging.example.com',
  },
  production: {},
}
