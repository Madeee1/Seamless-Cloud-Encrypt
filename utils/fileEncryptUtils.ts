import { object } from 'yup'
import { fromBase64Url } from './encryptionUtils'

export async function encryptFile(
  fileToEncrypt: File,
  encryptionKeyObject: CryptoKey
): Promise<File> {
  // convert file to array buffer and generate iv
  const fileAB = await fileToEncrypt.arrayBuffer()
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // encrypt file content
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKeyObject,
    fileAB
  )

  const encoder = new TextEncoder()

  // get filename and iv for filename encryption
  const encodedFilename = encoder.encode(fileToEncrypt.name)
  const filenameiv = crypto.getRandomValues(new Uint8Array(12))

  // encrypt filename
  const encryptedFilename = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: filenameiv },
    encryptionKeyObject,
    encodedFilename
  )
  const filenameArray = new Uint8Array(encryptedFilename)
  const base64Filename = toBase64Url(filenameArray)
  const newFilename = base64Filename + '.bin'
  const fileNameivBase64 = toBase64Url(filenameiv)

  // return encrypted file
  return new File([iv, encryptedData], `${fileNameivBase64}${newFilename}`, {
    type: 'application/octet-stream',
  })
}

export async function decryptFile(
  encryptedFilename: String,
  encryptedFile: ArrayBuffer,
  encryptionKeyObject: CryptoKey
): Promise<File> {
  // extract index of orignal encrypted filename
  // const separatorIndex = new Uint8Array(encryptedFile).indexOf(
  //   '\n'.charCodeAt(0)
  // )

  // Extract the filename, which is b64. Convert to ArrayBuffer for decryption
  console.log('encrypted filename = ', encryptedFilename)
  const encryptedFilenameB64 = encryptedFilename.replace(/\.bin$/, '')
  const encFNameUInt8Array = fromBase64Url(encryptedFilenameB64)
  const encryptedFilenameAndIv = encFNameUInt8Array.buffer

  // extract filename iv from encrypted file
  const ivBuffer = encryptedFile.slice(0, 12)
  const iv = new Uint8Array(ivBuffer)

  // extract encrypted content from encrypted file
  const ciphertext = encryptedFile.slice(12)

  const filenameiv = encryptedFilenameAndIv.slice(0, 12)
  const encryptedFilenameOnly = encryptedFilenameAndIv.slice(12)

  let originalFilename = ''
  // decrypt filename
  try {
    const decryptedFilename = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: filenameiv },
      encryptionKeyObject,
      encryptedFilenameOnly
    )
    originalFilename = new TextDecoder().decode(decryptedFilename)
    // this.originalFilename.push(originalFilename)
  } catch (error) {
    console.error('error during filename decryption: ', error)
  }

  let decryptedBlob = null
  // decrypt file and create download URL
  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      encryptionKeyObject,
      ciphertext
    )
    decryptedBlob = new Blob([decryptedData], {
      type: 'text/plain',
    })
    // this.decryptedFileURL.push(URL.createObjectURL(decryptedBlob))
  } catch (error) {
    console.error('error during content decryption: ', error)
  }

  // Return a File object
  return new File([decryptedBlob], originalFilename, {
    type: 'text/plain',
  })
}
