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
    const { accessToken, fileId } = await readBody(event)

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const encryptedFilename = response.url.split('/').pop()
    const encryptedFileBlob = await response.blob()
    const encryptedFileBuffer = await encryptedFileBlob.arrayBuffer()
    const encryptedFileBase64 = arrayBufferToBase64(encryptedFileBuffer)

    return {
      ok: true,
      encryptedFilename: encryptedFilename,
      encryptedBlob: encryptedFileBase64,
    }
  } catch (error) {
    console.error('Error fetching file from OneDrive:', error)
  }
})
