import { serverSupabaseUser } from '#supabase/server'
import { arrayBufferToBase64 } from '~/utils/fileEncryptUtils'

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
    const { accessToken, fileName, cloudFolderName } = await readBody(event)

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:/${cloudFolderName}/${fileName}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    return {
      ok: true,
    }
  } catch (error) {
    console.error('Error deleting file from OneDrive:', error)
  }
})
