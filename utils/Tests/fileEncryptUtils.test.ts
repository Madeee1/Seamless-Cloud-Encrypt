// FILEPATH: /workspaces/Seamless-Cloud-Encrypt/utils/Tests/encryptionUtils.test.ts

import { describe, it, expect, beforeAll } from 'vitest'
import {
  encryptFile,
  decryptFile,
  base64ToArrayBuffer,
  arrayBufferToBase64,
} from '../fileEncryptUtils'
import { deriveKeyFromPassword } from '../encryptionUtils'

let encryptionKey: CryptoKey

beforeAll(async () => {
  encryptionKey = await deriveKeyFromPassword('test-password')
})

describe('fileEncryptUtils', () => {
  it('should encrypt and decrypt a file', async () => {
    const fileContent = new Blob(['Hello, world!'], { type: 'text/plain' })
    const fileName = 'example.txt'
    const originalFile = new File([fileContent], fileName, {
      type: 'text/plain',
    })
    const encryptedFile = await encryptFile(originalFile, encryptionKey)
    const encryptedFileBuffer = await encryptedFile.arrayBuffer()
    const decryptedFile = await decryptFile(
      encryptedFile.name,
      encryptedFileBuffer,
      encryptionKey
    )

    async function readFileAsText(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = () => {
          resolve(fileReader.result as string)
        }
        fileReader.onerror = () => {
          reject(fileReader.error)
        }
        fileReader.readAsText(file)
      })
    }

    async function compareFiles(file1: File, file2: File): Promise<Boolean> {
      try {
        const originalFileContent = await readFileAsText(originalFile)
        const decryptedFileContent = await readFileAsText(decryptedFile)

        return (
          file1.name === file2.name &&
          file1.type === file2.type &&
          file1.size === file2.size &&
          originalFileContent == decryptedFileContent
        )
      } catch (error) {
        console.error('Error reading file:', error)
        return false
      }
    }

    expect(await compareFiles(decryptedFile, originalFile)).toBe(true)
  })

  it('should convert an array buffer to a base64 string and back', async () => {
    const fileContent = new Blob(['Hello, world!'], { type: 'text/plain' })
    const fileName = 'example.txt'
    const originalFile = new File([fileContent], fileName, {
      type: 'text/plain',
    })
    const originalArrayBuffer = await originalFile.arrayBuffer()
    const ABtoBase64 = arrayBufferToBase64(originalArrayBuffer)
    const newArrayBuffer = base64ToArrayBuffer(ABtoBase64)

    expect(newArrayBuffer).toStrictEqual(originalArrayBuffer)
  })
})
