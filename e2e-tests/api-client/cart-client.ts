import { APIRequestContext, APIResponse } from '@playwright/test'
import { randomUUID } from 'crypto'

export interface CartItem {
  cookie: string
  id: string
  prod_id: number
}

/**
 * Wrapper over cart endpoints.
 * This is the api.demoblaze.com/cart endpoints.
 *
 * The cart is keyed differently for each shopper:
 * - Logged in: `flag` is true and `cookie` is the session token (the server resolves it to the username).
 * - Guest: `flag` is false and `cookie` is the raw `document.cookie` string. Empty cookies share one cart.
 */
export class CartClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiUrl: string,
  ) {}

  /** Add one product to a cart. Returns the raw response so the caller can assert on it. */
  async addToCart(cookie: string, productId: number, flag: boolean): Promise<APIResponse> {
    return this.request.post(`${this.apiUrl}/addtocart`, {
      data: { id: randomUUID(), cookie, prod_id: productId, flag },
    })
  }

  /** List the items in a cart. Uses the same cookie/flag rules as addToCart. */
  async viewCart(cookie: string, flag: boolean): Promise<CartItem[]> {
    const res = await this.request.post(`${this.apiUrl}/viewcart`, { data: { cookie, flag } })
    const body = await res.json()
    if (!Array.isArray(body?.Items)) {
      throw new Error(`viewcart failed: ${body?.errorMessage ?? 'unknown error'}`)
    }
    return body.Items
  }

  /** Clear the cart for a username (logged in) or a guest cookie string. */
  async clearCart(cookie: string): Promise<void> {
    await this.request.post(`${this.apiUrl}/deletecart`, { data: { cookie } })
  }
}
