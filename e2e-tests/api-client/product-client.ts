import { APIRequestContext } from '@playwright/test'

export interface Product {
  id: number
  title: string
  price: number
  cat: string
}

/**
 * Wrapper over product catalog endpoints.
 * This is the api.demoblaze.com/entries endpoint that feeds the home page.
 */
export class ProductClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiUrl: string,
  ) {}

  /** List the products shown on the home page. */
  async listProducts(): Promise<Product[]> {
    const res = await this.request.get(`${this.apiUrl}/entries`)
    const body = await res.json()
    if (!Array.isArray(body?.Items)) {
      throw new Error(`entries failed: ${body?.errorMessage ?? 'unknown error'}`)
    }
    // Some titles carry trailing whitespace (e.g. "Sony vaio i7\n"), while the UI shows them trimmed.
    return body.Items.map((item: Product) => ({
      id: item.id,
      title: item.title.trim(),
      price: item.price,
      cat: item.cat,
    }))
  }
}
