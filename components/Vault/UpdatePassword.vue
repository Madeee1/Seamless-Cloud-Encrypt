<template>
  <div class="flex flex-col h-full px-4">
    <div class="w-full px-8 space-y-2">
      <h1
        class="text-3xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        Update <span class="text-third-blue">V</span>ault's
        <span class="text-third-blue">P</span>assword
      </h1>
      <UButton
        class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
        @click="confirmPassword = true"
      >
        Change Password
      </UButton>
      <div v-if="confirmPassword" class="mb-3 first-letter:text-third-blue">
        <label
          for="confirm-password"
          class="text-xl font-semibold text-gray-200"
          >Enter Password</label
        >
        <input
          id="confirm-password"
          v-model="passwordConfirmation"
          type="password"
          placeholder="Enter Vault's Password"
          class="w-full px-4 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div v-if="confirmPassword" class="mb-3 first-letter:text-third-blue">
        <label for="new-password" class="text-xl font-semibold text-gray-200"
          >New Password</label
        >
        <input
          id="new-password"
          v-model="newPassword"
          type="password"
          placeholder="Enter New Vault's Password"
          class="w-full px-4 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div v-if="confirmPassword" class="mb-3 first-letter:text-third-blue">
        <label
          for="confirm-new-password"
          class="text-xl font-semibold text-gray-200"
          >Confirm New Password</label
        >
        <input
          id="confirm-new-password"
          v-model="newPasswordConfirmation"
          type="password"
          placeholder="Re-enter New Vault's Password"
          class="w-full px-4 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div v-if="confirmPassword" class="pt-5 flex justify-end space-x-2">
        <UButton
          class="block text-center w-1/6 text-lg font-semibold bg-white hover:bg-gray-200 text-second-blue py-1 px-2 rounded"
          @click="confirmPassword = false"
          >Cancel</UButton
        ><UButton
          class="block text-center w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
          @click="confirmUpdate"
          >Confirm</UButton
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  encrypt,
  decrypt,
  deriveKeyFromPassword,
  toBase64Url,
  fromBase64Url,
} from '~/utils/encryptionUtils'
import {
  encryptFile,
  decryptFile,
  base64ToArrayBuffer,
} from '~/utils/fileEncryptUtils'
import bcrypt from 'bcryptjs'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()

const cryptoKeyObj = vault.key
const confirmPassword = ref(false)
const accessToken = vault.cloudAccessToken
const cloudFolderName = vault.cloudFolderName
const passwordConfirmation = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const newKey = ref(null)
const newAccessToken = ref(null)
const newRefreshToken = ref(null)
const downloadedFiles = ref([])
const downloadedFileNames = ref([])
const decryptedFiles = ref([])
const reencryptedFiles = ref([])
const reencryptedFileNames = ref([])

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
      // 1. Download all current files in the cloud folder
      console.log('Downloading Files...')
      await downloadAll()

      // 2. Decrypt all the downloaded files
      console.log('Decrypting Files... ')
      await decryptAll()

      // 3. Derive a new key from the new password
      console.log('Deriving Key...')
      newKey.value = await deriveKeyFromPassword(newPassword.value)

      // 4. Re-encrypt all the decrypted files using the new key
      console.log('Re-encrypting Files... ')
      await reencryptAll()

      // 5. Upload all files to the cloud folder
      console.log('Uploading New Files... ')
      await uploadAll()

      // 6. Delete all the old files in the cloud folder
      console.log('Deleting Old Files... ')
      await deleteAll()

      // 7. Update access token and refresh token
      console.log('Updating Access Tokens... ')
      await updateAccessTokens()

      // 8. Update the hashed password attribute in the database
      console.log('Updating Database Password... ')
      await updatePassword()
    } else {
      alert('New password confirmation failed.')
      console.log('New password does not match with the confirmation.')
    }
  } catch (error) {
    if (!error.response) {
      console.error(error)
    } else if (error.response.status === 401) {
      alert('Wrong password, try again!')
    } else if (error.response.status === 500) {
      console.error(error)
      alert('Server error, try again later!')
    }
  }
}

async function updatePassword() {
  // Update supabase hashed password, access token, and refresh token
  const saltRounds = 10
  const hashPass = await bcrypt.hash(newPassword.value, saltRounds)

  const { data, error } = await supabase
    .from('vault')
    .update({
      hashed_password: hashPass,
      enc_cloud_access_token: newAccessToken.value,
      enc_cloud_refresh_token: newRefreshToken.value,
    })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
    .select()

  if (error) {
    console.error(error)
  } else {
    console.log(data)
    vault.$patch({
      name: data[0].name,
    })
    console.log('Vault password updated successfully.\n ')
    // vault.key = newKey.value
    alert('Vault password update successfull, vault will be locked now.')
    navigateTo('/dashboard')
  }
}

