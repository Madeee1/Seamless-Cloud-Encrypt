import { describe, it, expect, beforeAll } from 'vitest'

import { checkTokenRefresh } from '../vault-open'

describe('vault-open', () => {
  it('should check if token refresh function is called', async () => {
    const tokenExpiresIn = Date.now() + 4 * 60 * 1000
    const vaultId = 'test-vault-id'

    let reAuthenticateCalled = false

    const reAuthenticate = () => {
      reAuthenticateCalled = true
      return Promise.resolve()
    }
    const connectToOneDrive = () => {}

    await checkTokenRefresh(
      tokenExpiresIn,
      vaultId,
      reAuthenticate,
      connectToOneDrive
    )

    expect(reAuthenticateCalled).toBe(true)
  })
})
