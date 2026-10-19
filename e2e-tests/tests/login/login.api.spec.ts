import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { LOGIN_API_ACCOUNT, WRONG_PASSWORD } from './login.testdata'

test.describe('Login via API', () => {
  test.beforeAll(async ({ api, toProjectAccount }) => {
    // Seeding data since Demoblaze may reset data.
    await api.auth.signup(toProjectAccount(LOGIN_API_ACCOUNT))
  })

  test(
    'Login with valid credentials',
    { tag: ['@TC-LOGIN-001', '@smoke'] },
    async ({ api, toProjectAccount }) => {
      const account = toProjectAccount(LOGIN_API_ACCOUNT)
      let token: string

      await test.step('1. Send login request with valid credentials', async () => {
        token = await api.auth.login(account)
      })

      await test.step('2. Verify login returns a token', async () => {
        expect(token, 'Expect /login to return an auth token').toBeTruthy()
      })
    },
  )

  test(
    'Login with both fields empty is rejected',
    { tag: ['@TC-LOGIN-014', '@regression'] },
    async ({ api, log }) => {
      const res = await test.step('1. Send login request with empty username and password', () =>
        api.auth.sendLoginRequest({ username: '', password: '' }))

      await test.step('2. Verify login is rejected and no token is returned', async () => {
        const body = await res.text()
        log.info(`/login returned HTTP ${res.status()} for empty payload`)
        expect(res.ok(), 'Expect /login with empty fields not to succeed').toBe(false)
        expect(body, 'Expect no auth token in the response').not.toContain('Auth_token')
      })
    },
  )

  test(
    'Login with wrong password rejects with "Wrong password."',
    { tag: ['@TC-LOGIN-017', '@regression'] },
    async ({ api, log, toProjectAccount }) => {
      const account = toProjectAccount(LOGIN_API_ACCOUNT)

      log.step('1. Attempt login with the correct username and a wrong password')
      await expect(
        api.auth.login({ username: account.username, password: WRONG_PASSWORD }),
        'Expect /login to reject the wrong password',
      ).rejects.toThrow('Wrong password.')
    },
  )
})