async function downloadAll() {
  // Get folder id to download all files inside
  const folderId = await getFolderIdByName()

  // Get list of files using folder id
  const folderResponse = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!folderResponse.ok) {
    throw new Error(
      `Failed to get folder contents: ${folderResponse.statusText}`
    )
  }

  const folderData = await folderResponse.json()

  // Download all files from the list of files
  for (const item of folderData.value) {
    if (item.file) {
      // Ensure it's a file
      const fileResponse = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/content`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!fileResponse.ok) {
        throw new Error(
          `Failed to download file: ${item.name} - ${fileResponse.statusText}`
        )
      }

      const encryptedFilename = item.name
      const encryptedFileBlob = await fileResponse.blob()
      const encryptedFileBuffer = await encryptedFileBlob.arrayBuffer()
      downloadedFiles.value.push({
        name: encryptedFilename,
        content: encryptedFileBuffer,
      })
      downloadedFileNames.value.push(encryptedFilename)
    }
  }

  console.log('All files downloaded successfully.\n ')
}

async function decryptAll() {
  try {
    const decryptionTasks = downloadedFiles.value.map(async (file) => {
      // decrypt all downloaded files
      const decryptedFile = await decryptFile(
        file.name,
        file.content,
        cryptoKeyObj
      )

      console.log('Decrypted: ', decryptedFile.name)
      return decryptedFile
    })

    const decryptedFilesResults = await Promise.all(decryptionTasks)
    decryptedFiles.value = decryptedFilesResults.filter((file) => file !== null)
    console.log('All files decrypted successfully.\n ')
  } catch (error) {
    console.error(error)
    throw new Error('Error during files decryption: ', error)
  }
}

async function deleteAll() {
  // Delete all current files in the one drive folder
  const response = await $fetch('/api/vault/deleteAll', {
    method: 'POST',
    body: {
      accessToken: accessToken,
      downloadedFiles: downloadedFileNames.value,
      cloudFolderName: cloudFolderName,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete ${file.name}: ${response.statusText}`)
  }

  console.log('All files deleted successfully.\n ')
}

async function updateAccessTokens() {
  // Move to backend?
  // Get current encrypted access and refresh tokens
  const { data: accessTokens, error: vaultError } = await supabase
    .from('vault')
    .select('enc_cloud_access_token, enc_cloud_refresh_token')
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
    .single()

  if (vaultError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }

  try {
    // Decrypt access token
    const decryptedAccessToken = await decrypt(
      accessTokens.enc_cloud_access_token,
      cryptoKeyObj
    )

    // Decrypt refresh token
    const decryptedRefreshToken = await decrypt(
      accessTokens.enc_cloud_refresh_token,
      cryptoKeyObj
    )

    // Reencrypt access token
    const reencryptedAccessToken = await encrypt(
      decryptedAccessToken,
      newKey.value
    )
    newAccessToken.value = reencryptedAccessToken

    // Reencrypt refresh token
    const reencryptedRefreshToken = await encrypt(
      decryptedRefreshToken,
      newKey.value
    )
    newRefreshToken.value = reencryptedRefreshToken

    console.log('Access Token and Refresh Token updated successfully.\n ')
  } catch (error) {
    throw new Error('Error during access tokens update.')
  }
}

async function reencryptAll() {
  // Re-encrypt all downloaded files with the new derived key
  try {
    const encryptionTasks = decryptedFiles.value.map(async (file) => {
      const encryptedFile = await encryptFile(file, newKey.value)
      console.log('Reencrypted ', file.name)

      return encryptedFile
    })

    const reencryptedFilesResults = await Promise.all(encryptionTasks)
    reencryptedFiles.value = reencryptedFilesResults.filter(
      (file) => file !== null
    )

    for (let i = 0; i < reencryptedFiles.value.length; i++) {
      reencryptedFileNames.value.push(reencryptedFiles.value[i].name)
    }

    console.log('All files re-encrypted successfully.\n ')
  } catch (error) {
    console.error(error)
    throw new Error('Error during files encryption: ', error)
  }
}

async function uploadAll() {
  // Upload all newly encrypted files to onedrive
  try {
    if (!accessToken) {
      throw new Error('Access token not found')
    }

    const response = await $fetch('/api/vault/uploadAll', {
      method: 'POST',
      body: {
        accessToken: accessToken,
        files: reencryptedFileNames.value,
        cloudFolderName: cloudFolderName,
      },
    })

    if (!response.ok) {
      throw new Error('Error in uploading files.')
    }

    for (let i = 0; i < response.uploadUrls.length; i++) {
      console.log('Uploading file ', i, ' = ', reencryptedFiles.value[i].name)

      // Upload the file to OneDrive using the upload session URL in chunks
      const chunkSize = 1024 * 1024 // 1 MB per chunk
      let start = 0

      while (start < reencryptedFiles.value[i].size) {
        console.log('Uploading chunks')
        const end = Math.min(start + chunkSize, reencryptedFiles.value[i].size)
        const chunk = reencryptedFiles.value[i].slice(start, end)

        const uploadResponse = await fetch(response.uploadUrls[i], {
          method: 'PUT',
          headers: {
            'Content-Range': `bytes ${start}-${end - 1}/${reencryptedFiles.value[i].size}`,
          },
          body: chunk,
        })

        if (!uploadResponse.ok && uploadResponse.status !== 308) {
          const errorText = await uploadResponse.text()
          throw new Error(
            `Failed to upload file: ${uploadResponse.status} - ${errorText}`
          )
        }

        start = end
      }
    }

    console.log('All files uploaded successfully.\n ')
  } catch (err) {
    console.error('Error during files upload.')
  }
}

async function getFolderIdByName() {
  const response = await fetch(
    'https://graph.microsoft.com/v1.0/me/drive/root/children',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to list folder contents: ${response.statusText}`)
  }

  const data = await response.json()
  const folder = data.value.find(
    (folder) => folder.name === cloudFolderName && folder.folder
  )

  if (!folder) {
    throw new Error(`Folder not found: ${cloudFolderName}`)
  }

  return folder.id
}
</script>
