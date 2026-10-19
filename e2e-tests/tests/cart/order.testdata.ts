import { TEST_ACCOUNT_PASSWORD } from '@@e2e-tests/utils/env'

export const SAMSUNG_GALAXY_S6 = { id: 1, price: 360 }
export const NOKIA_LUMIA_1520 = { id: 2, price: 820 }

/**
 * One dedicated account per test.describe group in order.spec.ts, not one shared account —
 * lets groups run in parallel against each other (no shared cart/session), while each group
 * runs its tests in order on one worker (mode: 'default') to avoid racing itself.
 */
export const ORDER_VALIDATION_ACCOUNT = {
  username: 'testUserOrderValidationV2',
  password: TEST_ACCOUNT_PASSWORD,
}
export const ORDER_PLACEMENT_ACCOUNT = {
  username: 'testUserOrderPlacementV2',
  password: TEST_ACCOUNT_PASSWORD,
}
export const ORDER_EMPTYCART_ACCOUNT = {
  username: 'testUserOrderEmptyCartV2',
  password: TEST_ACCOUNT_PASSWORD,
}
