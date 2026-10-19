import { Locator, Page } from '@playwright/test'
import { captureBrowserAlert } from '../../utils/browser-alert'
import { logger } from '../../utils/logger'

/**
 * Shared wrapper for Demoblaze Bootstrap-style modals (in-page overlays).
 * Subclasses set `root` (often `getByRole('dialog', …)`) plus submit/close buttons.
 * Native JS validation uses `submitAndGetAlertMessage()` → `captureBrowserAlert`, not modal locators.
 */
export abstract class BaseModal {
  /** Open modal container (ARIA dialog or legacy `#…Modal` id). */
  protected abstract readonly root: Locator
  protected abstract readonly submitButton: Locator
  protected abstract readonly closeButton: Locator

  constructor(protected readonly page: Page) {}

  protected formGroup(labelText: string): Locator {
    return this.root.locator('.form-group').filter({ hasText: labelText })
  }

  /** Click submit and return native `alert()` text when client-side validation blocks the action. */
  async submitAndGetAlertMessage(): Promise<string> {
    const message = await captureBrowserAlert(this.page, async () => {
      await this.submitButton.click()
    })
    logger.step(`Submit form, got browser alert message "${message}" successfully`)
    return message
  }
  async close(): Promise<void> {
    await this.closeButton.click()
    logger.step('Closed modal successfully')
  }
}
