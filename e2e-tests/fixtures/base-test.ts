import { BrowserContext, test as base } from '@playwright/test'
import { ApiClients, createApiClients } from '@@e2e-tests/api-client/create-api-clients'
import { API_URL } from '@@e2e-tests/utils/env'
import { addSessionCookie, Credentials } from '@@e2e-tests/utils/auth'
import { logger, Logger } from '@@e2e-tests/utils/logger'

export * from '@playwright/test'

type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>

const DEFAULT_ACCOUNT: Credentials = { username: '', password: '' }

interface TestOptions {
  /** Account used by authenticated tests. Override per describe with test.use(). */
  account: Credentials
  /** When true, each test's context starts logged in as `account`. Set per describe with test.use(). */
  authenticated: boolean
}

interface TestFixtures {
  log: Logger
}

interface WorkerFixtures {
  api: ApiClients
  /**
   * Returns this project's copy of a test account (username suffixed with the project name),
   * so projects never share a session or cart and can run in parallel.
   */
  toProjectAccount: (account: Credentials) => Credentials
  /** Logged-in storage states keyed by username. Lives for one worker, so a failed test's new worker logs in again. */
  sessionStates: Map<string, StorageState>
}

export const test = base.extend<TestOptions & TestFixtures, WorkerFixtures>({
  account: [DEFAULT_ACCOUNT, { option: true }],
  authenticated: [false, { option: true }],

  log: async ({}, use) => {
    await use(logger)
  },

  storageState: async (
    {
      storageState,
      authenticated,
      account: baseAccount,
      toProjectAccount,
      api,
      browser,
      baseURL,
      sessionStates,
    },
    use,
  ) => {
    if (!authenticated) {
      await use(storageState)
      return
    }

    const account = toProjectAccount(baseAccount)
    let state = sessionStates.get(account.username)
    if (state) {
      logger.step(`Reuse session of ${account.username}`)
    } else {
      // BlazeDemo may reset its data, so signup, check exists before logging in.
      await api.auth.signup(account)
      const token = await api.auth.login(account)
      const context = await browser.newContext()
      await addSessionCookie({ context, baseURL: baseURL!, token })
      state = await context.storageState()
      await context.close()
      sessionStates.set(account.username, state)
      logger.step(`Log in via API as ${account.username} successfully`)
    }

    await use(state)
  },

  sessionStates: [
    async ({}, use) => {
      await use(new Map())
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

  api: [
    async ({ playwright }, use) => {
      const requestContext = await playwright.request.newContext({ baseURL: API_URL })
      await use(createApiClients(requestContext, API_URL))
      await requestContext.dispose()
    },
    { scope: 'worker' },
  ],
})
