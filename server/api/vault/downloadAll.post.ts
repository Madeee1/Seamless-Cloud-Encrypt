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

      const encryptedFilename = item.name
      const encryptedFileBlob = await fileResponse.blob()
      const encryptedFileBuffer = await encryptedFileBlob.arrayBuffer()
      const encryptedFileBase64 = arrayBufferToBase64(encryptedFileBuffer)
      downloadedFiles.push({
        name: encryptedFilename,
        content: encryptedFileBase64,
      })
      // saveFile(item.name, fileContent); // Implement your own save logic
    }
  }

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
    const { accessToken, cloudFolderName } = await readBody(event)

    const folderId = await getFolderIdByName(accessToken, cloudFolderName)
    const downloadedFiles = await downloadFilesInFolder(accessToken, folderId)

    return {
      ok: true,
      files: downloadedFiles,
    }
  } catch (error) {
    console.error('Error fetching file from OneDrive:', error)
  }
})
