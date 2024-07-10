import { serverSupabaseUser } from '#supabase/server'

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function getFolderIdByName(
  accessToken: string,
  folderName: string
): Promise<string> {
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
    (item: any) => item.name === folderName && item.folder
  )

  if (!folder) {
    throw new Error(`Folder not found: ${folderName}`)
  }

  return folder.id
}

async function downloadFilesInFolder(accessToken: string, folderId: string) {
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
  const downloadedFiles = []

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

      const fileContent = await fileResponse.blob()
      // Handle the file content, for example, save it to the server
      console.log(`Downloaded file: ${item.name}`)
      console.log('object type = ', typeof item)
      downloadedFiles.push({ name: item.name, content: fileContent })
      // saveFile(item.name, fileContent); // Implement your own save logic
    }
  }

  console.log('number of downloaded files = ', folderData.value.length)
  console.log('type = ', typeof folderData.value)
  return downloadedFiles
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  // check user is authenticated
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  try {
    const { accessToken } = await readBody(event)
    const folderName = 'CryptAndGo'

    const folderId = await getFolderIdByName(accessToken, folderName)
    const downloadedFiles = await downloadFilesInFolder(accessToken, folderId)
    const downloadedFilesBase64 = []

    console.log('files length = ', downloadedFiles.length)

    for (const item of downloadedFiles) {
      console.log('file name = ', item.name)

      const encryptedFileBuffer = await item.content.arrayBuffer()
      const encryptedFileBase64 = arrayBufferToBase64(encryptedFileBuffer)

      downloadedFilesBase64.push({
        name: item.name,
        content: encryptedFileBase64,
      })
    }

    return {
      ok: true,
      files: downloadedFilesBase64,
    }
  } catch (error) {
    console.error('Error fetching file from OneDrive:', error)
  }
})
