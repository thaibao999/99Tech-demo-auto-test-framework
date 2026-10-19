import { Locator } from '@playwright/test'
import { BaseModal } from './BaseModal'
import { logger } from '../../utils/logger'

export interface CheckoutFormData {
  name?: string
  country?: string
  city?: string
  card?: string
  month?: string
  year?: string
}

export interface OrderReceipt {
  orderId: string
  totalUsd: number
  paymentCard: string
  customerName: string
  date: string
}

function readOrderReceipt(panelCopy: string): OrderReceipt {
  const orderIdPart = panelCopy.match(/Id:\s*(\d+)/)
  const totalUsdPart = panelCopy.match(/Amount:\s*(\d+)\s*USD/)
  const paymentCardPart = panelCopy.match(/Card Number:\s*([\s\S]*?)Name:/)
  const customerNamePart = panelCopy.match(/Name:\s*([\s\S]*?)Date:/)
  const datePart = panelCopy.match(/Date:\s*(.*)$/)
  return {
    orderId: orderIdPart?.[1] ?? '',
    totalUsd: totalUsdPart ? parseInt(totalUsdPart[1], 10) : NaN,
    paymentCard: paymentCardPart?.[1]?.trim() ?? '',
    customerName: customerNamePart?.[1]?.trim() ?? '',
    date: datePart?.[1]?.trim() ?? '',
  }
}

export class PlaceOrderModal extends BaseModal {
  protected readonly root: Locator = this.page.getByRole('dialog', { name: 'Place order' })
  protected readonly submitButton: Locator = this.root.getByRole('button', { name: 'Purchase' })
  protected readonly closeButton: Locator = this.root.getByRole('button', { name: 'Close' })
  private readonly nameInput: Locator = this.formGroup('Name:').getByRole('textbox')
  private readonly countryInput: Locator = this.formGroup('Country:').getByRole('textbox')
  private readonly cityInput: Locator = this.formGroup('City:').getByRole('textbox')
  private readonly cardInput: Locator = this.formGroup('Credit card:').getByRole('textbox')
  private readonly monthInput: Locator = this.formGroup('Month:').getByRole('textbox')
  private readonly yearInput: Locator = this.formGroup('Year:').getByRole('textbox')
  private readonly purchaseSuccessHeading: Locator = this.page.getByRole('heading', {
    name: 'Thank you for your purchase!',
  })
  private readonly purchaseReceiptLine: Locator = this.page
    .getByRole('paragraph')
    .filter({ hasText: /^Id:\s*\d+/ })
  // SweetAlert adds `visible` after the heading is already showing; clicking OK before that is ignored.
  private readonly receiptPanel: Locator = this.page.locator('.sweet-alert.visible')
  private readonly receiptOkButton: Locator = this.page.getByRole('button', {
    name: 'OK',
    exact: true,
  })

  async inputCheckoutFields(details: CheckoutFormData): Promise<void> {
    if (details.name !== undefined) await this.nameInput.fill(details.name)
    if (details.country !== undefined) await this.countryInput.fill(details.country)
    if (details.city !== undefined) await this.cityInput.fill(details.city)
    if (details.card !== undefined) await this.cardInput.fill(details.card)
    if (details.month !== undefined) await this.monthInput.fill(details.month)
    if (details.year !== undefined) await this.yearInput.fill(details.year)
    logger.step('Input checkout fields successfully')
  }

  async confirmPurchase(): Promise<OrderReceipt> {
    await this.submitButton.click()
    await this.purchaseSuccessHeading.waitFor()
    await this.receiptPanel.waitFor()
    const successMessage = (await this.purchaseReceiptLine.textContent()) ?? ''
    logger.step('Purchase completed; receipt text captured from success overlay')
    return readOrderReceipt(successMessage)
  }

  /** Dismiss the purchase receipt with OK. The site then redirects to the Home page. */
  async closeReceipt(): Promise<void> {
    await this.receiptOkButton.click()
    logger.step('Close purchase receipt with OK successfully')
  }
}
