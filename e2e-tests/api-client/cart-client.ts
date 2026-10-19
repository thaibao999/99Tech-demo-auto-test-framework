import { APIRequestContext } from '@playwright/test'

/**
 * Wrapper over cart endpoints.
 * This is the api.demoblaze.com/cart endpoints.
 */
export class CartClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiUrl: string,
  ) {}

  /** clear the cart */
  async clearCart(username: string): Promise<void> {
    await this.request.post(`${this.apiUrl}/deletecart`, { data: { cookie: username } })
  }
}
