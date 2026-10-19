import { TEST_ACCOUNT_PASSWORD } from '@@e2e-tests/utils/env'

/** Product ids, titles and prices as listed on the demo store. */
export const SAMSUNG_GALAXY_S6 = { id: 1, title: 'Samsung galaxy s6', price: 360 }
export const NOKIA_LUMIA_1520 = { id: 2, title: 'Nokia lumia 1520', price: 820 }
export const SONY_VAIO_I5 = { id: 8, title: 'Sony vaio i5', price: 790 }

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
