// Used to encrypt strings into strings, saving the IV in the first 16 characters of the string
export async function encrypt(
  stringToEncrypt: string,
  encryptionKeyObject: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder()
  const encodedString = encoder.encode(stringToEncrypt)

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKeyObject,
    encodedString
  )

  const stringArray = new Uint8Array(encryptedData)
  const base64String = toBase64Url(stringArray)
  const base64IV = toBase64Url(iv)

  return base64IV + base64String
}

// Used to decrypt strings that were encrypted with the encrypt function
export async function decrypt(
  stringToDecrypt: string,
  encryptionKeyObject: CryptoKey
): Promise<string> {
  const base64IV = stringToDecrypt.slice(0, 16)
  const base64String = stringToDecrypt.slice(16)

  const encStringUInt8Array = fromBase64Url(base64String)
  const encryptedString = encStringUInt8Array.buffer

  const ivUInt8Array = fromBase64Url(base64IV)
  const iv = ivUInt8Array.buffer

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    encryptionKeyObject,
    encryptedString
  )

  const decryptedString = new TextDecoder().decode(decryptedData)

  return decryptedString
}

export async function deriveKeyFromPassword(
  password: string
): Promise<CryptoKey> {
  const salt = new Uint8Array([1, 2, 3, 4])
  const encoder = new TextEncoder()
  const encodedPassword = encoder.encode(password)

  // Import key here is used to set the "structure" of the key
  const derivedKey = await crypto.subtle.importKey(
    'raw',
    encodedPassword,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 110000,
      hash: 'SHA-256',
    },
    derivedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  return key
}

export function toBase64Url(byteArray: Uint8Array): string {
  // Convert byteArray to a standard base64 string
  const numberArray = Array.from(byteArray)
  const base64String = window.btoa(String.fromCharCode(...numberArray))

  // Make the base64 string URL and filename safe
  const base64UrlString = base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return base64UrlString
}

export function fromBase64Url(base64UrlString: string): Uint8Array {
  // Replace URL-safe characters back to their original
  const base64String = base64UrlString.replace(/-/g, '+').replace(/_/g, '/')

  // Pad the base64 string to make its length a multiple of 4
  const paddedBase64String = base64String.padEnd(
    base64String.length + ((4 - (base64String.length % 4)) % 4),
    '='
  )

  // Decode base64 string to a UTF-16 string
  const decodedString = window.atob(paddedBase64String)

  // Convert decoded string to byte array
  const byteArray = new Uint8Array(decodedString.length)
  for (let i = 0; i < decodedString.length; i++) {
    byteArray[i] = decodedString.charCodeAt(i)
  }

  return byteArray
}
