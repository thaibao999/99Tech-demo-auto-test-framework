import { Locator } from '@playwright/test'
import { BaseModal } from './BaseModal'
import { logger } from '../../utils/logger'

export class LoginModal extends BaseModal {
  protected readonly root: Locator = this.page.getByRole('dialog', { name: 'Log in' })
  protected readonly submitButton: Locator = this.root.getByRole('button', { name: 'Log in' })
  protected readonly closeButton: Locator = this.root.getByRole('button', { name: 'Close' })
  private readonly usernameInput: Locator = this.formGroup('Username:').getByRole('textbox')
  private readonly passwordInput: Locator = this.formGroup('Password:').getByRole('textbox')

  async enterCredentials(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    logger.step(`Entered credentials on login modal for user "${username}"`)
  }

  /** Listen for POST `/login` before submit, then wait for the post-auth reload. */
  async signInAndWaitForReload(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/login') && res.request().method() === 'POST',
      ),
      this.submitButton.click(),
    ])
    await this.page.waitForLoadState('load')
    logger.step('Signed in via modal; auth response received and document load settled')
  }
}
