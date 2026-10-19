import { Locator, Page, expect } from '@playwright/test'
import { logger } from '../utils/logger'

export abstract class BasePage {
  protected readonly loginLink: Locator
  protected readonly signUpLink: Locator
  protected readonly logoutLink: Locator
  protected readonly welcomeText: Locator

  constructor(protected readonly page: Page) {
    this.loginLink = page.getByRole('link', { name: 'Log in', exact: true })
    this.signUpLink = page.getByRole('link', { name: 'Sign up', exact: true })
    this.logoutLink = page.getByRole('link', { name: 'Log out', exact: true })
    this.welcomeText = page.locator('#nameofuser')
  }

  protected async navigateTo(path: string): Promise<void> {
    const response = await this.page.goto(path)
    expect(response?.status(), `Expect navigation to "${path}" to succeed`).toBeLessThan(400)
  }

  /** Navbar chrome — present on every page. */
  async openLoginModal(): Promise<void> {
    await this.loginLink.click()
    logger.step('Open login modal successfully')
  }

  async expectLoggedIn(username: string): Promise<void> {
    await expect(this.welcomeText, `Expect navbar to show "Welcome ${username}"`).toHaveText(
      `Welcome ${username}`,
    )
    await expect(this.loginLink, 'Expect "Log in" link to be hidden once logged in').toBeHidden()
    await expect(this.signUpLink, 'Expect "Sign up" link to be hidden once logged in').toBeHidden()
    await expect(
      this.logoutLink,
      'Expect "Log out" link to be visible once logged in',
    ).toBeVisible()
    logger.step(`Verify logged in as ${username} successfully`)
  }

  async expectUserIsLoggedOut(): Promise<void> {
    await expect(this.welcomeText, 'Expect no "Welcome" text once logged out').toBeHidden()
    await expect(this.logoutLink, 'Expect "Log out" link to be hidden once logged out').toBeHidden()
    await expect(this.loginLink, 'Expect "Log in" link to be visible once logged out').toBeVisible()
    await expect(
      this.signUpLink,
      'Expect "Sign up" link to be visible once logged out',
    ).toBeVisible()
    logger.step('Verify logged out successfully')
  }
}
