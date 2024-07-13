<template>
  <div class="my-2">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Update Password</h1>
    <UButton
      class="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      @click="confirmPassword = true"
    >
      Change Password
    </UButton>
    <div v-if="confirmPassword">
      <label for="confirm-password">Confirm Password:</label>
      <input
        id="confirm-password"
        v-model="passwordConfirmation"
        type="password"
        placeholder="Enter vault password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div v-if="confirmPassword">
      <label for="new-password">New Password:</label>
      <input
        id="new-password"
        v-model="newPassword"
        type="password"
        placeholder="Enter new password"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div v-if="confirmPassword">
      <label for="confirm-new-password">Confirm New Password:</label>
      <input
        id="confirm-new-password"
        v-model="newPasswordConfirmation"
        type="password"
        placeholder="Enter new password again"
        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <UButton class="mx-4 mt-4" @click="confirmUpdate">Confirm</UButton>
      <UButton
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        @click="confirmPassword = false"
        >Cancel</UButton
      >
    </div>
  </div>
</template>

<script setup>
import bcrypt from 'bcryptjs'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()

const cryptoKeyObj = vault.key
const confirmPassword = ref(false)
const accessToken = sessionStorage.getItem('access_token') || null
const passwordConfirmation = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const newKey = ref(null)
const fileBuffers = []
const originalFIles = ref(null)
const decryptedFiles = []
const fileInfo = []
const reencryptedFiles = []
let uploadSuccess = false

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function fromBase64Url(base64UrlString) {
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

async function confirmUpdate() {
  try {
    const response = await $fetch('/api/vault/auth/update', {
      method: 'POST',
      body: {
        password: passwordConfirmation.value,
        vaultId: vault.id,
      },
    })

    if (response.ok && newPassword.value == newPasswordConfirmation.value) {
      console.log('Downloading Files...')
      await downloadAll()
      console.log('Uploading Files...')
      console.log('New password = ', newPassword.value)
      console.log('type = ', typeof newPassword.value)
      newKey.value = await deriveKeyFromPassword(newPassword.value)
      await reencryptAll()
      await uploadAll()
      await deleteAll()
      await updatePassword()
      // decrypt all files inside
      // re encrpt all files inside
    } else {
      console.log('salah ajg')
    }
  } catch (error) {
    if (!error.response) {
      console.error(error)
    } else if (error.response.status === 401) {
      alert('Wrong password, try again!')
    } else if (error.response.status === 500) {
      alert('Server error, try again later!')
    }
  }
}

async function updatePassword() {
  const saltRounds = 10
  const hashPass = await bcrypt.hash(newPassword.value, saltRounds)

  const { data, error } = await supabase
    .from('vault')
    .update({
      hashed_password: hashPass,
    })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
    .select()

  if (error) {
    console.error(error)
  } else {
    navigateTo('/dashboard')
  }
}

async function downloadAll() {
  let decryptedContent = ''
  let originalFilename = ''

  const response = await $fetch('/api/vault/downloadAll', {
    method: 'POST',
    body: {
      accessToken: accessToken,
    },
  })

  console.log('response files length = ', response.files.length)
  originalFIles.value = response.files

  // for (let i = 0; i < response.files.length; i++) {
  //   const fileBuffer = base64ToArrayBuffer(response.files[i].content)
  //   console.log(response.files[i].name)
  //   fileBuffers.push({
  //     fileName: response.files[i].name,
  //     fileContent: fileBuffer,
  //   })
  // }

  const encoder = new TextEncoder()

  for (let i = 0; i < response.files.length; i++) {
    // decrypt filename
    const encryptedFilenameB64 = response.files[i].name.replace(/\.bin$/, '')
    const encFNameUInt8Array = fromBase64Url(encryptedFilenameB64)
    const encryptedFilename = encFNameUInt8Array.buffer

    const fileNameiv = encryptedFilename.slice(0, 12)
    const encryptedFilenameOnly = encryptedFilename.slice(12)

    console.log('filename iv = ', fileNameiv)
    console.log('encrypted filename = ', encryptedFilenameOnly)

    try {
      const decryptedFilename = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fileNameiv },
        cryptoKeyObj,
        encryptedFilenameOnly
      )
      originalFilename = new TextDecoder().decode(decryptedFilename)
      console.log('original filename = ', originalFilename)
    } catch (error) {
      console.error('error during filename decryption: ', error)
    }

    //decrypt file content
    const fileContentBuffer = base64ToArrayBuffer(response.files[i].content)

    const separatorIndex = new Uint8Array(fileContentBuffer).indexOf(
      '\n'.charCodeAt(0)
    )

    const ivBuffer = fileContentBuffer.slice(
      separatorIndex + 1,
      separatorIndex + 13
    )
    const iv = new Uint8Array(ivBuffer)
    const ciphertext = fileContentBuffer.slice(separatorIndex + 13)

    try {
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKeyObj,
        ciphertext
      )
      decryptedContent = decryptedData
      const plainText = new TextDecoder().decode(decryptedData)
      console.log('decrypted data = \n', plainText)
      console.log('')
    } catch (error) {
      console.error('error during content decryption: ', error)
    }

    decryptedFiles.push({
      fileName: originalFilename,
      fileContent: decryptedContent,
    })
  }
}

