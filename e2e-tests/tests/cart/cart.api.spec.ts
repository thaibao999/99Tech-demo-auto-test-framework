import { randomUUID } from 'crypto'
import { test, expect } from '@@e2e-tests/fixtures/base-test'
import { CART_API_ACCOUNT, SAMSUNG_GALAXY_S6 } from './cart.testdata'

test.describe('Cart via API', () => {
  test.beforeAll(async ({ api, toProjectAccount }) => {
    // Seeding data since Demoblaze may reset data.
    await api.auth.signup(toProjectAccount(CART_API_ACCOUNT))
  })

  // Logged-in carts persist on the server, so start and finish each test with an empty cart.
  test.beforeEach(async ({ api, toProjectAccount }) => {
    await api.cart.clearCart(toProjectAccount(CART_API_ACCOUNT).username)
  })

  // Set by the guest test; cleared in afterEach so the guest cart is cleaned up even if the test fails.
  let guestCookie: string | undefined

  test.afterEach(async ({ api, toProjectAccount }) => {
    await api.cart.clearCart(toProjectAccount(CART_API_ACCOUNT).username)
    if (guestCookie) {
      await api.cart.clearCart(guestCookie)
      guestCookie = undefined
    }
  })

  test(
    'Add single product to cart (logged in)',
    { tag: ['@TC-CART-001', '@smoke'] },
    async ({ api, toProjectAccount }) => {
      const account = toProjectAccount(CART_API_ACCOUNT)
      let token: string

      await test.step('1. Log in to get a session token', async () => {
        token = await api.auth.login(account)
      })

      await test.step('2. Add Samsung galaxy s6 to the cart', async () => {
        const res = await api.cart.addToCart(token, SAMSUNG_GALAXY_S6.id, true)
        expect(res.ok(), 'Expect /addtocart to succeed for a logged-in user').toBe(true)
      })

      await test.step('3. Open the cart and verify it lists only Samsung galaxy s6', async () => {
        const items = await api.cart.viewCart(token, true)
        expect(
          items.map((item) => item.prod_id),
          'Expect cart to list only Samsung galaxy s6',
        ).toEqual([SAMSUNG_GALAXY_S6.id])
      })
    },
  )

  test(
    'Add product to cart as guest',
    { tag: ['@TC-CART-002', '@regression'] },
    async ({ api }) => {
      // A unique key gives this test its own empty guest cart.
      const cookie = `guest_cart_${randomUUID()}`
      guestCookie = cookie

      await test.step('1. Add Samsung galaxy s6 as a guest', async () => {
        const before = await api.cart.viewCart(cookie, false)
        expect(before, 'Expect guest cart to be empty before adding').toEqual([])

        const res = await api.cart.addToCart(cookie, SAMSUNG_GALAXY_S6.id, false)
        expect(res.ok(), 'Expect /addtocart to succeed for a guest').toBe(true)
      })

      await test.step('2. Open the cart as the same guest and verify the product is listed', async () => {
        const items = await api.cart.viewCart(cookie, false)
        expect(
          items.map((item) => item.prod_id),
          'Expect guest cart to list only Samsung galaxy s6',
        ).toEqual([SAMSUNG_GALAXY_S6.id])
      })
    },
  )
})
