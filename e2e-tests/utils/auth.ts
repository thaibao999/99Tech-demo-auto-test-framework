import { BrowserContext } from '@playwright/test'

export interface Credentials {
  username: string
  password: string
}

/** Demoblaze keeps the login session in this cookie. */
const SESSION_COOKIE = 'tokenp_'

/** Adds a logged-in session to a browser context, so the page opens already logged in. */
export async function addSessionCookie(params: {
  context: BrowserContext
  baseURL: string
  token: string
}): Promise<void> {
  const { context, baseURL, token } = params
  await context.addCookies([{ name: SESSION_COOKIE, value: token, url: baseURL }])
}
