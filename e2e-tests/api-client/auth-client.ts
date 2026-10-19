import { APIRequestContext, APIResponse } from '@playwright/test'

export interface Credentials {
  username: string
  password: string
}

/**
 * Wrapper over auth endpoints.
 * This is the api.demoblaze.com/auth endpoints.
 */
export class AuthClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiUrl: string,
  ) {}

  /** encode the password to base64 for login. */
  private encodePassword(password: string): string {
    return Buffer.from(password, 'utf-8').toString('base64')
  }

  /** Signup for the user and ignore "This user already exist." so setup can call this freely. */
  async signup(user: Credentials): Promise<void> {
    const res = await this.request.post(`${this.apiUrl}/signup`, {
      data: { username: user.username, password: this.encodePassword(user.password) },
    })
    const body = await res.json()
    if (body?.errorMessage && body.errorMessage !== 'This user already exist.') {
      throw new Error(`Signup failed for ${user.username}: ${body.errorMessage}`)
    }
  }

  /**
   * Send a raw login request and return the response without parsing it.
   * Use for negative cases where the server may not reply with JSON (e.g. empty payload).
   */
  async sendLoginRequest(user: Credentials): Promise<APIResponse> {
    return this.request.post(`${this.apiUrl}/login`, {
      data: { username: user.username, password: this.encodePassword(user.password) },
    })
  }

  /**
   * Login for the user and return the token.
   */
  async login(user: Credentials): Promise<string> {
    const res = await this.sendLoginRequest(user)
    const body = await res.json()
    if (typeof body === 'string') {
      return body.replace('Auth_token: ', '')
    }
    throw new Error(`Login failed for ${user.username}: ${body?.errorMessage ?? 'unknown error'}`)
  }
}
