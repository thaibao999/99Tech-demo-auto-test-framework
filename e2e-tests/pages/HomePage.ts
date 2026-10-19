import { expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { logger } from '../utils/logger'

export class HomePage extends BasePage {
  async goto(): Promise<void> {
    await this.navigateTo('/')
  }

  /** Home is served as `index.html` (the site redirects there after closing the purchase receipt). */
  async expectOnHomePage(): Promise<void> {
    await expect(this.page, 'Expect to be redirected to the Home page').toHaveURL(/\/index\.html$/)
    logger.step('Verify on Home page successfully')
  }
}
