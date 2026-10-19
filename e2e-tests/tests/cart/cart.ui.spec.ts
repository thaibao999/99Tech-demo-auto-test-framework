import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { ProductPage } from '@@e2e-tests/pages/ProductPage'
import { CartPage } from '@@e2e-tests/pages/CartPage'
import { HomePage } from '@@e2e-tests/pages/HomePage'
import { PlaceOrderModal } from '@@e2e-tests/ui-components/modal/PlaceOrderModal'
import {
  CART_UI_ACCOUNT,
  NOKIA_LUMIA_1520,
  SAMSUNG_GALAXY_S6,
  SONY_VAIO_I5,
  VALID_CHECKOUT,
} from './cart.testdata'

test.describe('Cart — UI', () => {
  test.use({ account: CART_UI_ACCOUNT, authenticated: true })

  // Logged-in carts persist on the server, so start and finish each test with an empty cart.
  test.beforeEach(async ({ api, account, toProjectAccount }) => {
    await api.cart.clearCart(toProjectAccount(account).username)
  })

  test.afterEach(async ({ api, account, toProjectAccount }) => {
    await api.cart.clearCart(toProjectAccount(account).username)
  })

  test(
    'Add single product to cart (logged in)',
    { tag: ['@TC-CART-001', '@smoke'] },
    async ({ page }) => {
      const productPage = new ProductPage(page)
      const cartPage = new CartPage(page)

      await test.step('1. Open Samsung galaxy s6 and add it to the cart', async () => {
        await productPage.goto(SAMSUNG_GALAXY_S6.id)
        await productPage.addToCart()
      })

      await test.step('2. Open Cart and verify the product row and total', async () => {
        await cartPage.goto()
        await cartPage.expectRowCount(1)

        expect(await cartPage.getItems(), 'Expect cart to list Samsung galaxy s6 at 360').toEqual([
          { title: SAMSUNG_GALAXY_S6.title, price: SAMSUNG_GALAXY_S6.price },
        ])
        await cartPage.expectTotal(SAMSUNG_GALAXY_S6.price)
      })
    },
  )

  test(
    'Add multiple different products',
    { tag: ['@TC-CART-003', '@regression'] },
    async ({ page }) => {
      const productPage = new ProductPage(page)
      const cartPage = new CartPage(page)
      const products = [SAMSUNG_GALAXY_S6, NOKIA_LUMIA_1520, SONY_VAIO_I5]

      for (const [index, product] of products.entries()) {
        await test.step(`${index + 1}. Open ${product.title} and add it to the cart`, async () => {
          await productPage.goto(product.id)
          await productPage.addToCart()
        })
      }

      await test.step('4. Open Cart and verify 3 rows and a total of 1970', async () => {
        await cartPage.goto()
        await cartPage.expectRowCount(products.length)

        expect(await cartPage.getItems(), 'Expect cart to list all three products').toEqual(
          expect.arrayContaining(products.map(({ title, price }) => ({ title, price }))),
        )
        await cartPage.expectTotal(1970)
      })
    },
  )

  test(
    'Successful purchase with all fields',
    { tag: ['@TC-CART-015', '@smoke'] },
    async ({ page }) => {
      const productPage = new ProductPage(page)
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)
      const homePage = new HomePage(page)

      await test.step('1. Add Samsung galaxy s6 to the cart', async () => {
        await productPage.goto(SAMSUNG_GALAXY_S6.id)
        await productPage.addToCart()
      })

      await test.step('2. Open Cart and click Place Order', async () => {
        await cartPage.goto()
        await cartPage.expectRowCount(1)
        await cartPage.expectTotal(SAMSUNG_GALAXY_S6.price)
        await cartPage.openPlaceOrder()
      })

      await test.step('3. Fill all fields with valid test data', async () => {
        await placeOrderModal.inputCheckoutFields(VALID_CHECKOUT)
      })

      await test.step('4. Click Purchase and verify the receipt', async () => {
        const receipt = await placeOrderModal.confirmPurchase()

        expect(receipt.orderId, 'Expect receipt to show a numeric order Id').toMatch(/^\d+$/)
        expect(receipt.totalUsd, 'Expect receipt amount to equal cart total').toBe(
          SAMSUNG_GALAXY_S6.price,
        )
        expect(receipt.paymentCard, 'Expect receipt to show the card number entered').toBe(
          VALID_CHECKOUT.card,
        )
        expect(receipt.customerName, 'Expect receipt to show the name entered').toBe(
          VALID_CHECKOUT.name,
        )
        expect(receipt.date, 'Expect receipt to show a purchase date').not.toBe('')
      })

      await test.step('5. Click OK and verify redirect to Home', async () => {
        await placeOrderModal.closeReceipt()
        await homePage.expectOnHomePage()
      })
    },
  )
})
