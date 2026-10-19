import { TEST_ACCOUNT_PASSWORD } from '@@e2e-tests/utils/env'

export const LOGIN_UI_ACCOUNT = { username: 'Login_Test_User', password: TEST_ACCOUNT_PASSWORD }
export const LOGIN_API_ACCOUNT = {
  username: 'Login_API_Test_User',
  password: TEST_ACCOUNT_PASSWORD,
}

/** TD-04: wrong password for an existing account. */
export const WRONG_PASSWORD = 'wrongPass!1'
