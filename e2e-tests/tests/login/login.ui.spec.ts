import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { HomePage } from '@@e2e-tests/pages/HomePage'
import { LoginModal } from '@@e2e-tests/ui-components/modal/LoginModal'
import { LOGIN_UI_ACCOUNT } from './login.testdata'

test.describe('Login', () => {
  test.beforeAll(async ({ api, toProjectAccount }) => {
    // Demoblaze may reset its data, so make sure the account exists.
    await api.auth.signup(toProjectAccount(LOGIN_UI_ACCOUNT))
  })

  test(
    'Verify user can log in with valid credentials',
    { tag: ['@TC-001', '@smoke'] },
    async ({ page, log, toProjectAccount }) => {
      const account = toProjectAccount(LOGIN_UI_ACCOUNT)
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)

      log.step('1. Go to home page')
      await homePage.goto()

      log.step('2. Click "Log in"')
      await homePage.openLoginModal()

      log.step('3. Enter username and password')
      await loginModal.enterCredentials(account.username, account.password)

      log.step('4. Click "Log in" to submit')
      await loginModal.signInAndWaitForReload()

      log.step('5. Verify user is logged in')
      await homePage.expectLoggedIn(account.username)
    },
  )

  test(
    'Verify user cannot log in with empty username and password',
    { tag: ['@TC-002', '@regression'] },
    async ({ page, log }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)

      log.step('1. Go to home page')
      await homePage.goto()

      log.step('2. Click "Log in"')
      await homePage.openLoginModal()

      log.step('3. Leave username and password empty, click "Log in"')
      const message = await loginModal.submitAndGetAlertMessage()

      log.step('4. Verify alert message')
      expect(message).toBe('Please fill out Username and Password.')
    },
  )
})
