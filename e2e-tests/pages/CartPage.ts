import { Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { BaseTable } from '@@e2e-tests/ui-components/table/BaseTable'
import { logger } from '@@e2e-tests/utils/logger'

export interface CartItem {
  title: string
  price: number
}

export class CartPage extends BasePage {
  private readonly cartTable: BaseTable = new BaseTable(this.page.locator('table:has(#tbodyid)'))
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

  /** Title and price of every row, in table order. Call waitForRowCount first so all rows have loaded. */
  async getItems(): Promise<CartItem[]> {
    const rows = await this.cartTable.getRows(['Title', 'Price'])
    logger.step(`Read ${rows.length} cart row(s) successfully`)
    return rows.map((row) => ({ title: row.Title, price: Number(row.Price) }))
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
}
