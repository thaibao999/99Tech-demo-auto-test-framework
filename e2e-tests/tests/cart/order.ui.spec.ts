import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { ProductPage } from '@@e2e-tests/pages/ProductPage'
import { CartPage } from '@@e2e-tests/pages/CartPage'
import { PlaceOrderModal } from '@@e2e-tests/ui-components/modal/PlaceOrderModal'
import {
  SAMSUNG_GALAXY_S6,
  ORDER_VALIDATION_ACCOUNT,
  ORDER_PLACEMENT_ACCOUNT,
  ORDER_EMPTYCART_ACCOUNT,
} from './order.testdata'

test.describe('Place Order — validation errors', () => {
  test.use({ account: ORDER_VALIDATION_ACCOUNT, authenticated: true })

  test(
    'Verify missing both Name and Card shows validation alert',
    { tag: ['@TC-010', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page')
      await cartPage.goto()

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Leave Name and Card empty, click "Purchase"')
      const message = await placeOrderModal.submitAndGetAlertMessage()

      log.step('4. Verify alert message')
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )

  test(
    'Verify missing Name only shows the same validation alert',
    { tag: ['@TC-011', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page')
      await cartPage.goto()

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Card only, leave Name empty')
      await placeOrderModal.inputCheckoutFields({ card: '123' })

      log.step('4. Click "Purchase"')
      const message = await placeOrderModal.submitAndGetAlertMessage()

      log.step('5. Verify alert message')
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )

  test(
    'Verify missing Card only shows the same validation alert',
    { tag: ['@TC-012', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page')
      await cartPage.goto()

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Name only, leave Card empty')
      await placeOrderModal.inputCheckoutFields({ name: 'Luha QA' })

      log.step('4. Click "Purchase"')
      const message = await placeOrderModal.submitAndGetAlertMessage()

      log.step('5. Verify alert message')
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )
})

test.describe('Place Order — placement', () => {
  test.describe.configure({ mode: 'default' })

  test.use({ account: ORDER_PLACEMENT_ACCOUNT, authenticated: true })

  // These tests add items to the cart, so empty it even if the test fails before purchasing.
  test.afterEach(async ({ api, account, toProjectAccount }) => {
    await api.cart.clearCart(toProjectAccount(account).username)
  })

  test(
    'Verify a valid order with only Name and Card succeeds',
    { tag: ['@TC-009', '@smoke'] },
    async ({ page, log }) => {
      const productPage = new ProductPage(page)
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('0. Precondition: add item to cart')
      await productPage.goto(SAMSUNG_GALAXY_S6.id)
      await productPage.addToCart()

      log.step('1. Go to Cart page')
      await cartPage.goto()
      await cartPage.waitForRowCount(1)

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Name and Card')
      await placeOrderModal.inputCheckoutFields({ name: 'Luha QA', card: '123' })

      log.step('4. Click "Purchase"')
      const receipt = await placeOrderModal.confirmPurchase()

      log.step('5. Verify order confirmation details')
      expect(receipt.customerName).toBe('Luha QA')
      expect(receipt.paymentCard).toBe('123')
      expect(receipt.totalUsd).toBe(SAMSUNG_GALAXY_S6.price)
      expect(receipt.orderId).toMatch(/^\d+$/)
    },
  )
})

test.describe('Place Order — empty cart defect', () => {
  test.use({ account: ORDER_EMPTYCART_ACCOUNT, authenticated: true })

  test(
    'Verify an order can be placed with an empty cart',
    { tag: ['@TC-013', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page with empty cart')
      await cartPage.goto()
      await cartPage.waitForRowCount(0)

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Name and Card')
      await placeOrderModal.inputCheckoutFields({ name: 'Empty Cart Test', card: '123' })

      log.step('4. Click "Purchase"')
      const receipt = await placeOrderModal.confirmPurchase()

      log.step('5. Verify order amount is 0')
      expect(receipt.totalUsd).toBe(0)
    },
  )
})