async function deleteAll() {
  // delete all current files in the one drive folder
  const deletePromises = originalFIles.value.map((file) => {
    const deleteUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${file.name}`
    return fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to delete ${file.name}: ${response.statusText}`)
      }
    })
  })

  await Promise.all(deletePromises)
  console.log('All files deleted successfully.')
}

async function deriveKeyFromPassword(password) {
  const salt = new Uint8Array([1, 2, 3, 4])
  console.log('Deriviing = ', password)
  const encoder = new TextEncoder()
  const encodedPassword = encoder.encode(password)
  console.log('successful encoding = ', encodedPassword)

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

  console.log('key derived successfully!')
  return key
}

async function reencryptAll() {
  console.log('RE-ENCRYPTING FILES... ')
  for (let i = 0; i < decryptedFiles.length; i++) {
    const decryptedBlob = new Blob([decryptedFiles[i].fileContent], {
      type: 'text/plain',
    })
    const decryptedFile = new File(
      [decryptedBlob],
      decryptedFiles[i].fileName,
      {
        type: 'text/plain',
      }
    )
    const decryptedFileBuffer = await decryptedFile.arrayBuffer()
    const contentiv = crypto.getRandomValues(new Uint8Array(12))

    // encrypt data using new derived key
    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: contentiv },
      newKey.value,
      decryptedFileBuffer
    )

    // encrypt filename using new derived key
    const fileNameBuffer = new TextEncoder().encode(decryptedFiles[i].fileName)
    const fileNameiv = crypto.getRandomValues(new Uint8Array(12))
    const encryptedFilename = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: fileNameiv },
      newKey.value,
      fileNameBuffer
    )

    const filenameArray = new Uint8Array(encryptedFilename)
    const encryptedFilenameB64 = toBase64Url(filenameArray)
    const fileNameivB64 = toBase64Url(fileNameiv)

    const newFileName = fileNameivB64 + encryptedFilenameB64 + '.bin'
    const fileContentivB64 = arrayBufferToBase64(contentiv)
    const fileContentB64 = arrayBufferToBase64(encryptedContent)

    reencryptedFiles.push({
      fileNameIndex: i,
      fileName: newFileName,
      fileContentiv: fileContentivB64,
      fileContent: fileContentB64,
    })
  }

  console.log('Re-encryption of all current uploaded files done.')
  console.log('Re-encrypted files = ', reencryptedFiles.length)
}

async function uploadAll() {
  try {
    if (!accessToken) {
      throw new Error('Access token not found')
    }

    const response = await $fetch('/api/vault/uploadAll', {
      method: 'POST',
      body: {
        accessToken: accessToken,
        files: reencryptedFiles,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to upload file: ${response.statusText} - ${errorText}`
      )
    }

    uploadSuccess = true
    console.log('File Upload Successful')

    // timer for how long alert last
    setTimeout(() => {
      uploadSuccess = false
    }, 10000)
  } catch (err) {
    console.error('Error details:', err)
  }
}

function toBase64Url(byteArray) {
  // Convert byteArray to a standard base64 string
  const base64String = window.btoa(String.fromCharCode.apply(null, byteArray))

  // Make the base64 string URL and filename safe
  const base64UrlString = base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return base64UrlString
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
</script>
