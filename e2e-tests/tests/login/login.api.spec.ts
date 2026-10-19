import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { LOGIN_API_ACCOUNT } from './login.testdata'

test.describe('Login via API', () => {
  test.beforeAll(async ({ api, toProjectAccount }) => {
    // Demoblaze may reset its data, so make sure the account exists for the wrong-password test.
    await api.auth.signup(toProjectAccount(LOGIN_API_ACCOUNT))
  })

  test(
    'Verify unknown username rejects with "User does not exist."',
    { tag: ['@TC-003', '@regression'] },
    async ({ api, log }) => {
      log.step('1. Attempt login with unknown username')
      await expect(
        api.auth.login({ username: `no_such_user_${Date.now()}`, password: 'anyPassword123' }),
      ).rejects.toThrow('User does not exist.')
    },
  )

  test(
    'Verify wrong password rejects with "Wrong password."',
    { tag: ['@TC-004', '@regression'] },
    async ({ api, log, toProjectAccount }) => {
      log.step('1. Attempt login with wrong password')
      await expect(
        api.auth.login({
          username: toProjectAccount(LOGIN_API_ACCOUNT).username,
          password: 'DefinitelyWrongPassword!',
        }),
      ).rejects.toThrow('Wrong password.')
    },
  )
})
