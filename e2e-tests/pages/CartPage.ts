import { Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { BaseTable } from '@@e2e-tests/ui-components/table/BaseTable'
import { logger } from '@@e2e-tests/utils/logger'

// Test update something in this page will only trigger spec files using this page object.
export interface CartItem {
  title: string
  price: number
}

export class CartPage extends BasePage {
  private readonly cartTable: BaseTable = new BaseTable(this.page.getByRole('table'))
  // No accessible name ties #totalp to its "Total" heading, so the id is the only stable hook.
  private readonly totalAmount: Locator = this.page.locator('#totalp')
  private readonly placeOrderButton: Locator = this.page.getByRole('button', {
    name: 'Place Order',
  })

  async goto(): Promise<void> {
    await this.navigateTo('/cart.html')
  }

  /** Rows load incrementally — wait for the exact expected count, not just the first response. */
  async expectRowCount(expectedCount: number, timeout: number = 20000): Promise<void> {
    await this.cartTable.expectRowCount(expectedCount, timeout)
  }

  /** Rows load in no fixed order, so poll until the cart holds exactly these items in any order. */
  async expectItems(expectedItems: CartItem[], timeout: number = 10000): Promise<void> {
    const byTitle = (a: CartItem, b: CartItem): number => a.title.localeCompare(b.title)
    await expect
      .poll(async () => (await this.readItems()).sort(byTitle), {
        message: `Expect cart to list ${expectedItems.map((item) => item.title).join(', ')}`,
        timeout,
      })
      .toEqual([...expectedItems].sort(byTitle))
    logger.step(`Verify cart lists ${expectedItems.length} item(s) successfully`)
  }

  /** The Total is filled in as rows load, so poll until it shows the expected sum. */
  async expectTotal(expectedTotal: number): Promise<void> {
    await expect(this.totalAmount, `Expect cart total to be ${expectedTotal}`).toHaveText(
      String(expectedTotal),
      { timeout: 15000 },
    )
    logger.step(`Verify cart total is ${expectedTotal} successfully`)
  }

  async openPlaceOrder(): Promise<void> {
    await this.placeOrderButton.click()
    logger.step('Open Place Order modal successfully')
  }

  private async readItems(): Promise<CartItem[]> {
    const rows = await this.cartTable.getRows(['Title', 'Price'])
    return rows.map((row) => ({ title: row.Title, price: Number(row.Price) }))
  }
}
