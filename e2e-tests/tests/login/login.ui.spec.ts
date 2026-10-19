import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { HomePage } from '@@e2e-tests/pages/HomePage'
import { LoginModal } from '@@e2e-tests/ui-components/modal/LoginModal'
import { LOGIN_UI_ACCOUNT, WRONG_PASSWORD } from './login.testdata'

test.describe('Login - UI', () => {
  test.beforeAll(async ({ api, toProjectAccount }) => {
    // Seeding data since Demoblaze may reset data.
    await api.auth.signup(toProjectAccount(LOGIN_UI_ACCOUNT))
  })

  test(
    'Login with valid credentials',
    { tag: ['@TC-LOGIN-001', '@smoke'] },
    async ({ page, log, toProjectAccount }) => {
      const account = toProjectAccount(LOGIN_UI_ACCOUNT)
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)

      await test.step('1. Go to home page', async () => {
        await homePage.goto()
      })

      await test.step('2. Open login modal, enter credentials and submit', async () => {
        log.step('2.1. Click "Log in" to open login modal')
        await homePage.openLoginModal()

        log.step('2.2. Enter username and password in the login modal')
        await loginModal.enterCredentials(account.username, account.password)

        log.step('2.3. Click "Log in" to submit form')
        await loginModal.signInAndWaitForReload()
      })

      await test.step('3. Verify modal is closed and user is logged in', async () => {
        await loginModal.expectClosed()
        await homePage.expectLoggedIn(account.username)
      })
    },
  )

  test(
    'Login with both fields empty shows validation alert',
    { tag: ['@TC-LOGIN-014', '@regression'] },
    async ({ page, log }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)

      await test.step('1. Go to home page', async () => {
        await homePage.goto()
      })

      await test.step('2. Open login modal and click "Log in" with no input', async () => {
        log.step('2.1. Click "Log in" to open login modal')
        await homePage.openLoginModal()

        log.step('2.2. Click "Log in" without entering anything')
        const { alertMessage, loginRequestCount } = await loginModal.submitAndCountLoginRequests()

        expect(alertMessage, 'Expect validation alert for empty fields').toBe(
          'Please fill out Username and Password.',
        )
        expect(loginRequestCount, 'Expect no POST /login request to be sent').toBe(0)
      })

      await test.step('3. Verify user is not logged in', async () => {
        await homePage.expectUserIsLoggedOut()
      })
    },
  )

  test(
    'Login with wrong password shows "Wrong password." alert',
    { tag: ['@TC-LOGIN-017', '@regression'] },
    async ({ page, log, toProjectAccount }) => {
      const account = toProjectAccount(LOGIN_UI_ACCOUNT)
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)

      await test.step('1. Go to home page', async () => {
        await homePage.goto()
      })

      await test.step('2. Open login modal and enter the wrong password', async () => {
        log.step('2.1. Click "Log in" to open login modal')
        await homePage.openLoginModal()

        log.step('2.2. Enter an existing username with a wrong password')
        await loginModal.enterCredentials(account.username, WRONG_PASSWORD)
      })

      await test.step('3. Submit and verify the "Wrong password." alert', async () => {
        log.step('3.1. Click "Log in" to submit form')
        // The wrong-password alert comes after a server round trip (~9s observed on the live site).
        const message = await loginModal.submitAndGetAlertMessage(30_000)

        expect(message, 'Expect "Wrong password." alert').toBe('Wrong password.')
      })

      await test.step('4. Verify user is not logged in', async () => {
        await homePage.expectUserIsLoggedOut()
      })
    },
  )
})
