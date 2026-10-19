import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { ProductPage } from '@@e2e-tests/pages/ProductPage'
import { CartPage } from '@@e2e-tests/pages/CartPage'
import { CART_UI_ACCOUNT, NOKIA_LUMIA_1520, SAMSUNG_GALAXY_S6, SONY_VAIO_I5 } from './cart.testdata'

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
})
