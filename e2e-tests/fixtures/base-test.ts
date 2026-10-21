import { test as base } from '@playwright/test'
import { ApiClients, createApiClients } from '@@e2e-tests/api-client/create-api-clients'
import { Product } from '@@e2e-tests/api-client/product-client'
import { API_URL } from '@@e2e-tests/utils/env'
import { addSessionCookie, Credentials } from '@@e2e-tests/utils/auth'
import { logger, Logger } from '@@e2e-tests/utils/logger'

export * from '@playwright/test'

const DEFAULT_ACCOUNT: Credentials = { username: '', password: '' }

interface TestOptions {
  /** Account used by authenticated tests and by `authToken`. Override per describe with test.use(). */
  account: Credentials
  /** When true, each test's context starts logged in as `account`. Set per describe with test.use(). */
  authenticated: boolean
}

interface TestFixtures {
  log: Logger
  /** Session token for this project's copy of `account`, for API tests that need a logged-in user. */
  authToken: string
}

interface WorkerFixtures {
  api: ApiClients
  /**
   * Returns this project's copy of a test account (username suffixed with the project name),
   * so projects never share a session or cart and can run in parallel.
   */
  toProjectAccount: (account: Credentials) => Credentials
  /**
   * Returns a session token for the account, logging in once per worker and reusing it afterwards.
   * Lives for one worker, so a failed test's new worker logs in again.
   */
  getSessionToken: (account: Credentials) => Promise<string>
  /**
   * Returns `count` distinct products from the live catalog, so tests don't break when the store's products change.
   * The catalog is fetched once per worker. Throws if the store lists fewer than `count` products.
   */
  pickProducts: (count: number) => Promise<Product[]>
}

export const test = base.extend<TestOptions & TestFixtures, WorkerFixtures>({
  account: [DEFAULT_ACCOUNT, { option: true }],
  authenticated: [false, { option: true }],

  log: async ({}, use) => {
    await use(logger)
  },

  authToken: async ({ account, toProjectAccount, getSessionToken }, use) => {
    await use(await getSessionToken(toProjectAccount(account)))
  },

  context: async (
    { context, authenticated, account, toProjectAccount, getSessionToken, baseURL },
    use,
  ) => {
    if (authenticated) {
      const token = await getSessionToken(toProjectAccount(account))
      await addSessionCookie({ context, baseURL: baseURL!, token })
    }
    await use(context)
  },

  getSessionToken: [
    async ({ api }, use) => {
      const tokens = new Map<string, string>()
      await use(async (account) => {
        const cached = tokens.get(account.username)
        if (cached) {
          logger.step(`Reuse session of ${account.username}`)
          return cached
        }
        // BlazeDemo may reset its data, so signup, check exists before logging in.
        await api.auth.signup(account)
        const token = await api.auth.login(account)
        tokens.set(account.username, token)
        logger.step(`Log in via API as ${account.username} successfully`)
        return token
      })
    },
    { scope: 'worker' },
  ],

  toProjectAccount: [
    async ({}, use, workerInfo) => {
      const suffix = workerInfo.project.name
      await use((account) => ({ ...account, username: `${account.username}_${suffix}` }))
    },
    { scope: 'worker' },
  ],

  pickProducts: [
    async ({ api }, use) => {
      let catalog: Promise<Product[]> | undefined
      await use(async (count) => {
        catalog ??= api.product.listProducts()
        const products = await catalog
        if (products.length < count) {
          throw new Error(`Need ${count} product(s) but the store lists only ${products.length}`)
        }
        return products.slice(0, count)
      })
    },
    { scope: 'worker' },
  ],

  api: [
    async ({ playwright }, use) => {
      const requestContext = await playwright.request.newContext({ baseURL: API_URL })
      await use(createApiClients(requestContext, API_URL))
      await requestContext.dispose()
    },
    { scope: 'worker' },
  ],
})
