import { APIRequestContext } from '@playwright/test'
import { AuthClient } from './auth-client'
import { CartClient } from './cart-client'
import { ProductClient } from './product-client'

/** All API clients available to tests. Add new clients here. */
export interface ApiClients {
  auth: AuthClient
  cart: CartClient
  product: ProductClient
}

/** Builds every API client on top of a single shared request context. */
export function createApiClients(request: APIRequestContext, apiUrl: string): ApiClients {
  return {
    auth: new AuthClient(request, apiUrl),
    cart: new CartClient(request, apiUrl),
    product: new ProductClient(request, apiUrl),
  }
}
