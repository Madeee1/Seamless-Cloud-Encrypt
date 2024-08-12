// FILEPATH: /workspaces/Seamless-Cloud-Encrypt/utils/Tests/encryptionUtils.test.ts

import { describe, it, expect, beforeAll } from 'vitest'
import {
  encrypt,
  decrypt,
  deriveKeyFromPassword,
  toBase64Url,
  fromBase64Url,
} from '../encryptionUtils'

let encryptionKey: CryptoKey

beforeAll(async () => {
  encryptionKey = await deriveKeyFromPassword('test-password')
})

describe('encryptionUtils', () => {
  it('should derive a key from a password', async () => {
    const key = await deriveKeyFromPassword('test-password')
    expect(key).toBeInstanceOf(CryptoKey)
  })

  it('should encrypt and decrypt a string', async () => {
    const originalString = 'Hello, World!'
    const encryptedString = await encrypt(originalString, encryptionKey)
    const decryptedString = await decrypt(encryptedString, encryptionKey)
    expect(decryptedString).toBe(originalString)
  })

  it('should throw an error when trying to decrypt using the wrong key', async () => {
    const originalString = 'Hello, World!'
    const encryptedString = await encrypt(originalString, encryptionKey)
    const wrongKey = await deriveKeyFromPassword('wrong-password')
    await expect(decrypt(encryptedString, wrongKey)).rejects.toThrow()
  })

  it('should convert a byte array to a Base64 URL string and back', () => {
    const byteArray = new Uint8Array([72, 101, 108, 108, 111])
    const base64UrlString = toBase64Url(byteArray)
    const resultByteArray = fromBase64Url(base64UrlString)
    expect(resultByteArray).toEqual(byteArray)
  })
})
