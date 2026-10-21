import { TEST_ACCOUNT_PASSWORD } from '@@e2e-tests/utils/env'

/** Dedicated accounts, one per cart spec file, so cart tests don't share a cart with each other or with order/login tests. */
export const CART_UI_ACCOUNT = { username: 'testUserCartUI', password: TEST_ACCOUNT_PASSWORD }
export const CART_API_ACCOUNT = { username: 'testUserCartAPI', password: TEST_ACCOUNT_PASSWORD }

/** Valid Place Order form data. 4111111111111111 is a standard test card number. */
export const VALID_CHECKOUT = {
  name: 'Bao Tester',
  country: 'Vietnam',
  city: 'Ho Chi Minh',
  card: '4111111111111111',
  month: '12',
  year: String(new Date().getFullYear() + 2),
}
